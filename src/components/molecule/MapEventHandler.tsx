"use client";

import { useMapEvents } from "react-leaflet";

interface MapEventHandlerProps {
  onViewportChange: (bounds: { north: number; south: number; east: number; west: number }) => void;
}

export function MapEventHandler({ onViewportChange }: MapEventHandlerProps) {
  const map = useMapEvents({
    moveend: () => {
      const bounds = map.getBounds();
      onViewportChange({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      });
    },
    zoomend: () => {
      const bounds = map.getBounds();
      onViewportChange({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      });
    },
  });
  
  return null;
}