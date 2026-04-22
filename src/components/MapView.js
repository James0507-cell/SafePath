'use client';

import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { Geolocation } from '@capacitor/geolocation';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function MapView() {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (map.current) return;

    // Initialize map with a default view
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'osm': {
            type: 'raster',
            tiles: [
              'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
            ],
            tileSize: 256,
            attribution: '&copy; OpenStreetMap contributors'
          }
        },
        layers: [
          {
            id: 'osm-layer',
            type: 'raster',
            source: 'osm',
            minzoom: 0,
            maxzoom: 19
          }
        ]
      },
      center: [0, 0],
      zoom: 2,
      attributionControl: false
    });

    map.current.addControl(new maplibregl.NavigationControl({
        showCompass: false
    }), 'bottom-right');
    
    const geolocateControl = new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true
    });
    
    map.current.addControl(geolocateControl, 'bottom-right');

    // Request permission and center map right away
    const setupLocation = async () => {
      try {
        const permissions = await Geolocation.checkPermissions();
        if (permissions.location !== 'granted') {
          await Geolocation.requestPermissions();
        }
        
        const coordinates = await Geolocation.getCurrentPosition();
        if (coordinates && map.current) {
          map.current.flyTo({
            center: [coordinates.coords.longitude, coordinates.coords.latitude],
            zoom: 14,
            essential: true
          });
          
          // Trigger the geolocate control UI state if possible
          // Note: maplibregl doesn't have a direct "trigger" method that is public for the dot, 
          // but we've centered the map which is the main goal.
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

  return (
    <div ref={mapContainer} className="absolute inset-0 w-full h-full" />
  );
}
