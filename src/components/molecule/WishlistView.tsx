"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useFrame } from "~/components/providers/FrameProvider";
import { getWishlist, removeFromWishlist, markAsFound, getWishlistStats, type WishlistItem } from "~/lib/wishlist";

interface WishlistViewProps {
  onNavigateToInvader?: (lat: number, lng: number, invaderId: string) => void;
}

export function WishlistView({ onNavigateToInvader }: WishlistViewProps) {
  const { context } = useFrame();
  const farcasterFid = context?.user?.fid;
  
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'want_to_find' | 'found'>('all');
  const [stats, setStats] = useState({ totalWanted: 0, totalFound: 0, totalItems: 0, completionRate: 0 });

  // Load wishlist data
  useEffect(() => {
    if (farcasterFid) {
      const loadWishlist = async () => {
        try {
          const wishlist = await getWishlist(farcasterFid);
          setWishlistItems(wishlist.items);
          
          const wishlistStats = await getWishlistStats(farcasterFid);
          setStats(wishlistStats);
        } catch (error) {
          console.error('Error loading wishlist:', error);
        }
      };
      
      loadWishlist();
    }
  }, [farcasterFid]);

  // Filter items based on selected filter
  const filteredItems = wishlistItems.filter(item => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  // Handle item actions
  const handleMarkAsFound = async (invaderId: string) => {
    if (!farcasterFid) return;
    
    try {
      await markAsFound(farcasterFid, invaderId);
      
      // Reload data
      const wishlist = await getWishlist(farcasterFid);
      setWishlistItems(wishlist.items);
      const wishlistStats = await getWishlistStats(farcasterFid);
      setStats(wishlistStats);
    } catch (error) {
      console.error('Error marking as found:', error);
    }
  };

  const handleRemoveFromWishlist = async (invaderId: string) => {
    if (!farcasterFid) return;
    
    try {
      await removeFromWishlist(farcasterFid, invaderId);
      
      // Reload data
      const wishlist = await getWishlist(farcasterFid);
      setWishlistItems(wishlist.items);
      const wishlistStats = await getWishlistStats(farcasterFid);
      setStats(wishlistStats);
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const handleNavigate = (item: WishlistItem) => {
    if (onNavigateToInvader) {
      onNavigateToInvader(item.coordinates.lat, item.coordinates.lng, item.invader_id);
    }
  };

  if (!farcasterFid) {
    return (
      <div className="flex flex-col justify-center items-center w-full h-96 bg-black text-white p-4 font-mono">
        <div className="text-center max-w-md">
          <h1 className="text-green-400 text-2xl mb-4">HUNT LIST</h1>
          <p className="text-gray-300 mb-4">Sign in with Farcaster to create your personal invader hunt list.</p>
          <div className="text-gray-500 text-sm">
            <p>Save invaders you want to find and track your progress!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-2 sm:p-6 font-mono">
      {/* Header with Stats */}
      <div className="text-center mb-6">
        <div className="text-green-400 text-lg sm:text-xl font-bold mb-2">
          YOUR HUNT LIST
        </div>
        <div className="text-gray-400 text-sm mb-4">
          {stats.totalItems > 0 ? (
            <div>
              <div className="mb-2">
                [&gt;] {stats.totalWanted} TO FIND • [*] {stats.totalFound} FOUND • {stats.completionRate}% COMPLETE
              </div>
              {stats.completionRate > 0 && (
                <div className="w-full bg-gray-700 rounded-full h-2 max-w-md mx-auto">
                  <div 
                    className="bg-green-400 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${stats.completionRate}%` }}
                  ></div>
                </div>
              )}
            </div>
          ) : (
            <div>NO INVADERS IN YOUR HUNT LIST YET</div>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex justify-center">
        <div className="flex bg-gray-900 border border-green-400 font-mono">
          {[
            { key: 'all', label: 'ALL', count: stats.totalItems },
            { key: 'want_to_find', label: 'TO FIND', count: stats.totalWanted },
            { key: 'found', label: 'FOUND', count: stats.totalFound }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as 'all' | 'want_to_find' | 'found')}
              className={`
                px-3 py-2 text-xs sm:text-sm border-r border-gray-700 last:border-r-0 
                transition-all duration-200
                ${filter === tab.key 
                  ? 'bg-green-400 text-black' 
                  : 'text-green-400 hover:bg-gray-800'
                }
              `}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Wishlist Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">
            {filter === 'all' ? 'NO INVADERS IN HUNT LIST' : 
             filter === 'want_to_find' ? 'NO INVADERS TO FIND' : 
             'NO INVADERS FOUND YET'}
          </div>
          <div className="text-gray-500 text-sm">
            {filter === 'all' ? 'Add invaders from the map to start hunting!' :
             filter === 'want_to_find' ? 'Mark some found invaders or add new ones to your hunt list.' :
             'Mark invaders as found when you discover them!'}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.invader_id}
              className="bg-gray-900 border border-gray-600 hover:border-green-400 transition-all duration-200 group relative"
            >
              {/* Status Badge */}
              <div className={`
                absolute top-2 right-2 px-2 py-1 text-[10px] font-bold rounded z-10
                ${item.status === 'found' 
                  ? 'bg-green-400 text-black' 
                  : 'bg-yellow-500 text-black'
                }
              `}>
                {item.status === 'found' ? '[*] FOUND' : '[&gt;] TO FIND'}
              </div>

              {/* Invader Image - Clickable to navigate */}
              <div 
                className="aspect-square overflow-hidden cursor-pointer relative"
                onClick={() => handleNavigate(item)}
                title={`Navigate to ${item.invader_name} on map`}
              >
                <Image
                  src={item.photo_url}
                  alt={item.invader_name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                />
                {/* Navigate Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white font-bold text-sm">
                    📍 GO TO MAP
                  </div>
                </div>
              </div>

              {/* Invader Info */}
              <div className="p-3 space-y-2">
                <div className="text-green-400 text-sm font-bold">{item.invader_name}</div>
                
                <div className="text-gray-400 text-xs">
                  Added: {new Date(item.added_date).toLocaleDateString()}
                </div>

                <div className="text-gray-500 text-xs">
                  {item.coordinates.lat.toFixed(4)}, {item.coordinates.lng.toFixed(4)}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-1 pt-2">
                  <button
                    onClick={() => handleNavigate(item)}
                    className="flex-1 px-2 py-1 text-[10px] font-bold border border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black transition-all duration-200"
                  >
                    📍 LOCATE
                  </button>
                  
                  {item.status === 'want_to_find' && (
                    <button
                      onClick={() => handleMarkAsFound(item.invader_id)}
                      className="flex-1 px-2 py-1 text-[10px] font-bold border border-green-400 text-green-400 hover:bg-green-400 hover:text-black transition-all duration-200"
                    >
                      [*] FOUND
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleRemoveFromWishlist(item.invader_id)}
                    className="px-2 py-1 text-[10px] font-bold border border-red-400 text-red-400 hover:bg-red-400 hover:text-white transition-all duration-200"
                    title="Remove from hunt list"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 text-center text-xs text-gray-500">
        <div>CLICK INVADER IMAGES OR &quot;LOCATE&quot; TO NAVIGATE TO MAP LOCATION</div>
      </div>
    </div>
  );
}