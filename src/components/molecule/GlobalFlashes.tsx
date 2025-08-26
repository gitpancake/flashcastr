"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { InvadersFunApi, type GlobalFlash } from "~/lib/api.invaders.fun/flashes";

interface GlobalFlashesProps {
  initialFlashes?: GlobalFlash[];
}

export function GlobalFlashes({ initialFlashes = [] }: GlobalFlashesProps) {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [cities, setCities] = useState<string[]>([]);
  const [trendingCities, setTrendingCities] = useState<{city: string, count: number}[]>([]);
  
  const api = useMemo(() => new InvadersFunApi(), []);

  // Fetch cities and trending data
  useEffect(() => {
    const fetchData = async () => {
      const [citiesData, trendingData] = await Promise.all([
        api.getGlobalCities(),
        api.getTrendingCities(true) // Exclude Paris
      ]);
      setCities(citiesData);
      setTrendingCities(trendingData);
    };
    fetchData();
  }, [api]);

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["global-flashes", selectedCity],
    queryFn: async ({ pageParam = 0 }) => {
      return await api.getGlobalFlashes(pageParam as number, 40, selectedCity);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasNext) return undefined;
      return allPages.reduce((acc, page) => acc + page.items.length, 0);
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const flashes = data?.pages?.flatMap(page => page.items) || initialFlashes;

  // Intersection observer for infinite scroll
  const observer = useRef<IntersectionObserver | null>(null);
  const lastFlashRef = useCallback(
    (node: HTMLDivElement) => {
      if (isLoading || isFetchingNextPage || !hasNextPage) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      });

      if (node) observer.current.observe(node);
    },
    [isLoading, isFetchingNextPage, hasNextPage, fetchNextPage]
  );

  return (
    <div className="w-full max-w-6xl mx-auto p-2 sm:p-6 font-mono">
      {/* ASCII Header - Mobile Responsive */}
      <div className="text-center mb-4 sm:mb-8">
        <pre className="text-cyan-400 text-[6px] sm:text-xs leading-none hidden sm:block">
{`
  ██████╗ ██╗      ██████╗ ██████╗  █████╗ ██╗     
 ██╔════╝ ██║     ██╔═══██╗██╔══██╗██╔══██╗██║     
 ██║  ███╗██║     ██║   ██║██████╔╝███████║██║     
 ██║   ██║██║     ██║   ██║██╔══██╗██╔══██║██║     
 ╚██████╔╝███████╗╚██████╔╝██████╔╝██║  ██║███████╗
  ╚═════╝ ╚══════╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝
          ███████╗██╗      █████╗ ███████╗██╗  ██╗
          ██╔════╝██║     ██╔══██╗██╔════╝██║  ██║
          █████╗  ██║     ███████║███████╗███████║
          ██╔══╝  ██║     ██╔══██║╚════██║██╔══██║
          ██║     ███████╗██║  ██║███████║██║  ██║
          ╚═╝     ╚══════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝
`}
        </pre>
        <div className="text-cyan-400 text-lg sm:hidden font-mono font-bold">
          GLOBAL FLASH
        </div>
        <div className="text-gray-400 text-[10px] sm:text-sm mt-2">
          OFFICIAL SPACE INVADER FLASHES * SCRAPED FROM THE GAME
        </div>
      </div>

      {/* Trending Cities Bar (excluding Paris) */}
      {trendingCities.length > 0 && (
        <div className="mb-6 bg-gray-900 border-2 border-gray-600 p-4">
          <div className="text-cyan-400 text-sm font-bold mb-2">TRENDING CITIES</div>
          <div className="flex flex-wrap gap-2">
            {trendingCities.slice(0, 8).map((cityData) => (
              <button
                key={cityData.city}
                onClick={() => setSelectedCity(selectedCity === cityData.city ? null : cityData.city)}
                className={`
                  px-3 py-1 text-xs border transition-all duration-200
                  ${selectedCity === cityData.city 
                    ? 'bg-cyan-400 text-black border-cyan-400' 
                    : 'bg-transparent text-cyan-400 border-cyan-400 hover:bg-cyan-400 hover:text-black'
                  }
                `}
              >
                {cityData.city.toUpperCase()} ({cityData.count})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* City Filter */}
      {cities.length > 0 && (
        <div className="mb-6 bg-gray-900 border border-gray-600 p-4">
          <div className="text-cyan-400 text-sm font-bold mb-2">FILTER BY CITY</div>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            <button
              onClick={() => setSelectedCity(null)}
              className={`
                px-2 py-1 text-xs border transition-all duration-200
                ${selectedCity === null 
                  ? 'bg-cyan-400 text-black border-cyan-400' 
                  : 'bg-transparent text-cyan-400 border-gray-600 hover:border-cyan-400'
                }
              `}
            >
              ALL CITIES
            </button>
            {cities.map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(selectedCity === city ? null : city)}
                className={`
                  px-2 py-1 text-xs border transition-all duration-200
                  ${selectedCity === city 
                    ? 'bg-cyan-400 text-black border-cyan-400' 
                    : 'bg-transparent text-cyan-400 border-gray-600 hover:border-cyan-400'
                  }
                `}
              >
                {city.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Flash Grid - Mobile First */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4">
        {flashes.map((flash, index) => (
          <div
            key={`${flash.flash_id}-${index}`}
            ref={index === flashes.length - 10 ? lastFlashRef : null}
            className="bg-gray-900 border border-gray-600 hover:border-cyan-400 transition-all duration-200 group"
          >
            {/* Flash Image */}
            <div className="aspect-square overflow-hidden">
              <img
                src={`https://invader-flashes.s3.amazonaws.com${flash.img}`}
                alt={`Flash ${flash.flash_id}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                loading="lazy"
              />
            </div>

            {/* Flash Info */}
            <div className="p-2 sm:p-3 space-y-1">
              <div className="text-cyan-400 text-[10px] sm:text-xs font-bold">
                #{flash.flash_id}
              </div>
              <div className="text-white text-xs sm:text-sm">
                {">"} {flash.city}
              </div>
              <div className="text-gray-400 text-[10px] sm:text-xs">
                @ {flash.player}
              </div>
              {flash.text && (
                <div className="text-gray-300 text-[10px] sm:text-xs line-clamp-2">
                  {flash.text}
                </div>
              )}
              <div className="text-gray-500 text-[10px] sm:text-xs">
                {new Date(flash.timestamp * 1000).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Loading States */}
      {(isLoading || isFetchingNextPage) && (
        <div className="text-center py-12">
          <div className="text-cyan-400 text-sm animate-pulse">
            LOADING FLASHES...
          </div>
          <div className="text-gray-500 text-xs mt-2">
            {`>>`} SCANNING GLOBAL DATABASE {`<<`}
          </div>
        </div>
      )}

      {/* No Results */}
      {!isLoading && flashes.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg">
            NO FLASHES FOUND
          </div>
          <div className="text-gray-500 text-sm mt-2">
            {selectedCity ? `No flashes in ${selectedCity}` : 'No global flashes available'}
          </div>
        </div>
      )}

      {/* Footer Stats */}
      <div className="mt-8 text-center text-xs text-gray-500">
        <div>SHOWING {flashes.length} FLASHES</div>
        {selectedCity && <div>FILTERED BY: {selectedCity.toUpperCase()}</div>}
        <div className="mt-2">DATA SOURCE: INVADERS.FUN</div>
      </div>
    </div>
  );
}