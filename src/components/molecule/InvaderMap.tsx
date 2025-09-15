"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import type { Map as LeafletMap } from "leaflet";
import { useFrame } from "~/components/providers/FrameProvider";
import { addToWishlist, removeFromWishlist, markAsFound, getInvaderStatus, getWishlistStats } from "~/lib/wishlist";

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
const MapEventHandler = dynamic(
  () => import("./MapEventHandler").then((mod) => ({ default: mod.MapEventHandler })),
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

// Helper function to check if coordinates are within viewport bounds
function isInViewport(invader: InvaderLocation, bounds: { north: number; south: number; east: number; west: number }) {
  return (
    invader.l.lat >= bounds.south &&
    invader.l.lat <= bounds.north &&
    invader.l.lng >= bounds.west &&
    invader.l.lng <= bounds.east
  );
}

// Create custom colored markers based on status
function createCustomIcon(status: 'want_to_find' | 'found' | null) {
  const colors = {
    'want_to_find': '#FFD700', // Gold
    'found': '#10B981', // Green  
    'unmarked': '#3B82F6' // Blue
  };
  
  const statusKey = status === null ? 'unmarked' : status;
  const color = colors[statusKey];
  
  // Create small SVG marker
  const svgIcon = `
    <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="8" fill="${color}" stroke="#000" stroke-width="2"/>
      <circle cx="10" cy="10" r="4" fill="#000"/>
    </svg>
  `;
  
  if (typeof window !== 'undefined') {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const L = require('leaflet');
      return L.divIcon({
        html: svgIcon,
        className: 'custom-marker',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        popupAnchor: [0, -10]
      });
    } catch {
      console.warn('Leaflet not available for custom markers');
      return null;
    }
  }
  
  return null;
}


// Wishlist Button Component
function WishlistButton({ invader, fid, onStatusChange, currentStatus }: { 
  invader: InvaderLocation; 
  fid: number | undefined;
  onStatusChange?: () => void;
  currentStatus: 'want_to_find' | 'found' | null;
}) {
  const [status, setStatus] = useState<'want_to_find' | 'found' | null>(currentStatus);
  const [error, setError] = useState(false);

  // Update status when prop changes
  useEffect(() => {
    setStatus(currentStatus);
  }, [currentStatus]);

  const handleToggleWishlist = async () => {
    if (!fid) {
      console.warn('No FID available for wishlist operation');
      return;
    }
    
    console.log(`[DEBUG] Wishlist operation for ${invader.n} with FID ${fid}, current status:`, status);
    
    try {
      if (status === null) {
        // Add to wishlist
        console.log(`[DEBUG] Adding ${invader.n} to wishlist for FID ${fid}`);
        const result = await addToWishlist(fid, invader);
        console.log('[DEBUG] Add to wishlist result:', result);
        setStatus('want_to_find');
      } else if (status === 'want_to_find') {
        // Mark as found
        console.log(`[DEBUG] Marking ${invader.n} as found for FID ${fid}`);
        const result = await markAsFound(fid, invader.n);
        console.log('[DEBUG] Mark as found result:', result);
        setStatus('found');
      } else {
        // Remove from wishlist
        console.log(`[DEBUG] Removing ${invader.n} from wishlist for FID ${fid}`);
        const result = await removeFromWishlist(fid, invader.n);
        console.log('[DEBUG] Remove from wishlist result:', result);
        setStatus(null);
      }
      
      // Notify parent of status change
      if (onStatusChange) {
        onStatusChange();
      }
      
      setError(false);
    } catch (error) {
      console.error('Error updating wishlist:', error);
      console.error('Error details:', error);
      setError(true);
    }
  };

  if (!fid) return null; // Only show for logged-in users
  
  if (error) {
    return (
      <button
        disabled
        className="w-full mt-2 px-2 py-1 text-[10px] font-bold border border-red-400 text-red-400 cursor-not-allowed"
        title="System temporarily unavailable"
      >
        [!] ERROR
      </button>
    );
  }

  const getButtonConfig = () => {
    switch (status) {
      case null:
        return {
          text: '+ ADD TO HUNT LIST',
          className: 'bg-green-400 text-black border-green-400 hover:bg-green-300',
          icon: '[&gt;]'
        };
      case 'want_to_find':
        return {
          text: '[*] MARK AS FOUND',
          className: 'bg-yellow-500 text-black border-yellow-500 hover:bg-yellow-400',
          icon: '[*]'
        };
      case 'found':
        return {
          text: '[*] FOUND',
          className: 'bg-gray-600 text-white border-gray-600 hover:bg-red-500 hover:text-white',
          icon: '[*]'
        };
    }
  };

  const config = getButtonConfig();

  return (
    <button
      onClick={handleToggleWishlist}
      className={`
        w-full mt-2 px-2 py-1 text-[10px] font-bold border transition-all duration-200
        ${config.className}
      `}
      title={status === 'found' ? 'Click to remove from hunt list' : ''}
    >
      {config.icon} {config.text}
    </button>
  );
}

