"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { formatFlashCount } from "~/lib/badges";

interface LeaderboardUser {
  username: string;
  pfp_url: string | null;
  flashCount: number;
  citiesCount: number;
  rank?: number;
}

interface LeaderboardProps {
  users: LeaderboardUser[];
  currentUsername?: string;
}

export function Leaderboard({ users, currentUsername }: LeaderboardProps) {
  const [sortBy, setSortBy] = useState<'flashes' | 'cities'>('flashes');
  const router = useRouter();

  const sortedUsers = useMemo(() => {
    const sorted = [...users].sort((a, b) => {
      if (sortBy === 'flashes') {
        return b.flashCount - a.flashCount;
      }
      return b.citiesCount - a.citiesCount;
    });

    return sorted.map((user, index) => ({
      ...user,
      rank: index + 1
    }));
  }, [users, sortBy]);

  const currentUserRank = sortedUsers.find(u => u.username === currentUsername)?.rank;

  return (
    <div className="w-full max-w-4xl mx-auto p-2 sm:p-6 font-mono">

      {/* Current User Rank (if logged in) */}
      {currentUserRank && (
        <div className="bg-gray-900 border-2 border-green-400 p-4 mb-6 text-center">
          <div className="text-green-400 text-sm">YOUR RANK</div>
          <div className="text-white text-xl font-bold">#{currentUserRank}</div>
        </div>
      )}

      {/* Sort Controls */}
      <div className="flex justify-center mb-6">
        <div className="bg-gray-900 border-2 border-gray-600 p-1 flex">
          <button
            onClick={() => setSortBy('flashes')}
            className={`px-4 py-2 text-sm transition-all duration-200 ${
              sortBy === 'flashes'
                ? 'bg-green-400 text-black'
                : 'text-green-400 hover:bg-gray-800'
            }`}
          >
            [F] FLASHES
          </button>
          <button
            onClick={() => setSortBy('cities')}
            className={`px-4 py-2 text-sm transition-all duration-200 ${
              sortBy === 'cities'
                ? 'bg-green-400 text-black'
                : 'text-green-400 hover:bg-gray-800'
            }`}
          >
            [C] CITIES
          </button>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="space-y-2">
        {/* Header - Simplified */}
        <div className="grid grid-cols-3 gap-1 sm:gap-2 p-2 sm:p-3 bg-gray-900 border border-green-400 text-green-400 text-xs font-bold">
          <div className="col-span-1 text-center">RANK</div>
          <div className="col-span-1">PLAYER</div>
          <div className="col-span-1 text-center">{sortBy === 'flashes' ? 'FLASHES' : 'CITIES'}</div>
        </div>

        {/* Leaderboard Entries - Simplified */}
        {sortedUsers.slice(0, 50).map((user) => {
          const isCurrentUser = user.username === currentUsername;
          const primaryStat = sortBy === 'flashes' ? user.flashCount : user.citiesCount;

          return (
            <div
              key={user.username}
              onClick={() => router.push(`/?search=${encodeURIComponent(user.username)}`)}
              className={`
                grid grid-cols-3 gap-1 sm:gap-2 p-2 sm:p-3 border transition-all duration-200 text-xs sm:text-sm cursor-pointer
                ${isCurrentUser
                  ? 'bg-green-900/50 border-green-400 text-green-400 hover:bg-green-800/50'
                  : 'bg-gray-900 border-gray-700 text-gray-300 hover:border-gray-500 hover:bg-gray-800'
                }
              `}
            >
              {/* Rank - Simple numbers only */}
              <div className="col-span-1 text-center font-bold">
                {user.rank}
              </div>

              {/* Username with Avatar */}
              <div className="col-span-1 flex items-center gap-1 sm:gap-2">
                <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-full flex-shrink-0 overflow-hidden relative">
                  {user.pfp_url ? (
                    <Image
                      src={user.pfp_url}
                      alt={user.username}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        // Replace with purple alien on error
                        e.currentTarget.src = '/icon.png';
                      }}
                    />
                  ) : (
                    <Image
                      src="/icon.png"
                      alt="Space Invader"
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="truncate font-mono text-[10px] sm:text-sm">
                  {user.username}
                </div>
              </div>

              {/* Primary Stat */}
              <div className="col-span-1 text-center font-bold">
                {formatFlashCount(primaryStat)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Stats */}
      <div className="mt-8 text-center text-xs text-gray-500 font-mono">
        <div>TOTAL INVADERS: {users.length}</div>
        <div>TOTAL FLASHES: {users.reduce((sum, u) => sum + u.flashCount, 0).toLocaleString()}</div>
      </div>
    </div>
  );
}