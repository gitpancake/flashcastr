"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { fromUnixTime } from "date-fns";
import { useEffect, useMemo, useRef, useState } from "react";
import useDebounce from "~/hooks/useDebounce";
import formatTimeAgo from "~/lib/help/formatTimeAgo";
import { Flash } from "~/lib/mongodb/flashes/types";
import { players } from "~/lib/players";
import FlashCard from "./FlashCard";
import SearchBar from "./SearchBar";
import SectionTitle from "./SectionTitle";

const LIMIT = 40;
const fetchThreshold = 15;

export default function Feed() {
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput, 500);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isFetching } = useInfiniteQuery({
    queryKey: ["flashes", search],
    queryFn: async ({ pageParam = 1 }) => {
      let url = `/api/flashes?page=${pageParam}&limit=${LIMIT}`;

      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }

      const res = await axios.get(url);

      return res.data;
    },
    getNextPageParam: (lastPage, allPages) => (lastPage.length === LIMIT ? allPages.length + 1 : undefined),
    initialPageParam: 1,
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

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }
    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="h-screen w-screen bg-black flex justify-center overflow-y-auto">
      <div className="flex flex-col gap-4 p-4 w-full max-w-2xl animate-fade-in">
        <SearchBar value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
        <SectionTitle>Recent Flashes</SectionTitle>
        {searchInput && isFetching && <div className="font-invader text-white animate-pulse text-center py-2">SEARCHING...</div>}
        {flashes.map((flash: Flash, index: number) => (
          <FlashCard
            ref={index === flashes.length - fetchThreshold ? loadMoreRef : null}
            key={flash.flash_id.toString()}
            player={players.find((player) => player.username === flash.player)?.fid.toString() ?? flash.player}
            city={flash.city}
            timeAgo={formatTimeAgo(fromUnixTime(flash.timestamp))}
            flashNumber={flash.flash_id.toLocaleString()}
            imageUrl={flash.img}
          />
        ))}

        {isFetchingNextPage && <div className="font-invader text-white animate-pulse text-center py-4">LOADING...</div>}
      </div>
    </div>
  );
}
