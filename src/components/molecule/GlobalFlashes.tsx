"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";
import { FlashGrid, type FlashCardData } from "~/components/molecule/FlashGrid";
import { globalFlashesApi, type GlobalFlash } from "~/lib/api.flashcastr.app/globalFlashes";
import { getImageUrl } from "~/lib/help/getImageUrl";
import { queryKeys } from "~/lib/queryKeys";

interface GlobalFlashesProps {
  initialFlashes?: GlobalFlash[];
}

export function GlobalFlashes({ initialFlashes = [] }: GlobalFlashesProps) {
  const router = useRouter();
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [trendingCities, setTrendingCities] = useState<{city: string, count: number}[]>([]);
  const [allCities, setAllCities] = useState<string[]>([]);
  const [showAllCities, setShowAllCities] = useState(false);
  
  // Fetch trending cities immediately, load all cities only when needed
  useEffect(() => {
    const fetchTrendingData = async () => {
      const trendingData = await globalFlashesApi.getTrendingCities(true); // Exclude Paris
      setTrendingCities(trendingData);
    };
    fetchTrendingData();
  }, []);

  // Load all cities only when user requests to see them
  const loadAllCities = async () => {
    if (allCities.length === 0) {
      const cities = await globalFlashesApi.getGlobalCities();
      setAllCities(cities.sort());
    }
    setShowAllCities(true);
  };

  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: queryKeys.globalFlashes(selectedCity ?? undefined),
    queryFn: async ({ pageParam = 1 }) => {
      return await globalFlashesApi.getGlobalFlashes(pageParam as number, 40, selectedCity);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasNext) return undefined;
      return allPages.length + 1;
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const flashes = (data?.pages?.flatMap(page => page.items) || initialFlashes).filter(flash => flash.timestamp !== null);

  const items: FlashCardData[] = flashes.map((flash: GlobalFlash) => ({
    id: String(flash.flash_id),
    flashId: flash.flash_id,
    city: flash.city,
    player: flash.player,
    avatarUrl: null,
    imageSrc: getImageUrl(flash),
    timestampSeconds: flash.timestamp as number,
    text: flash.text || undefined,
    onImageClick: () => router.push(`/flash/${flash.flash_id}`),
  }));

  return (
    <div className="w-full max-w-6xl mx-auto p-2 sm:p-6 font-mono">

      {/* Combined Filters - Compact */}
      <div className="mb-4 bg-gray-900 border border-green-400 p-2">
        <div className="text-green-400 text-xs font-bold mb-2">FILTER</div>
        
        {/* Trending Cities - One line */}
        {trendingCities.length > 0 && (
          <div className="mb-2">
            <div className="text-gray-400 text-[9px] mb-1">TRENDING:</div>
            <div className="flex flex-wrap gap-1">
              {trendingCities.slice(0, 6).map((cityData) => (
                <button
                  key={cityData.city}
                  onClick={() => setSelectedCity(selectedCity === cityData.city ? null : cityData.city)}
                  className={`
                    px-2 py-1 text-[10px] border transition-all duration-200
                    ${selectedCity === cityData.city 
                      ? 'bg-green-400 text-black border-green-400' 
                      : 'bg-transparent text-green-400 border-green-400 hover:bg-green-400 hover:text-black'
                    }
                  `}
                >
                  {cityData.city.toUpperCase()} ({cityData.count})
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Controls Row */}
        <div className="flex gap-1 items-center flex-wrap">
          <button
            onClick={() => setSelectedCity(null)}
            className={`
              px-2 py-1 text-[10px] border transition-all duration-200
              ${selectedCity === null 
                ? 'bg-green-400 text-black border-green-400' 
                : 'bg-transparent text-green-400 border-gray-600 hover:border-green-400'
              }
            `}
          >
            ALL
          </button>
          
          <button
            onClick={() => showAllCities ? setShowAllCities(false) : loadAllCities()}
            className={`
              px-2 py-1 text-[10px] border transition-all duration-200
              ${showAllCities
                ? 'bg-cyan-400 text-black border-cyan-400'
                : 'bg-transparent text-cyan-400 border-cyan-400 hover:bg-cyan-400 hover:text-black'
              }
            `}
          >
            {showAllCities ? 'HIDE CITIES' : 'ALL CITIES'}
          </button>
          
          {selectedCity && (
            <div className="text-green-400 text-[10px] py-1 px-2 border border-green-400">
              {">"} {selectedCity.toUpperCase()}
            </div>
          )}
        </div>
        
        {/* All Cities Grid - Expandable */}
        {showAllCities && allCities.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-600">
            <div className="text-gray-400 text-[9px] mb-1">ALL CITIES:</div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1">
              {allCities.map((city) => (
                <button
                  key={city}
                  onClick={() => {
                    setSelectedCity(selectedCity === city ? null : city);
                    setShowAllCities(false);
                  }}
                  className={`
                    px-2 py-1 text-[10px] border transition-all duration-200 text-left
                    ${selectedCity === city 
                      ? 'bg-green-400 text-black border-green-400' 
                      : 'bg-transparent text-green-400 border-gray-600 hover:border-green-400 hover:bg-green-400 hover:text-black'
                    }
                  `}
                >
                  {city.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <FlashGrid
        items={items}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
        emptyMessage={selectedCity ? `No flashes in ${selectedCity}` : "No global flashes available"}
        footer={
          <div className="mt-8 text-center text-xs text-gray-500">
            <div>SHOWING {flashes.length} FLASHES</div>
            {selectedCity && <div>FILTERED BY: {selectedCity.toUpperCase()}</div>}
            <div className="mt-2">DATA SOURCE: FLASHCASTR.APP</div>
          </div>
        }
      />
    </div>
  );
}