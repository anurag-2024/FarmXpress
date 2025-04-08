const express = require('express');
const scheduleDeliveryRouter = express.Router();
const { companyAuth } = require('../middlewares/auth');
const Truck = require('../models/truck'); 
const Route = require('../models/route'); 
const {validateTruckData}=require('../utils/validation')

scheduleDeliveryRouter.post('/scheduleDelivery/addtruck', companyAuth, async (req, res) => {
    try {
        const { licensePlate, totalCapacity, currentLoad} = req.body;
        validateTruckData(req);
        
        const remainingLoad = currentLoad.map(load => totalCapacity - load);

        const companyId = req.company._id; 

        if (!licensePlate || !totalCapacity) {
            return res.status(400).send("License plate and total capacity are required.");
        }

        const newTruck = new Truck({
            licensePlate,
            companyId,
            totalCapacity,
            currentLoad,
            remainingLoad,
        });

        await newTruck.save();

        res.status(201).send("Truck added successfully: " + newTruck);
    } catch (err) {
        console.error(err.stack);
        res.status(400).send("Error adding truck: " + err.message);
    }
});

scheduleDeliveryRouter.post('/scheduleDelivery/addroute', companyAuth, async (req, res) => {
    try {
        const { licensePlate, source, destination, stops } = req.body;
        const companyId = req.company._id;

        if (!licensePlate || !source || !destination) {
            return res.status(400).send("licensePlate, source, and destination are required.");
        }

        const truck = await Truck.findOne({ licensePlate, companyId });
        if (!truck) {
            return res.status(404).send("Truck not found or does not belong to the company.");
        }

        const newRoute = new Route({
            truckId: truck._id, 
            source,
            destination,
            stops,
        });

        await newRoute.save();

        res.status(201).send("Route added successfully: " + newRoute);
    } catch (err) {
        console.error(err.stack);
        res.status(400).send("Error adding route: " + err.message);
    }
});


scheduleDeliveryRouter.delete('/scheduleDelivery/deletescheduleDelivery/:id', companyAuth, async (req, res) => {
    try {
        const routeId = req.params.id;

        const companyId = req.company._id;

        const route = await Route.findById(routeId).populate('truckId');
        if (!route) {
            return res.status(404).send("Route not found.");
        }

        if (!route.truckId || !route.truckId.companyId) {
            return res.status(400).send("Invalid route or truck data.");
        }

        if (route.truckId.companyId.toString() !== companyId.toString()) {
            return res.status(403).send("You are not authorized to delete this route.");
        }

        await Route.findByIdAndDelete(routeId);

        res.send("Route deleted successfully: " + routeId);
    } catch (err) {
        console.error(err.stack); 
        res.status(400).send("Error deleting route: " + err.message);
    }
});

module.exports = scheduleDeliveryRouter;