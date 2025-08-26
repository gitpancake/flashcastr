"use client";

import { useState, useMemo } from "react";
import { getBadgeForFlashCount, formatFlashCount } from "~/lib/badges";

interface LeaderboardUser {
  fid: number;
  username: string;
  pfp_url: string;
  flashCount: number;
  citiesCount: number;
  rank?: number;
}

interface LeaderboardProps {
  users: LeaderboardUser[];
  currentUserFid?: number;
}

export function Leaderboard({ users, currentUserFid }: LeaderboardProps) {
  const [sortBy, setSortBy] = useState<'flashes' | 'cities'>('flashes');
  
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

  const currentUserRank = sortedUsers.find(u => u.fid === currentUserFid)?.rank;

  return (
    <div className="w-full max-w-4xl mx-auto p-6 font-mono">
      {/* ASCII Header */}
      <div className="text-center mb-8">
        <pre className="text-green-400 text-xs sm:text-sm leading-none">
{`
 ██╗     ███████╗ █████╗ ██████╗ ███████╗██████╗ 
 ██║     ██╔════╝██╔══██╗██╔══██╗██╔════╝██╔══██╗
 ██║     █████╗  ███████║██║  ██║█████╗  ██████╔╝
 ██║     ██╔══╝  ██╔══██║██║  ██║██╔══╝  ██╔══██╗
 ███████╗███████╗██║  ██║██████╔╝███████╗██║  ██║
 ╚══════╝╚══════╝╚═╝  ╚═╝╚═════╝ ╚══════╝╚═╝  ╚═╝
          ██████╗  ██████╗  █████╗ ██████╗ ██████╗ 
          ██╔══██╗██╔═══██╗██╔══██╗██╔══██╗██╔══██╗
          ██████╔╝██║   ██║███████║██████╔╝██║  ██║
          ██╔══██╗██║   ██║██╔══██║██╔══██╗██║  ██║
          ██████╔╝╚██████╔╝██║  ██║██║  ██║██████╔╝
          ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ 
`}
        </pre>
      </div>

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
        {/* Header */}
        <div className="grid grid-cols-12 gap-2 p-3 bg-gray-800 border border-gray-600 text-green-400 text-xs font-bold">
          <div className="col-span-1 text-center">RANK</div>
          <div className="col-span-1 text-center">BADGE</div>
          <div className="col-span-4">INVADER</div>
          <div className="col-span-2 text-center">FLASHES</div>
          <div className="col-span-2 text-center">CITIES</div>
          <div className="col-span-2 text-center">SCORE</div>
        </div>

        {/* Leaderboard Entries */}
        {sortedUsers.slice(0, 50).map((user) => {
          const badge = getBadgeForFlashCount(user.flashCount);
          const isCurrentUser = user.fid === currentUserFid;
          const score = user.flashCount + (user.citiesCount * 10); // Bonus points for cities
          
          return (
            <div
              key={user.fid}
              className={`
                grid grid-cols-12 gap-2 p-3 border transition-all duration-200
                ${isCurrentUser 
                  ? 'bg-green-900/50 border-green-400 text-green-400' 
                  : 'bg-gray-900 border-gray-700 text-gray-300 hover:border-gray-500'
                }
              `}
            >
              {/* Rank */}
              <div className="col-span-1 text-center font-bold">
                {user.rank === 1 && '👑'}
                {user.rank === 2 && '🥈'}
                {user.rank === 3 && '🥉'}
                {user.rank && user.rank > 3 && `#${user.rank}`}
              </div>

              {/* Badge */}
              <div className="col-span-1 text-center text-lg">
                {badge?.icon || '📱'}
              </div>

              {/* Username */}
              <div className="col-span-4 flex items-center">
                <div className="w-6 h-6 bg-gray-600 rounded mr-2 flex-shrink-0 overflow-hidden">
                  {user.pfp_url && (
                    <img 
                      src={user.pfp_url} 
                      alt={user.username}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="truncate font-mono text-sm">
                  @{user.username}
                </div>
              </div>

              {/* Flash Count */}
              <div className="col-span-2 text-center font-bold">
                {formatFlashCount(user.flashCount)}
              </div>

              {/* Cities Count */}
              <div className="col-span-2 text-center">
                {user.citiesCount}
              </div>

              {/* Score */}
              <div className="col-span-2 text-center font-bold text-purple-400">
                {score.toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Stats */}
      <div className="mt-8 text-center text-xs text-gray-500 font-mono">
        <div>TOTAL INVADERS: {users.length}</div>
        <div>TOTAL FLASHES: {users.reduce((sum, u) => sum + u.flashCount, 0).toLocaleString()}</div>
        <div>SCORE = FLASHES + (CITIES × 10)</div>
      </div>
    </div>
  );
}