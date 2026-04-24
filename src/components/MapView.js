'use client';

import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import maplibregl from 'maplibre-gl';
import { Geolocation } from '@capacitor/geolocation';
import 'maplibre-gl/dist/maplibre-gl.css';

export default forwardRef(function MapView({ places = [] }, ref) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef([]);

  useImperativeHandle(ref, () => ({
    flyTo: (lng, lat) => {
      if (map.current) {
        map.current.flyTo({
          center: [lng, lat],
          zoom: 16,
          essential: true
        });
      }
    }
  }));

  useEffect(() => {
    if (map.current) return;

    // Initialize map
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'osm': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
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

    map.current.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');

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

    // Add new markers
    places.forEach(place => {
      if (place.latitude && place.longitude) {
        const marker = new maplibregl.Marker()
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
