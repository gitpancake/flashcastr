"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";

// Import Leaflet CSS in the component
import "leaflet/dist/leaflet.css";
import "~/styles/leaflet-dark.css";

// Dynamically import the Map components to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

interface InvaderLocation {
  i: number;
  n: string;
  l: {
    lat: number;
    lng: number;
  };
  t: string;
}

export function InvaderMap() {
  const [invaders, setInvaders] = useState<InvaderLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  useEffect(() => {
    // Load invader data
    const loadInvaders = async () => {
      try {
        const response = await fetch("/data/json/invaders.json");
        const data = await response.json();
        setInvaders(data);
      } catch (error) {
        console.error("Failed to load invader data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Load Leaflet and fix marker icons
    const loadLeaflet = async () => {
      const L = await import("leaflet");
      
      // Fix for default markers in Next.js
      delete (L.Icon.Default.prototype as unknown as { _getIconUrl: unknown })._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });
      
      setLeafletLoaded(true);
    };

    loadInvaders();
    loadLeaflet();
  }, []);

  if (isLoading || !leafletLoaded) {
    return (
      <div className="flex justify-center items-center h-96 bg-black text-green-400 font-mono">
        <div className="text-center">
          <div className="text-lg mb-2">LOADING MAP...</div>
          <div className="text-sm text-gray-400">SCANNING FOR INVADERS</div>
        </div>
      </div>
    );
  }

  if (invaders.length === 0) {
    return (
      <div className="flex justify-center items-center h-96 bg-black text-green-400 font-mono">
        <div className="text-center">
          <div className="text-lg mb-2">NO INVADERS DETECTED</div>
          <div className="text-sm text-gray-400">CHECK DATA SOURCE</div>
        </div>
      </div>
    );
  }

  // Calculate center point from all invaders
  const centerLat = invaders.reduce((sum, inv) => sum + inv.l.lat, 0) / invaders.length;
  const centerLng = invaders.reduce((sum, inv) => sum + inv.l.lng, 0) / invaders.length;

  return (
    <div className="w-full max-w-6xl mx-auto p-2 sm:p-6 font-mono">
      {/* Header */}
      <div className="text-center mb-4">
        <div className="text-green-400 text-lg sm:text-xl font-bold mb-2">
          INVADER LOCATIONS MAP
        </div>
        <div className="text-gray-400 text-sm">
          TRACKING {invaders.length} SPACE INVADER{invaders.length !== 1 ? "S" : ""} WORLDWIDE
        </div>
      </div>

      {/* Map Container */}
      <div className="bg-gray-900 border border-green-400 p-2">
        <div style={{ height: "500px", width: "100%" }}>
          <MapContainer
            center={[centerLat, centerLng]}
            zoom={10}
            style={{ height: "100%", width: "100%" }}
            className="leaflet-container-dark"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {invaders.map((invader) => (
              <Marker
                key={invader.i}
                position={[invader.l.lat, invader.l.lng]}
              >
                <Popup>
                  <div className="text-center font-mono">
                    <div className="font-bold text-green-600 mb-2">
                      {invader.n}
                    </div>
                    <Image
                      src={invader.t}
                      alt={invader.n}
                      width={200}
                      height={200}
                      className="mb-2 rounded border"
                    />
                    <div className="text-xs text-gray-600">
                      ID: {invader.i}<br />
                      LAT: {invader.l.lat.toFixed(6)}<br />
                      LNG: {invader.l.lng.toFixed(6)}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 text-center text-xs text-gray-400">
        <div>CLICK MARKERS FOR INVADER DETAILS • ZOOM AND PAN TO EXPLORE</div>
      </div>
    </div>
  );
}