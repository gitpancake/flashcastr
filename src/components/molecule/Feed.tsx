"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { FlashCardData, FlashGrid } from "~/components/molecule/FlashGrid";
import { FlashResponse, flashesApi } from "~/lib/api.flashcastr.app/flashes";
import { FETCH } from "~/lib/constants";
import { getImageUrl } from "~/lib/help/getImageUrl";
import { queryKeys } from "~/lib/queryKeys";

type Props = {
  initialFlashes: FlashResponse[];
  fid?: number;
  showHeader?: boolean;
};

export default function Feed({ initialFlashes, fid, showHeader = false }: Props) {
  const router = useRouter();

  const { data, hasNextPage, isFetchingNextPage, fetchNextPage, isError, refetch } = useInfiniteQuery({
    queryKey: queryKeys.userFlashesFeed(fid),
    queryFn: async ({ pageParam = 1 }) => {
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
    staleTime: 300_000,
    refetchOnWindowFocus: false,
  });

  const flashes = useMemo(
    () =>
      (data?.pages?.flat() || []).filter((item) => {
        const timestamp = Number(item.flash?.timestamp);
        return Number.isFinite(timestamp) && timestamp > 0;
      }),
    [data]
  );

  const items: FlashCardData[] = useMemo(
    () =>
      flashes.map(({ user_fid, user_pfp_url, user_username, flash }: FlashResponse) => ({
        id: flash.flash_id.toString(),
        flashId: flash.flash_id,
        city: flash.city,
        player: user_username || flash.player,
        avatarUrl: user_pfp_url || null,
        imageSrc: getImageUrl(flash),
        timestampSeconds: Number(flash.timestamp),
        text: undefined,
        onImageClick: () => router.push(`/flash/${flash.flash_id}`),
        onPlayerClick: () => router.push(`/profile/${user_fid || flash.player}`),
      })),
    [flashes, router]
  );

  return (
    <div className="w-full max-w-4xl mx-auto p-2 sm:p-6 font-mono">
      {/* ASCII Header - Mobile Responsive - Only show if showHeader is true */}
      {showHeader && (
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
██║     ███████╗███████╗██████╗╝
╚═╝     ╚══════╝╚══════╝╚═════╝ 
`}
          </pre>
          <div className="text-green-400 text-lg sm:hidden font-mono font-bold">YOUR FEED</div>
          <div className="text-gray-400 text-[10px] sm:text-sm mt-2">PERSONAL FLASH FEED * CONNECTED TO FARCASTER</div>
        </div>
      )}

      <FlashGrid
        items={items}
        isError={isError}
        onRetry={() => refetch()}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
        footerNote="DATA SOURCE: FLASHCASTR API"
      />
    </div>
  );
}
