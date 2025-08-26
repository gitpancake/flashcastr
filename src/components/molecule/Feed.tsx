"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { fromUnixTime } from "date-fns";
import { useEffect, useMemo, useRef } from "react";
import { FlashResponse, FlashesApi } from "~/lib/api.flashcastr.app/flashes";
import { FETCH } from "~/lib/constants";
import formatTimeAgo from "~/lib/help/formatTimeAgo";

type Props = {
  initialFlashes: FlashResponse[];
  fid?: number;
};

export default function Feed({ initialFlashes, fid }: Props) {
  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey: [fid ? `flashes-${fid}` : "flashes", fid],
    queryFn: async ({ pageParam = 1 }) => {
      const flashesApi = new FlashesApi();
      return await flashesApi.getFlashes(pageParam, FETCH.LIMIT, fid);
    },
    getNextPageParam: (lastPage, allPages) => {
      // Add null check for lastPage
      if (!lastPage || !Array.isArray(lastPage)) return undefined;
      return lastPage.length === FETCH.LIMIT ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
    initialData: {
      pages: [initialFlashes],
      pageParams: [1],
    },
    enabled: !!fid, // Only run query when fid is defined
  });

  console.log({ data });

  const flashes = useMemo(() => data?.pages?.flat() || [], [data]);

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 1 }
    );

    const current = loadMoreRef.current;

    if (current) {
      observer.observe(current);
    }

    return () => {
      if (current) {
        observer.unobserve(current);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="w-full max-w-4xl mx-auto p-2 sm:p-6 font-mono">
      {/* ASCII Header - Mobile Responsive */}
      <div className="text-center mb-4 sm:mb-8">
        <pre className="text-green-400 text-[6px] sm:text-xs leading-none hidden sm:block">
          {`
██╗   ██╗ ██████╗ ██╗   ██╗██████╗     
╚██╗ ██╔╝██╔═══██╗██║   ██║██╔══██╗    
 ╚████╔╝ ██║   ██║██║   ██║██████╔╝    
  ╚██╔╝  ██║   ██║██║   ██║██╔══██╗    
   ██║   ╚██████╔╝╚██████╔╝██║  ██║    
   ╚═╝    ╚═════╝  ╚═════╝ ╚═╝  ╚═╝    
███████╗███████╗███████╗██████╗ 
██╔════╝██╔════╝██╔════╝██╔══██╗
█████╗  █████╗  █████╗  ██║  ██║
██╔══╝  ██╔══╝  ██╔══╝  ██║  ██║
██║     ███████╗███████╗██████╔╝
╚═╝     ╚══════╝╚══════╝╚═════╝ 
`}
        </pre>
        <div className="text-green-400 text-lg sm:hidden font-mono font-bold">YOUR FEED</div>
        <div className="text-gray-400 text-[10px] sm:text-sm mt-2">PERSONAL FLASH FEED * CONNECTED TO FARCASTER</div>
      </div>

      {/* Flash Grid - Same as Global */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4">
        {flashes.map(({ user_pfp_url, user_username, flash, cast_hash }: FlashResponse, index: number) => {
          const timestampSeconds = Math.floor(flash.timestamp / 1000);
          const timestamp = fromUnixTime(timestampSeconds);

          return (
            <div
              key={flash.flash_id.toString()}
              ref={index === flashes.length - FETCH.THRESHOLD ? loadMoreRef : null}
              className="bg-gray-900 border border-gray-600 hover:border-green-400 transition-all duration-200 group cursor-pointer"
              onClick={() => {
                if (cast_hash) {
                  window.open(`https://warpcast.com/${user_username}/${cast_hash}`, "_blank");
                } else {
                  window.open(`https://invader-flashes.s3.amazonaws.com${flash.img}`, "_blank");
                }
              }}
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
                <div className="text-green-400 text-[10px] sm:text-xs font-bold">#{flash.flash_id.toLocaleString()}</div>
                <div className="text-white text-xs sm:text-sm flex items-center gap-1">
                  {user_pfp_url && (
                    <img
                      src={user_pfp_url}
                      alt={user_username || flash.player}
                      className="w-3 h-3 rounded-full"
                      // eslint-disable-next-line @next/next/no-img-element
                    />
                  )}
                  @ {user_username || flash.player}
                </div>
                <div className="text-gray-400 text-[10px] sm:text-xs">
                  {">"} {flash.city}
                </div>
                <div className="text-gray-500 text-[10px] sm:text-xs">{formatTimeAgo(timestamp)}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Loading States */}
      {isFetchingNextPage && (
        <div className="text-center py-12">
          <div className="text-green-400 text-sm animate-pulse">LOADING FLASHES...</div>
          <div className="text-gray-500 text-xs mt-2">
            {`>>`} SCANNING FEED DATABASE {`<<`}
          </div>
        </div>
      )}

      {/* No Results */}
      {flashes.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg">NO FLASHES FOUND</div>
          <div className="text-gray-500 text-sm mt-2">No flashes available</div>
        </div>
      )}

      {/* Footer Stats */}
      <div className="mt-8 text-center text-xs text-gray-500">
        <div>SHOWING {flashes.length} FLASHES</div>
        <div className="mt-2">DATA SOURCE: FLASHCASTR API</div>
      </div>
    </div>
  );
}
