"use client";

import { fromUnixTime } from "date-fns";
import Image from "next/image";
import React, { useCallback, useEffect, useRef } from "react";
import { AlienLoader } from "~/components/atom/AlienLoader";
import { FadeInImage } from "~/components/atom/FadeInImage";
import { FlashGridSkeleton } from "~/components/atom/FlashGridSkeleton";
import { FETCH } from "~/lib/constants";
import formatTimeAgo from "~/lib/help/formatTimeAgo";

export interface FlashCardData {
  id: string;
  flashId: number;
  city: string;
  player: string;
  avatarUrl?: string | null;
  imageSrc: string;
  timestampSeconds: number;
  text?: string | null;
  onImageClick: () => void;
  onPlayerClick?: () => void;
}

export interface FlashGridProps {
  items: FlashCardData[];
  isLoading?: boolean;
  loadingSkeletonTiles?: number;
  isError?: boolean;
  onRetry?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void;
  sentinelOffset?: number;
  emptyTitle?: string;
  emptyMessage?: string;
  footer?: React.ReactNode;
  footerNote?: string;
  renderCard?: (
    item: FlashCardData,
    index: number,
    sentinelRef: (node: HTMLDivElement | null) => void
  ) => React.ReactNode;
}

function FlashCardContent({ item }: { item: FlashCardData }) {
  return (
    <>
      <div className="text-green-400 text-[10px] sm:text-xs font-bold">#{item.flashId.toLocaleString()}</div>
      <div className="text-gray-400 text-[10px] sm:text-xs flex items-center gap-1">
        {item.avatarUrl ? (
          <Image
            src={item.avatarUrl}
            alt={`${item.player} avatar`}
            width={12}
            height={12}
            className="rounded-full w-3 h-3"
          />
        ) : null}
        @ {item.player}
      </div>
      <div className="text-white text-xs sm:text-sm">{">"} {item.city}</div>
      {item.text ? (
        <div className="text-gray-300 text-[10px] sm:text-xs line-clamp-2">{item.text}</div>
      ) : null}
      <div className="text-gray-500 text-[10px] sm:text-xs">
        {formatTimeAgo(fromUnixTime(item.timestampSeconds))}
      </div>
    </>
  );
}

function DefaultFlashCard({
  item,
  sentinelRef,
}: {
  item: FlashCardData;
  sentinelRef: (node: HTMLDivElement | null) => void;
}) {
  return (
    <div
      ref={sentinelRef}
      className="bg-gray-900 border border-gray-600 hover:border-green-400 transition-all duration-200 group"
    >
      <button
        type="button"
        className="block w-full aspect-square overflow-hidden cursor-pointer relative active:opacity-75 transition-opacity"
        aria-label={"View flash #" + item.flashId}
        onClick={item.onImageClick}
      >
        <FadeInImage
          src={item.imageSrc}
          alt={"Flash " + item.flashId}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-200"
        />
      </button>
      {item.onPlayerClick ? (
        <button
          type="button"
          className="block w-full text-left p-2 sm:p-3 space-y-1 cursor-pointer active:opacity-75 transition-opacity"
          aria-label={"View profile of " + item.player}
          onClick={item.onPlayerClick}
        >
          <FlashCardContent item={item} />
        </button>
      ) : (
        <div className="p-2 sm:p-3 space-y-1">
          <FlashCardContent item={item} />
        </div>
      )}
    </div>
  );
}

export function FlashGrid({
  items,
  isLoading,
  loadingSkeletonTiles,
  isError,
  onRetry,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  sentinelOffset,
  emptyTitle,
  emptyMessage,
  footer,
  footerNote,
  renderCard,
}: FlashGridProps) {
  const observer = useRef<IntersectionObserver | null>(null);

  const lastItemRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading || isFetchingNextPage || !hasNextPage) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage?.();
        }
      });

      if (node) observer.current.observe(node);
    },
    [isLoading, isFetchingNextPage, hasNextPage, fetchNextPage]
  );

  useEffect(() => {
    return () => observer.current?.disconnect();
  }, []);

  const isEmpty = !isLoading && !isError && items.length === 0;
  const threshold = sentinelOffset ?? FETCH.THRESHOLD;

  const noop = useCallback(() => {}, []);

  return (
    <div>
      {isLoading ? (
        <FlashGridSkeleton tiles={loadingSkeletonTiles ?? 12} />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4">
          {items.map((item, index) => {
            const isSentinel = hasNextPage !== undefined && index === items.length - threshold;
            const sentinelRef = isSentinel ? lastItemRef : noop;

            if (renderCard) {
              return <React.Fragment key={item.id}>{renderCard(item, index, sentinelRef)}</React.Fragment>;
            }

            return <DefaultFlashCard key={item.id} item={item} sentinelRef={sentinelRef} />;
          })}
        </div>
      )}

      {isFetchingNextPage && <AlienLoader />}

      {isError && (
        <div className="text-center py-12">
          <div className="text-red-400 text-lg">SIGNAL LOST</div>
          <div className="text-gray-500 text-sm mt-2">Could not reach the flash database</div>
          <button
            onClick={onRetry}
            className="mt-4 px-4 py-2 border border-green-400 text-green-400 text-xs hover:bg-green-400 hover:text-black transition-colors"
          >
            RETRY
          </button>
        </div>
      )}

      {isEmpty && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg">{emptyTitle ?? "NO FLASHES FOUND"}</div>
          <div className="text-gray-500 text-sm mt-2">{emptyMessage ?? "No flashes available"}</div>
        </div>
      )}

      {!isLoading &&
        (footer ?? (
          <div className="mt-8 text-center text-xs text-gray-500">
            <div>SHOWING {items.length} FLASHES</div>
            {footerNote && <div className="mt-2">{footerNote}</div>}
          </div>
        ))}
    </div>
  );
}
