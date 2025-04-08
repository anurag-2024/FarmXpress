const express= require('express');
const mergeRouter=express.Router();
const Route = require('../models/route');
const Truck=require('../models/truck')
const {companyAuth} =  require('../middlewares/auth');
const MergeablePair =  require('../models/mergeablePair');
const MergedSchedule= require('../models/mergedSchedule');


mergeRouter.get('/mergeableSchedule', companyAuth, async (req, res) => {
    try {
        const allRoutes = await Route.find();
        const allTrucks = await Truck.find();
    
        if (allRoutes.length === 0 || allTrucks.length === 0) {
            return res.json({ message: "No trucks available" });
        }
    
        const truckRoutesMap = new Map();
        allRoutes.forEach(route => {
            truckRoutesMap.set(route.truckId.toString(), route.stops);
        });
    
        let usedTrucks = new Set();
        let mergeablePairs = [];
    
        for (let i = 0; i < allTrucks.length; i++) {
            if (usedTrucks.has(allTrucks[i]._id.toString())) continue;
    
            for (let j = 0; j < allTrucks.length; j++) {
                if (i === j || usedTrucks.has(allTrucks[j]._id.toString())) continue;
    
                const truckA = allTrucks[i];
                const truckB = allTrucks[j];
    
                const stopsA = truckRoutesMap.get(truckA._id.toString()) || [];
                const stopsB = truckRoutesMap.get(truckB._id.toString()) || [];
    
                let biggerTruck, smallerTruck, biggerStops, smallerStops;
                if (truckA.totalCapacity >= truckB.totalCapacity) {
                    biggerTruck = truckA;
                    smallerTruck = truckB;
                    biggerStops = stopsA;
                    smallerStops = stopsB;
                } else {
                    biggerTruck = truckB;
                    smallerTruck = truckA;
                    biggerStops = stopsB;
                    smallerStops = stopsA;
                }
    
                if (!smallerStops.every(stop => biggerStops.includes(stop))) continue;
    
                let canMerge = true;
                for (let stop of smallerStops) {
                    const indexBig = biggerStops.indexOf(stop);
                    const indexSmall = smallerStops.indexOf(stop);
    
                    if (indexBig === -1 || indexSmall === -1) continue;
    
                    if (biggerTruck.remainingLoad[indexBig] < smallerTruck.currentLoad[indexSmall]) {
                        canMerge = false;
                        break;
                    }
                }
    
                if (canMerge) {
                    mergeablePairs.push({
                        truckOneId: biggerTruck._id.toString(),
                        truckOneLicensePlate: biggerTruck.licensePlate,
                        truckOneStops: biggerStops, // Add stops for Truck One
                        truckTwoId: smallerTruck._id.toString(),
                        truckTwoLicensePlate: smallerTruck.licensePlate,
                        truckTwoStops: smallerStops // Add stops for Truck Two
                    });
    
                    usedTrucks.add(biggerTruck._id.toString());
                    usedTrucks.add(smallerTruck._id.toString());
                    break;
                }
            }
        }
    
        if (mergeablePairs.length === 0) {
            return res.json({ message: "No mergeable truck pairs found" });
        }
    
        // Fetch existing pairs from the database
        const existingPairs = await MergeablePair.find();
    
        // Convert existing data to a Set for quick lookup
        const existingSet = new Set(existingPairs.map(pair => 
            `${pair.truckOneId}-${pair.truckTwoId}`
        ));
    
        // Filter out only the new pairs that are not in the database
        const newPairs = mergeablePairs.filter(pair => 
            !existingSet.has(`${pair.truckOneId}-${pair.truckTwoId}`)
        );
    
        if (newPairs.length > 0) {
            await MergeablePair.insertMany(newPairs);
        }
    
        res.json({ mergeablePairs });
    
    } catch (error) {
        console.error("Error fetching mergeable trucks:", error);
        // res.status(500).json({ error: "Internal Server Error",
            
        // });
        res.send(error.message);
    }
    
});


mergeRouter.get('/mergedSchedule', companyAuth, async (req, res) => {
    try {
        // Fetch all mergeable pairs from the database
        const mergeablePairs = await MergeablePair.find().populate('truckOneId').populate('truckTwoId');

        if (mergeablePairs.length === 0) {
            return res.json({ message: "No mergeable schedules found" });
        }

        let mergedSchedules = [];

        for (let pair of mergeablePairs) {
            // Fetch truck details
            const truckOne = await Truck.findById(pair.truckOneId);
            const truckTwo = await Truck.findById(pair.truckTwoId);

            if (!truckOne || !truckTwo) {
                continue;
            }

            let finalTruck;
            let finalCurrentLoad = [];
            let finalRemainingLoad = [];
            let allStops = [...new Set([...pair.truckOneStops, ...pair.truckTwoStops])];

            // Sorting stops based on occurrence in truckOne's schedule
            allStops.sort((a, b) => pair.truckOneStops.indexOf(a) - pair.truckOneStops.indexOf(b));

            // Choose the truck with the higher capacity
            finalTruck = truckOne.totalCapacity >= truckTwo.totalCapacity ? truckOne : truckTwo;
            let totalCapacity = finalTruck.totalCapacity; // Store the total capacity of the chosen truck

            // Calculate the final current load and remaining load at each stop
            for (let stop of allStops) {
                let indexOne = pair.truckOneStops.indexOf(stop);
                let indexTwo = pair.truckTwoStops.indexOf(stop);

                let loadOne = indexOne !== -1 ? truckOne.currentLoad[indexOne] || 0 : 0;
                let loadTwo = indexTwo !== -1 ? truckTwo.currentLoad[indexTwo] || 0 : 0;

                let totalCurrentLoadAtStop = loadOne + loadTwo;
                let remainingLoadAtStop = Math.max(totalCapacity - totalCurrentLoadAtStop, 0);

                finalCurrentLoad.push(totalCurrentLoadAtStop);
                finalRemainingLoad.push(remainingLoadAtStop);
            }

            // Final source and destination
            let finalSource = allStops[0];
            let finalDestination = allStops[allStops.length - 1];

            mergedSchedules.push({
                transportationTruckId: finalTruck._id.toString(),
                transportationTruckLicensePlate: finalTruck.licensePlate,
                finalSource,
                finalDestination,
                stops: allStops,
                finalCurrentLoad,
                finalRemainingLoad
            });
        }
        

        if (mergedSchedules.length === 0) {
            return res.json({ message: "No valid merged schedules found" });
        }

        // Store merged schedules in the database ensuring uniqueness
        for (let schedule of mergedSchedules) {
            const existingSchedule = await MergedSchedule.findOne({
            transportationTruckId: schedule.transportationTruckId,
            stops: schedule.stops,
            finalCurrentLoad: schedule.finalCurrentLoad,
            finalRemainingLoad: schedule.finalRemainingLoad
        });

        if (!existingSchedule) {
            await MergedSchedule.create(schedule);
        }
       }


        res.json({ mergedSchedules });

    } catch (error) {
        console.error("Error generating merged schedule:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});




module.exports=mergeRouter;