"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { InvadersFunApi, type GlobalFlash } from "~/lib/api.invaders.fun/flashes";

interface GlobalFlashesProps {
  initialFlashes?: GlobalFlash[];
}

export function GlobalFlashes({ initialFlashes = [] }: GlobalFlashesProps) {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [trendingCities, setTrendingCities] = useState<{city: string, count: number}[]>([]);
  
  const api = useMemo(() => new InvadersFunApi(), []);

  // Fetch trending data
  useEffect(() => {
    const fetchData = async () => {
      const trendingData = await api.getTrendingCities(true); // Exclude Paris
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
        <pre className="text-green-400 text-[6px] sm:text-xs leading-none hidden sm:block">
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
        <div className="text-green-400 text-lg sm:hidden font-mono font-bold">
          GLOBAL FLASH
        </div>
        <div className="text-gray-400 text-[10px] sm:text-sm mt-2">
          OFFICIAL SPACE INVADER FLASHES * SCRAPED FROM THE GAME
        </div>
      </div>

      {/* Combined Filters - Compact */}
      <div className="mb-4 bg-gray-900 border border-green-400 p-2">
        <div className="text-green-400 text-xs font-bold mb-2">FILTER</div>
        
        {/* Trending Cities - One line */}
        {trendingCities.length > 0 && (
          <div className="mb-2">
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
        
        {/* All Cities Toggle */}
        <div className="flex gap-1">
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
          {selectedCity && (
            <div className="text-green-400 text-[10px] py-1 px-2 border border-green-400">
              {">"} {selectedCity.toUpperCase()}
            </div>
          )}
        </div>
      </div>

      {/* Flash Grid - Mobile First */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4">
        {flashes.map((flash, index) => (
          <div
            key={`${flash.flash_id}-${index}`}
            ref={index === flashes.length - 10 ? lastFlashRef : null}
            className="bg-gray-900 border border-gray-600 hover:border-green-400 transition-all duration-200 group"
          >
            {/* Flash Image */}
            <div className="aspect-square overflow-hidden">
              <img
                src={`https://invader-flashes.s3.amazonaws.com${flash.img}`}
                alt={`Flash ${flash.flash_id}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                loading="lazy"
                // eslint-disable-next-line @next/next/no-img-element
              />
            </div>

            {/* Flash Info */}
            <div className="p-2 sm:p-3 space-y-1">
              <div className="text-green-400 text-[10px] sm:text-xs font-bold">
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
                {new Date(flash.timestamp * 1000).toLocaleDateString('en-US', { 
                  month: '2-digit', 
                  day: '2-digit', 
                  year: '2-digit' 
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Loading States */}
      {(isLoading || isFetchingNextPage) && (
        <div className="text-center py-12">
          <div className="text-green-400 text-sm animate-pulse">
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