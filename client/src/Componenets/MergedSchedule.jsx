import React, { useState, useEffect } from "react";
import { Truck, Navigation, Package, PackageCheck, Map } from "lucide-react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import RouteMap from "./RouteMap";
// import  Loader  from "react-loader-spinner";

const MergedSchedule = () => {
  const [mergedSchedule, setMergedSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  const fetchMergedSchedule = async () => {
    try {
      setLoading(true);
      const res = await axios.get(BASE_URL+ "/mergedSchedule", {
        withCredentials: true,
      });

      if (res.data && Array.isArray(res.data.mergedSchedules)) {
        setMergedSchedule(res.data.mergedSchedules);
      } else {
        console.error("Unexpected API response format", res.data);
        setMergedSchedule([]);
      }
    } catch (error) {
      console.error("Error fetching merged schedule:", error);
      setError("Failed to load schedule.");
      setMergedSchedule([]); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMergedSchedule();
  }, []);

  const convertStopsToCoordinates = (stops) => {
    // This is a placeholder - you'll need to implement actual geocoding
    // For now, we'll return dummy coordinates
    return stops.map((stop, index) => ({
      lat: 20.5937 + (index * 0.01),
      lng: 78.9629 + (index * 0.01),
    }));
  };

  // if (loading) {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
  //       <Loader
  //         type="TailSpin"
  //         color="#10B981"
  //         height={80}
  //         width={80}
  //       />
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Truck className="w-8 h-8 text-emerald-400" />
          <h1 className="text-3xl font-bold text-white">Transportation Dashboard</h1>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          {mergedSchedule.length > 0 ? (
            mergedSchedule.map((truck, index) => (
              <div
                key={truck.transportationTruckId || index}
                className="bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-700 hover:border-emerald-500/50 transition-all duration-300"
              >
                <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 px-8 py-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-white">
                      {truck.transportationTruckLicensePlate || "Unknown Truck"}
                    </h2>
                    <div className="flex items-center gap-4">
                      <span className="px-3 py-1 bg-white/10 text-white rounded-full text-sm font-medium">
                        Active
                      </span>
                      <button
                        onClick={() => setSelectedSchedule(selectedSchedule === index ? null : index)}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
                      >
                        <Map className="w-5 h-5" />
                        <span className="text-white font-medium">
                          {selectedSchedule === index ? 'Hide Map' : 'Show Map'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <Navigation className="w-5 h-5 text-emerald-400 mt-1" />
                        <div>
                          <p className="text-sm text-gray-400">Route</p>
                          <p className="font-medium text-white">
                            {truck.finalSource || "Unknown"} → {truck.finalDestination || "Unknown"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <Package className="w-5 h-5 text-emerald-400 mt-1" />
                        <div>
                          <p className="text-sm text-gray-400">Current Load</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {truck.finalCurrentLoad?.map((load, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-sm"
                              >
                                {load}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <PackageCheck className="w-5 h-5 text-emerald-400 mt-1" />
                        <div>
                          <p className="text-sm text-gray-400">Remaining Load</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {truck.finalRemainingLoad?.map((load, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-sm"
                              >
                                {load}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-400 mb-3">Stops</p>
                      <div className="flex flex-wrap gap-2">
                        {truck.stops && truck.stops.length > 0 ? (
                          truck.stops.map((stop, stopIndex) => (
                            <span
                              key={stopIndex}
                              className="px-3 py-1 bg-gray-700/50 text-emerald-300 rounded-full text-sm border border-gray-600"
                            >
                              {stop}
                            </span>
                          ))
                        ) : (
                          <p className="text-gray-500">No stops available</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {selectedSchedule === index && (
                    <div className="mt-8">
                      <h4 className="text-xl font-semibold text-white mb-6">Route Visualization</h4>
                      <RouteMap 
                        stops={convertStopsToCoordinates(truck.stops)}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            !loading && (
              <div className="text-center py-16 bg-gray-800 rounded-3xl shadow-md border border-gray-700">
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Truck className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  No Merged Schedules Available
                </h3>
                <p className="text-gray-400 max-w-md mx-auto">
                  There are currently no merged schedules to display. Check back later for updates.
                </p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default MergedSchedule;
