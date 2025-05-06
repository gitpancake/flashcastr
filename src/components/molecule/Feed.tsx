"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { fromUnixTime } from "date-fns";
import { useEffect, useMemo, useRef, useState } from "react";
import useDebounce from "~/hooks/useDebounce";
import { FETCH } from "~/lib/constants";
import formatTimeAgo from "~/lib/help/formatTimeAgo";
import { Flashcastr } from "~/lib/mongodb/flashcastr/types";
import FlashCard from "./FlashCard";
import SearchBar from "./SearchBar";
import SectionTitle from "./SectionTitle";

type Props = {
  initialFlashes: Flashcastr[];
};

export default function Feed({ initialFlashes }: Props) {
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput, 500);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isFetching } = useInfiniteQuery({
    queryKey: ["flashes", search],
    queryFn: async ({ pageParam = 1 }) => {
      let url = `/api/flashes?page=${pageParam}&limit=${FETCH.LIMIT}`;

      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }

      const res = await axios.get(url);

      return res.data;
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
      {flashes.map(({ user, flash }: Flashcastr, index: number) => (
        <FlashCard
          ref={index === flashes.length - FETCH.THRESHOLD ? loadMoreRef : null}
          key={flash.flash_id.toString()}
          avatar={user.pfp_url ?? "/splash.png"}
          player={user.username ?? flash.player}
          city={flash.city}
          timeAgo={formatTimeAgo(fromUnixTime(flash.timestamp))}
          flashNumber={flash.flash_id.toLocaleString()}
          imageUrl={flash.img}
        />
      ))}

      {isFetchingNextPage && <div className="font-invader text-white animate-pulse text-center py-4">LOADING...</div>}
    </div>
  );
}
