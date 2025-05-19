"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { fromUnixTime } from "date-fns";
import { useEffect, useMemo, useRef, useState } from "react";
import useDebounce from "~/hooks/useDebounce";
import { FlashResponse, FlashesApi } from "~/lib/api.flashcastr.app/flashes";
import { FETCH } from "~/lib/constants";
import formatTimeAgo from "~/lib/help/formatTimeAgo";
import FlashCard from "./FlashCard";
import SearchBar from "./SearchBar";
import SectionTitle from "./SectionTitle";
import { useFrame } from "../providers/FrameProvider";

type Props = {
  initialFlashes: FlashResponse[];
  fid?: number;
};

export default function Feed({ initialFlashes, fid }: Props) {
  const { context } = useFrame();
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput, 500);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isFetching } = useInfiniteQuery({
    queryKey: ["flashes", search, fid],
    queryFn: async ({ pageParam = 1 }) => {
      const flashesApi = new FlashesApi();
      return flashesApi.getFlashes(pageParam, FETCH.LIMIT, fid, search);
    },
    getNextPageParam: (lastPage, allPages) => (lastPage.length === FETCH.LIMIT ? allPages.length + 1 : undefined),
    initialPageParam: 1,
    initialData: {
      pages: [initialFlashes],
      pageParams: [1],
    },
  });

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
    <div className="flex flex-col gap-4 p-4 w-full max-w-2xl animate-fade-in">
      <SearchBar value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
      <SectionTitle>Recent Flashes</SectionTitle>

      {searchInput && isFetching && <div className="font-invader text-white animate-pulse text-center py-2">SEARCHING...</div>}
      {flashes.map(({ user_fid, user_pfp_url, user_username, flash, cast_hash }: FlashResponse, index: number) => {
        const timestampSeconds = Math.floor(flash.timestamp / 1000);
        const timestamp = fromUnixTime(timestampSeconds);

        return (
          <FlashCard
            ref={index === flashes.length - FETCH.THRESHOLD ? loadMoreRef : null}
            key={flash.flash_id.toString()}
            avatar={user_pfp_url ?? "/splash.png"}
            player={user_username ?? flash.player}
            isPlayer={context?.user?.fid === user_fid}
            fid={user_fid}
            city={flash.city}
            timeAgo={formatTimeAgo(timestamp)}
            flashNumber={flash.flash_id.toLocaleString()}
            imageUrl={flash.img}
            castHash={cast_hash}
          />
        );
      })}

      {isFetchingNextPage && <div className="font-invader text-white animate-pulse text-center py-4">LOADING...</div>}
    </div>
  );
}
