import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
// import Loader  from 'react-loader-spinner';

// Initialize Mapbox
mapboxgl.accessToken = "pk.eyJ1IjoiaGFyeGhoaGgiLCJhIjoiY2xwYTJkNjN4MDJrczJqb2J0OXA0eHR2ZSJ9.sDlw3eFcPqHN13QTSCZ8Fg";

const RouteMap = ({ stops }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [78.9629, 20.5937], // Default center (India)
        zoom: 12
      });

      map.current.on('load', () => {
        setLoading(false);
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Cleanup on unmount
      return () => {
        if (map.current) {
          map.current.remove();
        }
      };
    } catch (err) {
      setError('Error initializing map');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!map.current || !stops || stops.length === 0) return;

    try {
      // Remove existing markers and route
      const markers = document.getElementsByClassName('mapboxgl-marker');
      while (markers.length > 0) {
        markers[0].remove();
      }

      // Add markers for each stop
      stops.forEach((stop, index) => {
        const marker = document.createElement('div');
        marker.className = 'marker';
        marker.style.width = '30px';
        marker.style.height = '30px';
        marker.style.backgroundColor = '#10B981';
        marker.style.borderRadius = '50%';
        marker.style.border = '2px solid white';
        marker.style.display = 'flex';
        marker.style.alignItems = 'center';
        marker.style.justifyContent = 'center';
        marker.style.color = 'white';
        marker.style.fontWeight = 'bold';
        marker.textContent = index + 1;

        new mapboxgl.Marker(marker)
          .setLngLat([stop.lng, stop.lat])
          .addTo(map.current);
      });

      // Fit bounds to show all markers
      if (stops.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        stops.forEach(stop => {
          bounds.extend([stop.lng, stop.lat]);
        });
        map.current.fitBounds(bounds, {
          padding: 50,
          maxZoom: 15
        });
      }
    } catch (err) {
      setError('Error updating markers');
    }
  }, [stops]);

  // if (loading) {
  //   return (
  //     <div className="flex justify-center items-center h-[400px]">
  //       <Loader
  //         type="TailSpin"
  //         color="#10B981"
  //         height={50}
  //         width={50}
  //       />
  //     </div>
  //   );
  // }

  if (error) {
    return (
      <div className="h-[400px] flex items-center justify-center bg-gray-800 rounded-xl">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden shadow-lg">
      <div ref={mapContainer} className="h-[400px] w-full" />
    </div>
  );
};

export default RouteMap; 