type MapView = 'geo' | 'hunt' | 'saved';

interface InvaderMapProps {
  targetLocation?: {
    lat: number;
    lng: number;
    invaderId: string;
  } | null;
  onLocationTargeted?: () => void;
}

export function InvaderMap({ targetLocation, onLocationTargeted }: InvaderMapProps = {}) {
  const { context } = useFrame();
  const farcasterFid = context?.user?.fid;
  
  const [allInvaders, setAllInvaders] = useState<InvaderLocation[]>([]);
  const [visibleInvaders, setVisibleInvaders] = useState<InvaderLocation[]>([]);
  const [filteredInvaders, setFilteredInvaders] = useState<InvaderLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [showAllCities, setShowAllCities] = useState(false);
  const [map, setMap] = useState<LeafletMap | null>(null);
  const [wishlistStats, setWishlistStats] = useState({ totalWanted: 0, totalFound: 0, totalItems: 0, completionRate: 0 });
  const [activeView, setActiveView] = useState<MapView>('geo');
  const [invaderStatuses, setInvaderStatuses] = useState<Record<string, 'want_to_find' | 'found' | null>>({});
  
  // Popular cities with coordinates for navigation
  const popularCities = useMemo(() => [
    { name: "Paris", lat: 48.8566, lng: 2.3522 },
    { name: "London", lat: 51.5074, lng: -0.1278 },
    { name: "New York", lat: 40.7128, lng: -74.0060 },
    { name: "Tokyo", lat: 35.6762, lng: 139.6503 },
    { name: "Barcelona", lat: 41.3851, lng: 2.1734 },
    { name: "Rome", lat: 41.9028, lng: 12.4964 },
    { name: "Amsterdam", lat: 52.3676, lng: 4.9041 },
    { name: "Berlin", lat: 52.5200, lng: 13.4050 },
    { name: "Los Angeles", lat: 34.0522, lng: -118.2437 },
    { name: "Madrid", lat: 40.4168, lng: -3.7038 },
    { name: "Milan", lat: 45.4642, lng: 9.1900 },
    { name: "Brussels", lat: 50.8503, lng: 4.3517 }
  ], []);

  useEffect(() => {
    // Load invader data
    const loadInvaders = async () => {
      try {
        const response = await fetch("/data/json/invaders.json");
        const data = await response.json();
        setAllInvaders(data);
        setFilteredInvaders(data); // Initially show all invaders
        setVisibleInvaders(data);
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

  // Load wishlist once and derive statuses from it
  useEffect(() => {
    if (farcasterFid && allInvaders.length > 0) {
      const loadWishlistData = async () => {
        try {
          console.log(`[DEBUG] Loading wishlist data for FID ${farcasterFid}`);
          
          // Load the entire wishlist in one request
          const wishlist = await getWishlist(farcasterFid);
          console.log(`[DEBUG] Loaded wishlist with ${wishlist.items.length} items`);
          
          // Update stats
          setWishlistStats({
            totalWanted: wishlist.stats.total_wanted,
            totalFound: wishlist.stats.total_found,
            totalItems: wishlist.items.length,
            completionRate: wishlist.items.length > 0 ? (wishlist.stats.total_found / wishlist.items.length) * 100 : 0
          });

          // Create status map from wishlist items
          const statusMap: Record<string, 'want_to_find' | 'found' | null> = {};
          wishlist.items.forEach(item => {
            statusMap[item.invader_id] = item.status;
          });
          
          console.log(`[DEBUG] Created status map with ${Object.keys(statusMap).length} entries`);
          setInvaderStatuses(statusMap);
        } catch (error) {
          console.error('Error loading wishlist data:', error);
        }
      };
      
      loadWishlistData();
    }
  }, [farcasterFid, allInvaders]);

  // Filter invaders based on active view
  useEffect(() => {
    let filtered = allInvaders;
    
    if (activeView === 'hunt') {
      // Show only invaders that are marked as "want_to_find"
      filtered = allInvaders.filter(invader => invaderStatuses[invader.n] === 'want_to_find');
    } else if (activeView === 'saved') {
      // Show only invaders that are marked as "found"  
      filtered = allInvaders.filter(invader => invaderStatuses[invader.n] === 'found');
    }
    // 'geo' shows all invaders (default)
    
    setFilteredInvaders(filtered);
    setVisibleInvaders(filtered);
  }, [activeView, allInvaders, invaderStatuses]);

  // Handle city navigation
  const handleCitySelect = useCallback((cityName: string) => {
    if (selectedCity === cityName) {
      // Deselect city - show all invaders and zoom out
      setSelectedCity(null);
      if (map && allInvaders.length > 0) {
        // Reset to London view
        const london = popularCities.find(city => city.name === "London")!;
        map.setView([london.lat, london.lng], 12);
      }
    } else {
      // Select new city and navigate to it
      setSelectedCity(cityName);
      const city = popularCities.find(c => c.name === cityName);
      if (city && map) {
        map.setView([city.lat, city.lng], 12); // Zoom to city level
      }
    }
  }, [selectedCity, map, allInvaders, popularCities]);

  // Handle target location from wishlist navigation
  useEffect(() => {
    if (targetLocation && map && onLocationTargeted) {
      // Navigate to the target location
      map.setView([targetLocation.lat, targetLocation.lng], 16); // Close zoom for specific invader
      
      // Find and highlight the specific invader (future enhancement: could open popup automatically)
      // For now, just navigate to the location
      
      // Clear the target location
      onLocationTargeted();
    }
  }, [targetLocation, map, onLocationTargeted]);

  // Handle viewport changes to filter visible invaders from filtered set
  const handleViewportChange = useCallback((bounds: { north: number; south: number; east: number; west: number }) => {
    const filtered = filteredInvaders.filter(invader => isInViewport(invader, bounds));
    setVisibleInvaders(filtered);
  }, [filteredInvaders]);

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

  if (allInvaders.length === 0) {
    return (
      <div className="flex justify-center items-center h-96 bg-black text-green-400 font-mono">
        <div className="text-center">
          <div className="text-lg mb-2">NO INVADERS DETECTED</div>
          <div className="text-sm text-gray-400">CHECK DATA SOURCE</div>
        </div>
      </div>
    );
  }

  // Default to London coordinates
  const london = popularCities.find(city => city.name === "London")!;
  const centerLat = london.lat;
  const centerLng = london.lng;

  return (
    <div className="w-full max-w-6xl mx-auto p-2 sm:p-6 font-mono">
      {/* Header */}
      <div className="text-center mb-4">
        <div className="text-green-400 text-lg sm:text-xl font-bold mb-2">
          INVADER LOCATIONS MAP
        </div>
        <div className="text-gray-400 text-sm mb-2">
          {selectedCity 
            ? `NAVIGATED TO ${selectedCity.toUpperCase()} • SHOWING ${visibleInvaders.length} OF ${allInvaders.length} INVADERS`
            : `SHOWING ${visibleInvaders.length} OF ${allInvaders.length} SPACE INVADER${allInvaders.length !== 1 ? "S" : ""} WORLDWIDE`
          }
        </div>
        {farcasterFid && wishlistStats.totalItems > 0 && (
          <div className="text-cyan-400 text-xs mb-2">
            [&gt;] YOUR HUNT: {wishlistStats.totalWanted} TO FIND • [*] {wishlistStats.totalFound} FOUND • {wishlistStats.completionRate}% COMPLETE
          </div>
        )}
        {visibleInvaders.length < allInvaders.length && !selectedCity && (
          <div className="text-cyan-400 text-xs mt-1">
            ZOOM OUT OR PAN TO SEE MORE INVADERS
          </div>
        )}
        {selectedCity && (
          <div className="text-cyan-400 text-xs mt-1">
            CLICK &quot;{selectedCity.toUpperCase()}&quot; AGAIN OR &quot;SHOW ALL&quot; TO RETURN TO GLOBAL VIEW
          </div>
        )}
      </div>

      {/* City Filter */}
      <div className="mb-4 bg-gray-900 border border-green-400 p-2">
        <div className="text-green-400 text-xs font-bold mb-2">NAVIGATE TO CITY</div>
        
        {/* Trending Cities */}
        <div className="mb-2">
          <div className="text-gray-400 text-[9px] mb-1">POPULAR:</div>
          <div className="flex flex-wrap gap-1">
            {popularCities.slice(0, 6).map((city) => (
              <button
                key={city.name}
                onClick={() => handleCitySelect(city.name)}
                className={`
                  px-2 py-1 text-[10px] border transition-all duration-200
                  ${selectedCity === city.name 
                    ? 'bg-green-400 text-black border-green-400' 
                    : 'bg-transparent text-green-400 border-green-400 hover:bg-green-400 hover:text-black'
                  }
                `}
              >
                {city.name.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        
        {/* Controls Row */}
        <div className="flex gap-1 items-center flex-wrap">
          <button
            onClick={() => {
              setSelectedCity(null);
              if (map && allInvaders.length > 0) {
                const london = popularCities.find(city => city.name === "London")!;
                map.setView([london.lat, london.lng], 12);
              }
            }}
            className={`
              px-2 py-1 text-[10px] border transition-all duration-200
              ${selectedCity === null 
                ? 'bg-green-400 text-black border-green-400' 
                : 'bg-transparent text-green-400 border-gray-600 hover:border-green-400'
              }
            `}
          >
            SHOW ALL
          </button>
          
          <button
            onClick={() => setShowAllCities(!showAllCities)}
            className={`
              px-2 py-1 text-[10px] border transition-all duration-200
              ${showAllCities 
                ? 'bg-cyan-400 text-black border-cyan-400' 
                : 'bg-transparent text-cyan-400 border-cyan-400 hover:bg-cyan-400 hover:text-black'
              }
            `}
          >
            {showAllCities ? 'HIDE' : 'MORE CITIES'}
          </button>
        </div>

        {/* All Cities (when expanded) */}
        {showAllCities && (
          <div className="mt-2 pt-2 border-t border-gray-700">
            <div className="text-gray-400 text-[9px] mb-1">ALL CITIES:</div>
            <div className="flex flex-wrap gap-1">
              {popularCities.slice(6).map((city) => (
                <button
                  key={city.name}
                  onClick={() => handleCitySelect(city.name)}
                  className={`
                    px-2 py-1 text-[10px] border transition-all duration-200
                    ${selectedCity === city.name 
                      ? 'bg-green-400 text-black border-green-400' 
                      : 'bg-transparent text-green-400 border-gray-600 hover:border-green-400'
                    }
                  `}
                >
                  {city.name.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Map Container */}
      <div className="bg-gray-900 border border-green-400 p-2">
        <div style={{ height: "500px", width: "100%" }}>
          <MapContainer
            center={[centerLat, centerLng]}
            zoom={12}
            style={{ height: "100%", width: "100%" }}
            className="leaflet-container-dark"
            ref={setMap}
          >
            <MapEventHandler onViewportChange={handleViewportChange} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {visibleInvaders.map((invader) => {
              const status = invaderStatuses[invader.n] || null;
              const customIcon = createCustomIcon(status);
              
              return (
                <Marker
                  key={invader.i}
                  position={[invader.l.lat, invader.l.lng]}
                  icon={customIcon || undefined}
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
                    <div className="text-xs text-gray-600 mb-2">
                      ID: {invader.i}<br />
                      LAT: {invader.l.lat.toFixed(6)}<br />
                      LNG: {invader.l.lng.toFixed(6)}
                    </div>
                    <WishlistButton 
                      invader={invader} 
                      fid={farcasterFid} 
                      currentStatus={status}
                      onStatusChange={async () => {
                        if (farcasterFid) {
                          try {
                            // Reload the entire wishlist to get updated stats and statuses
                            const wishlist = await getWishlist(farcasterFid);
                            setWishlistStats({
                              totalWanted: wishlist.stats.total_wanted,
                              totalFound: wishlist.stats.total_found,
                              totalItems: wishlist.items.length,
                              completionRate: wishlist.items.length > 0 ? (wishlist.stats.total_found / wishlist.items.length) * 100 : 0
                            });
                            
                            // Update status map
                            const statusMap: Record<string, 'want_to_find' | 'found' | null> = {};
                            wishlist.items.forEach(item => {
                              statusMap[item.invader_id] = item.status;
                            });
                            setInvaderStatuses(statusMap);
                          } catch (error) {
                            console.error('Error updating wishlist stats:', error);
                          }
                        }
                      }} 
                    />
                  </div>
                </Popup>
              </Marker>
              );
            })}
          </MapContainer>
        </div>
      </div>

      {/* View Switcher */}
      <div className="mt-4 bg-gray-900 border border-green-400 p-2">
        <div className="text-green-400 text-xs font-bold mb-2">MAP VIEW</div>
        <div className="flex gap-1 justify-center">
          <button
            onClick={() => setActiveView('geo')}
            className={`
              px-3 py-2 text-sm border transition-all duration-200
              ${activeView === 'geo' 
                ? 'bg-green-400 text-black border-green-400' 
                : 'bg-transparent text-green-400 border-green-400 hover:bg-green-400 hover:text-black'
              }
            `}
          >
            [G] GEO
          </button>
          <button
            onClick={() => setActiveView('hunt')}
            className={`
              px-3 py-2 text-sm border transition-all duration-200
              ${activeView === 'hunt' 
                ? 'bg-yellow-400 text-black border-yellow-400' 
                : 'bg-transparent text-yellow-400 border-yellow-400 hover:bg-yellow-400 hover:text-black'
              }
            `}
          >
            [H] HUNT
          </button>
          <button
            onClick={() => setActiveView('saved')}
            className={`
              px-3 py-2 text-sm border transition-all duration-200
              ${activeView === 'saved' 
                ? 'bg-cyan-400 text-black border-cyan-400' 
                : 'bg-transparent text-cyan-400 border-cyan-400 hover:bg-cyan-400 hover:text-black'
              }
            `}
          >
            [S] SAVED
          </button>
        </div>
        <div className="text-center text-gray-400 text-xs mt-2">
          {activeView === 'geo' && 'ALL INVADERS • GOLD: HUNT • GREEN: FOUND • BLUE: UNMARKED'}
          {activeView === 'hunt' && 'INVADERS ON YOUR HUNT LIST • CLICK TO MARK AS FOUND'}
          {activeView === 'saved' && 'INVADERS YOU HAVE FOUND • CLICK TO REMOVE FROM HUNT'}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 text-center text-xs text-gray-400">
        <div>CLICK MARKERS FOR INVADER DETAILS • ZOOM AND PAN TO EXPLORE</div>
      </div>
    </div>
  );
}