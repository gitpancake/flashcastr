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

type ViewMode = 'heatmap' | 'list';
type TimeRange = 7 | 14 | 30;

export function Progress({ userProgress }: ProgressProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('heatmap');
  const [timeRange, setTimeRange] = useState<TimeRange>(7);

  const { data: progressData, isLoading, error } = useGetProgress(
    userProgress?.fid,
    timeRange,
    viewMode === 'list' ? 'DESC' : 'ASC'
  );

  if (!userProgress?.fid) {
    return <NoUserState />;
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-black text-green-400 font-mono p-4">
      {/* Header */}
      <div className="border-2 border-green-400 mb-4">
        <div className="bg-green-400 text-black px-4 py-2 text-center font-bold">
          {">>> PROGRESS TRACKER <<<"} {userProgress.username.toUpperCase()}
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border-t border-green-400">
          {/* View Toggle */}
          <div className="flex gap-2 bg-gray-900 border border-green-400 p-1">
            <button
              onClick={() => setViewMode('heatmap')}
              className={`px-4 py-2 text-xs font-bold transition-all ${
                viewMode === 'heatmap'
                  ? 'bg-green-400 text-black'
                  : 'text-green-400 hover:bg-gray-800'
              }`}
            >
              [█] HEATMAP
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 text-xs font-bold transition-all ${
                viewMode === 'list'
                  ? 'bg-green-400 text-black'
                  : 'text-green-400 hover:bg-gray-800'
              }`}
            >
              [≡] LIST
            </button>
          </div>

          {/* Time Range Selector */}
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
      </div>

      {/* Content */}
      <div className="flex-1">
        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState error={error} />
        ) : progressData && progressData.length > 0 ? (
          <>
            {viewMode === 'heatmap' ? (
              <HeatmapView data={progressData} />
            ) : (
              <ListView data={progressData} />
            )}
            <SummaryStats data={progressData} timeRange={timeRange} />
          </>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}

function HeatmapView({ data }: { data: DailyProgress[] }) {
  const weeks = useMemo(() => organizeIntoWeeks(data), [data]);
  const weekdays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div className="border-2 border-green-400 p-4 mb-4 bg-gray-900">
      <div className="text-center mb-4 text-sm">
        {">>> ACTIVITY HEATMAP <<<"}
      </div>

      <div className="flex justify-center overflow-x-auto">
        <div className="inline-flex gap-1">
          {/* Weekday labels */}
          <div className="flex flex-col justify-around text-xs mr-2 text-gray-500">
            {weekdays.map((day, i) => (
              <div key={i} className="h-3 flex items-center">{day}</div>
            ))}
          </div>

          {/* Heatmap grid */}
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((day, dayIndex) => (
                <HeatmapCell key={dayIndex} day={day} />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-500">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className="w-3 h-3 border border-gray-700"
            style={{ backgroundColor: getColorForLevel(level) }}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

function HeatmapCell({ day }: { day: DailyProgress }) {
  const level = getIntensityLevel(day.count);
  const color = getColorForLevel(level);
  const date = new Date(day.date);
  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div
      className="w-3 h-3 border border-gray-700 cursor-pointer transition-transform hover:scale-150 hover:border-green-400 relative group"
      style={{ backgroundColor: color }}
      title={`${formattedDate}: ${day.count} flash${day.count === 1 ? '' : 'es'}`}
    >
      {/* Tooltip */}
      <div className="hidden group-hover:block absolute z-10 bg-black border border-green-400 px-2 py-1 text-xs whitespace-nowrap left-1/2 -translate-x-1/2 bottom-full mb-2">
        <div>{formattedDate}</div>
        <div className="text-green-400">{day.count} flash{day.count === 1 ? '' : 'es'}</div>
      </div>
    </div>
  );
}

function ListView({ data }: { data: DailyProgress[] }) {
  return (
    <div className="border-2 border-green-400 bg-gray-900 mb-4">
      <div className="bg-green-400 text-black px-4 py-2 text-center font-bold text-sm">
        {">>> DAILY LOG <<<"}
      </div>

      <div className="max-h-[60vh] overflow-y-auto">
        {data.map((day) => (
          <ListItem key={day.date} day={day} />
        ))}
      </div>
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
      className={`flex justify-between items-center px-4 py-3 border-b border-gray-700 hover:bg-gray-800 transition-colors ${
        day.count === 0 ? 'opacity-50' : ''
      }`}
    >
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="font-bold">{dayName}</span>
          {isToday && (
            <span className="px-2 py-0.5 bg-green-400 text-black text-xs">TODAY</span>
          )}
        </div>
        <span className="text-xs text-gray-500">{formattedDate}</span>
      </div>

      <div className="flex items-center gap-3">
        {day.count === 0 ? (
          <span className="text-gray-600 text-sm italic">No flashes</span>
        ) : (
          <>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(day.count, 10) }, (_, i) => (
                <span key={i} className="text-green-400">●</span>
              ))}
              {day.count > 10 && (
                <span className="text-xs text-gray-500">+{day.count - 10}</span>
              )}
            </div>
            <span className="text-sm font-bold min-w-[60px] text-right">
              {day.count} {day.count === 1 ? 'flash' : 'flashes'}
            </span>
          </>
        )}
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
function organizeIntoWeeks(progress: DailyProgress[]): DailyProgress[][] {
  const weeks: DailyProgress[][] = [];
  let currentWeek: DailyProgress[] = [];

  progress.forEach((day, index) => {
    currentWeek.push(day);
    if ((index + 1) % 7 === 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  return weeks;
}

function getIntensityLevel(count: number): number {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 4) return 2;
  if (count <= 6) return 3;
  return 4;
}

function getColorForLevel(level: number): string {
  const colors = [
    '#1a1a1a', // 0 flashes - dark gray
    '#0d4d0d', // 1-2 - dark green
    '#166d16', // 3-4 - medium green
    '#22c55e', // 5-6 - bright green
    '#4ade80', // 7+ - very bright green
  ];
  return colors[level];
}

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
      <div className="border-2 border-red-500 p-8 text-center bg-gray-900">
        <pre className="text-red-500 text-xs mb-4">
{`
╔═══════════════════════════╗
║                           ║
║   ERROR LOADING DATA      ║
║                           ║
╚═══════════════════════════╝
`}
        </pre>
        <p className="text-sm text-red-400">{error.message}</p>
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
