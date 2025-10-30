"use client";

import React, { useState, useMemo } from "react";
import { useGetProgress } from "~/hooks/api.flashcastrs.app/useGetProgress";
import { DailyProgress } from "~/lib/api.flashcastr.app/flashes";

interface ProgressProps {
  userProgress?: {
    fid: number;
    username: string;
    totalFlashes: number;
    citiesVisited: string[];
  };
}

type TimeRange = 7 | 14 | 30;

export function Progress({ userProgress }: ProgressProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>(30);

  const { data: progressData, isLoading, error } = useGetProgress(
    userProgress?.fid,
    timeRange,
    'DESC'
  );

  // Debug logging
  React.useEffect(() => {
    console.log('Progress component - FID:', userProgress?.fid, 'Days:', timeRange, 'Order: DESC');
    if (error) {
      console.error('Progress error:', error);
    }
  }, [userProgress?.fid, timeRange, error]);

  if (!userProgress?.fid) {
    return <NoUserState />;
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-black text-green-400 font-mono p-4">
      {/* Time Range Selector */}
      <div className="flex justify-center items-center gap-2 mb-4">
        <div className="flex gap-2 bg-gray-900 border border-green-400 p-1">
          {[7, 14, 30].map((days) => (
            <button
              key={days}
              onClick={() => setTimeRange(days as TimeRange)}
              className={`px-4 py-2 text-xs font-bold transition-all ${
                timeRange === days
                  ? 'bg-green-400 text-black'
                  : 'text-green-400 hover:bg-gray-800'
              }`}
            >
              {days}D
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState error={error} />
        ) : progressData && progressData.length > 0 ? (
          <>
            <ListView data={progressData} />
            <SummaryStats data={progressData} timeRange={timeRange} />
          </>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}

function ListView({ data }: { data: DailyProgress[] }) {
  return (
    <div className="max-h-[60vh] overflow-y-auto mb-4">
      {data.map((day) => (
        <ListItem key={day.date} day={day} />
      ))}
    </div>
  );
}

function ListItem({ day }: { day: DailyProgress }) {
  const date = new Date(day.date);
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();

  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div
      className={`flex justify-between items-center px-2 py-3 hover:bg-gray-900 transition-colors ${
        day.count === 0 ? 'opacity-40' : ''
      }`}
    >
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm">{dayName}</span>
          {isToday && (
            <span className="px-2 py-0.5 bg-green-400 text-black text-xs">TODAY</span>
          )}
        </div>
        <span className="text-xs text-gray-500">{formattedDate}</span>
      </div>

      <div className="text-2xl font-bold text-green-400">
        {day.count}
      </div>
    </div>
  );
}

function SummaryStats({ data, timeRange }: { data: DailyProgress[]; timeRange: number }) {
  const stats = useMemo(() => {
    const totalFlashes = data.reduce((sum, day) => sum + day.count, 0);
    const activeDays = data.filter(day => day.count > 0).length;
    const currentStreak = calculateStreak(data);
    const longestStreak = calculateLongestStreak(data);
    const averagePerDay = data.length > 0 ? (totalFlashes / data.length).toFixed(1) : '0.0';

    return { totalFlashes, activeDays, currentStreak, longestStreak, averagePerDay };
  }, [data]);

  return (
    <div className="border-2 border-green-400 bg-gray-900 p-4">
      <div className="text-center mb-4 text-sm font-bold">
        {">>> STATISTICS <<<"} ({timeRange} DAYS)
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatItem label="TOTAL FLASHES" value={stats.totalFlashes} />
        <StatItem label="ACTIVE DAYS" value={`${stats.activeDays}/${data.length}`} />
        <StatItem label="DAILY AVG" value={stats.averagePerDay} />
        <StatItem label="CURRENT STREAK" value={`${stats.currentStreak}d`} />
        <StatItem label="LONGEST STREAK" value={`${stats.longestStreak}d`} />
      </div>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="text-2xl font-bold text-green-400 mb-1">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

// Helper functions
function calculateStreak(data: DailyProgress[]): number {
  let streak = 0;
  const reversed = [...data].reverse();

  for (const day of reversed) {
    if (day.count > 0) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

function calculateLongestStreak(data: DailyProgress[]): number {
  let longest = 0;
  let current = 0;

  for (const day of data) {
    if (day.count > 0) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 0;
    }
  }

  return longest;
}

// State components
function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="border-2 border-green-400 p-8 text-center">
        <pre className="text-green-400 text-xs animate-pulse">
{`
╔═══════════════════════════╗
║                           ║
║   LOADING PROGRESS...     ║
║                           ║
╚═══════════════════════════╝
`}
        </pre>
      </div>
    </div>
  );
}

function ErrorState({ error }: { error: Error }) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="border-2 border-red-500 p-8 text-center bg-gray-900 max-w-2xl">
        <pre className="text-red-500 text-xs mb-4">
{`
╔═══════════════════════════╗
║                           ║
║   ERROR LOADING DATA      ║
║                           ║
╚═══════════════════════════╝
`}
        </pre>
        <p className="text-sm text-red-400 mb-2">{error.message}</p>
        <details className="text-xs text-left text-gray-500 mt-4">
          <summary className="cursor-pointer hover:text-gray-300">Technical Details</summary>
          <pre className="mt-2 p-2 bg-black border border-gray-700 overflow-auto max-h-40">
            {JSON.stringify(error, null, 2)}
          </pre>
        </details>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 border border-red-500 text-red-500 hover:bg-red-500 hover:text-black transition-colors"
        >
          [RETRY]
        </button>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="border-2 border-green-400 p-8 text-center">
        <pre className="text-green-400 text-xs mb-4">
{`
╔═══════════════════════════╗
║                           ║
║   NO DATA AVAILABLE       ║
║                           ║
╚═══════════════════════════╝
`}
        </pre>
        <p className="text-sm text-gray-500">No progress data found for this period.</p>
      </div>
    </div>
  );
}

function NoUserState() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-8">
      <div className="border-2 border-green-400 p-8 text-center bg-gray-900">
        <pre className="text-green-400 text-xs mb-4">
{`
╔═══════════════════════════╗
║                           ║
║   AUTHENTICATION REQUIRED ║
║                           ║
╚═══════════════════════════╝
`}
        </pre>
        <p className="text-sm text-gray-400">
          Please sign in with Farcaster to view your progress.
        </p>
      </div>
    </div>
  );
}
