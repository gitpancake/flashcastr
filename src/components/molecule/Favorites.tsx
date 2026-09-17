"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import { getFavorites, removeFromFavorites, type FavoriteFlash } from "~/lib/favorites";
import { useFrame } from "~/components/providers/FrameProvider";
import { getImageUrl } from "~/lib/help/getImageUrl";
import formatTimeAgo from "~/lib/help/formatTimeAgo";
import { fromUnixTime } from "date-fns";
import { exportAsImageGrid } from "~/lib/exportGrid";
import SearchBar from "./SearchBar";
import { FlashGrid, type FlashCardData } from "./FlashGrid";

export function Favorites() {
  const router = useRouter();
  const { context } = useFrame();
  const farcasterFid = context?.user?.fid;
  
  const [favorites, setFavorites] = useState<FavoriteFlash[]>([]);
  const [filteredFavorites, setFilteredFavorites] = useState<FavoriteFlash[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'city' | 'player'>('newest');
  const [loading, setLoading] = useState(true);
  const [systemError, setSystemError] = useState(false);

  // Load favorites on mount
  useEffect(() => {
    const loadFavorites = async () => {
      setLoading(true);
      setSystemError(false);
      try {
        const favs = await getFavorites(farcasterFid);
        setFavorites(favs);
        setFilteredFavorites(favs);
      } catch (error) {
        console.error('Error loading favorites:', error);
        setSystemError(true);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
    
    // Reload when window gains focus (in case favorites changed in another tab)
    const handleFocus = () => loadFavorites();
    window.addEventListener('focus', handleFocus);
    
    return () => window.removeEventListener('focus', handleFocus);
  }, [farcasterFid]);

  // Filter and sort favorites
  useEffect(() => {
    let filtered = [...favorites];

    // Apply search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(fav => 
        fav.player.toLowerCase().includes(search) ||
        fav.city.toLowerCase().includes(search) ||
        fav.text?.toLowerCase().includes(search)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.addedAt - a.addedAt;
        case 'oldest':
          return a.addedAt - b.addedAt;
        case 'city':
          return a.city.localeCompare(b.city);
        case 'player':
          return a.player.localeCompare(b.player);
        default:
          return b.addedAt - a.addedAt;
      }
    });

    setFilteredFavorites(filtered);
  }, [favorites, searchTerm, sortBy]);

  const handleRemoveFromFavorites = async (flashId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      const success = await removeFromFavorites(flashId, farcasterFid);
      if (success) {
        const updatedFavorites = favorites.filter(fav => fav.flash_id !== flashId);
        setFavorites(updatedFavorites);
      }
    } catch (error) {
      console.error('Error removing from favorites:', error);
      toast.error('COULD NOT REMOVE FAVORITE — TRY AGAIN');
    }
  };

  const handleExportGrid = async () => {
    if (filteredFavorites.length === 0) return;
    
    try {
      await exportAsImageGrid({
        flashes: filteredFavorites,
        title: `FLASHCASTR COLLECTION${searchTerm ? ` • "${searchTerm}"` : ''}`,
        gridSize: 4,
        imageSize: 200,
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('EXPORT FAILED — TRY AGAIN');
    }
  };

  // Show sign-in prompt if no farcaster context
  if (!farcasterFid) {
    return (
      <div className="flex flex-col justify-center items-center w-full h-96 bg-black text-white p-4 font-mono">
        <div className="text-center max-w-md">
          <h1 className="text-green-400 text-2xl mb-4">SAVED FLASHES</h1>
          <p className="text-gray-300 mb-4">Sign in with Farcaster to save and sync your favorite flashes across devices.</p>
          <div className="text-gray-500 text-sm">
            <p>Save flashes you want to revisit and export collections!</p>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center w-full h-96 bg-black text-white p-4 font-mono">
        <div className="text-center">
          <h1 className="text-green-400 text-2xl mb-4">SAVED FLASHES</h1>
          <p className="text-gray-300">Loading your saved flashes...</p>
        </div>
      </div>
    );
  }

  // Show system error state
  if (systemError) {
    return (
      <div className="flex flex-col justify-center items-center w-full h-96 bg-black text-white p-4 font-mono">
        <div className="text-center max-w-md">
          <h1 className="text-red-400 text-2xl mb-4">SYSTEM DOWN</h1>
          <p className="text-gray-300 mb-4">Saved flashes system is temporarily unavailable.</p>
          <p className="text-gray-500 text-sm mb-4">Check back later.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 border border-green-400 text-green-400 hover:bg-green-400 hover:text-black transition-all duration-200 text-sm"
          >
            [R] RETRY
          </button>
        </div>
      </div>
    );
  }

  const favoritesById = new Map(filteredFavorites.map((favorite) => [String(favorite.flash_id), favorite]));

  const items: FlashCardData[] = filteredFavorites.map((favorite) => ({
    id: String(favorite.flash_id),
    flashId: favorite.flash_id,
    city: favorite.city,
    player: favorite.player,
    avatarUrl: null,
    imageSrc: getImageUrl(favorite),
    timestampSeconds: favorite.timestamp,
    text: favorite.text,
    onImageClick: () => router.push(`/flash/${favorite.flash_id}`),
  }));

  const renderFavoriteCard = (item: FlashCardData) => {
    const favorite = favoritesById.get(item.id);

    return (
      <div className="bg-gray-900 border border-gray-600 hover:border-yellow-400 transition-all duration-200 group relative">
        {/* Remove Button */}
        <button
          onClick={(e) => handleRemoveFromFavorites(item.flashId, e)}
          className="absolute top-2 right-2 z-10 w-6 h-6 bg-red-900 border border-red-400 text-red-400 hover:bg-red-400 hover:text-black transition-all duration-200 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100"
          title="Remove from favorites"
        >
          ×
        </button>

        {/* Flash Image */}
        <div
          className="aspect-square overflow-hidden cursor-pointer relative"
          onClick={item.onImageClick}
        >
          <Image
            src={item.imageSrc}
            alt={`Flash ${item.flashId}`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
          />
        </div>

        {/* Flash Info */}
        <div className="p-2 sm:p-3 space-y-1">
          <div className="text-yellow-400 text-[10px] sm:text-xs font-bold">
            #{item.flashId.toLocaleString()}
          </div>
          <div className="text-white text-xs sm:text-sm">
            @ {item.player}
          </div>
          <div className="text-gray-400 text-[10px] sm:text-xs">
            {">"} {item.city}
          </div>
          {item.text && (
            <div className="text-gray-300 text-[10px] sm:text-xs line-clamp-2">
              {item.text}
            </div>
          )}
          <div className="text-gray-500 text-[10px] sm:text-xs">
            {formatTimeAgo(fromUnixTime(item.timestampSeconds))}
          </div>
          {favorite && (
            <div className="text-yellow-600 text-[9px] sm:text-xs">
              [*] SAVED {formatTimeAgo(fromUnixTime(favorite.addedAt / 1000))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const emptyTitle = searchTerm ? "NO MATCHES FOUND" : "NO FAVORITES YET";
  const emptyMessage = searchTerm
    ? "No saved flashes match \"" + searchTerm + "\""
    : "Use the map to track invaders you want to hunt or mark as found";

  return (
    <div className="w-full max-w-4xl mx-auto p-2 sm:p-6 font-mono">
      {/* Header */}
      <div className="text-center mb-4 sm:mb-8">
        <pre className="text-green-400 text-[6px] sm:text-xs leading-none hidden sm:block">
          {`
███████╗ █████╗ ██╗   ██╗ ██████╗ ██████╗ ██╗████████╗███████╗███████╗
██╔════╝██╔══██╗██║   ██║██╔═══██╗██╔══██╗██║╚══██╔══╝██╔════╝██╔════╝
█████╗  ███████║██║   ██║██║   ██║██████╔╝██║   ██║   █████╗  ███████╗
██╔══╝  ██╔══██║╚██╗ ██╔╝██║   ██║██╔══██╗██║   ██║   ██╔══╝  ╚════██║
██║     ██║  ██║ ╚████╔╝ ╚██████╔╝██║  ██║██║   ██║   ███████╗███████║
╚═╝     ╚═╝  ╚═╝  ╚═══╝   ╚═════╝ ╚═╝  ╚═╝╚═╝   ╚═╝   ╚══════╝╚══════╝
`}
        </pre>
        <div className="text-green-400 text-lg sm:hidden font-mono font-bold">SAVED FLASHES</div>
        <div className="text-gray-400 text-[10px] sm:text-sm mt-2">
          YOUR BOOKMARKED FLASHES • {favorites.length} TOTAL
        </div>
      </div>

      {/* Controls */}
      <div className="mb-4 space-y-3">
        {/* Search */}
        <SearchBar
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* Sort and Export Controls */}
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          {/* Sort Controls */}
          <div className="flex gap-1 flex-wrap">
            <span className="text-green-400 text-xs self-center mr-2">SORT:</span>
            {[
              { key: 'newest', label: 'NEWEST' },
              { key: 'oldest', label: 'OLDEST' },
              { key: 'city', label: 'CITY' },
              { key: 'player', label: 'PLAYER' }
            ].map((sort) => (
              <button
                key={sort.key}
                onClick={() => setSortBy(sort.key as typeof sortBy)}
                className={`px-2 py-1 text-xs border transition-all duration-200 ${
                  sortBy === sort.key
                    ? 'bg-green-400 text-black border-green-400'
                    : 'bg-transparent text-green-400 border-gray-600 hover:border-green-400'
                }`}
              >
                {sort.label}
              </button>
            ))}
          </div>

          <div className="flex-1"></div>

          {/* Export Button */}
          {filteredFavorites.length > 0 && (
            <button
              onClick={handleExportGrid}
              className="px-3 py-1 text-xs border border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-black transition-all duration-200"
              title="Export as image grid"
            >
              [EX] EXPORT ({filteredFavorites.length})
            </button>
          )}
        </div>
      </div>

      {/* Flash Grid */}
      <FlashGrid
        items={items}
        emptyTitle={emptyTitle}
        emptyMessage={emptyMessage}
        renderCard={(item) => renderFavoriteCard(item)}
        footer={
          <div className="mt-8 text-center text-xs text-gray-500">
            <div>
              SHOWING {filteredFavorites.length} OF {favorites.length} SAVED FLASHES
            </div>
            {searchTerm && <div>FILTERED BY: &quot;{searchTerm}&quot;</div>}
            <div className="mt-2">{farcasterFid ? 'DATA SYNCED ACROSS DEVICES' : 'DATA STORED LOCALLY IN BROWSER'}</div>
          </div>
        }
      />
    </div>
  );
}