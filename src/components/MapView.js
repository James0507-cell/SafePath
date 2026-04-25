'use client';

import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions';
import { Geolocation } from '@capacitor/geolocation';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCCESS_TOKEN;

export default forwardRef(function MapView({ places = [], onRouteUpdate }, ref) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef([]);
  const directions = useRef(null);

  useImperativeHandle(ref, () => ({
    flyTo: (lng, lat) => {
      if (map.current) {
        map.current.flyTo({
          center: [lng, lat],
          zoom: 16,
          essential: true
        });
      }
    },
    setRoute: (destinationLat, destinationLng) => {
      if (directions.current && map.current) {
        const setDirections = async () => {
          try {
            const coords = await Geolocation.getCurrentPosition();
            directions.current.setOrigin([coords.coords.longitude, coords.coords.latitude]);
            directions.current.setDestination([destinationLng, destinationLat]);
          } catch (error) {
            console.error('Error getting location for routing:', error);
          }
        };
        setDirections();
      }
    }
  }));

  useEffect(() => {
    if (map.current) return;

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [0, 0],
      zoom: 2,
      attributionControl: false
    });

    // Initialize Directions
    directions.current = new MapboxDirections({
      accessToken: mapboxgl.accessToken,
      unit: 'metric',
      profile: 'mapbox/driving'
    });

    map.current.addControl(directions.current, 'top-right');
    map.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right');

    const setupLocation = async () => {
      try {
        const coords = await Geolocation.getCurrentPosition();
        if (coords && map.current) {
          map.current.flyTo({
            center: [coords.coords.longitude, coords.coords.latitude],
            zoom: 14,
            essential: true
          });
        }
      } catch (error) {
        console.error('Error getting location:', error);
      }
    };

    setupLocation();

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update markers when places change
  useEffect(() => {
    if (!map.current) return;

    // Remove existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Ensure places is an array
    const placesArray = Array.isArray(places) ? places : [];

    // Add new markers
    placesArray.forEach(place => {
      if (place.latitude && place.longitude) {
        const marker = new mapboxgl.Marker()
          .setLngLat([place.longitude, place.latitude])
          .addTo(map.current);
        markers.current.push(marker);
      }
    });
  }, [places]);

  return (
    <div ref={mapContainer} className="absolute inset-0 w-full h-full" />
  );
});
