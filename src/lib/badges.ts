export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  threshold: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  gradient: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'flash_count' | 'city_explorer' | 'streak' | 'special';
  requirement: number;
  gradient: string;
}

export interface UserProgress {
  fid: number;
  username: string;
  totalFlashes: number;
  citiesVisited: string[];
  badges: string[];
  achievements: string[];
  lastFlashDate?: Date;
  streak?: number;
}

// Flash count badges with achievable thresholds
export const FLASH_COUNT_BADGES: Badge[] = [
  {
    id: 'newbie',
    name: 'Cadet',
    description: 'First flash!',
    icon: '.',
    threshold: 1,
    tier: 'bronze',
    gradient: 'from-green-600 to-green-400'
  },
  {
    id: 'rookie',
    name: 'Rookie',
    description: '5 flashes shared',
    icon: '-',
    threshold: 5,
    tier: 'bronze',
    gradient: 'from-green-600 to-green-400'
  },
  {
    id: 'explorer',
    name: 'Explorer',
    description: '10 flashes shared',
    icon: '=',
    threshold: 10,
    tier: 'bronze',
    gradient: 'from-green-600 to-green-400'
  },
  {
    id: 'scout',
    name: 'Scout',
    description: '20 flashes shared',
    icon: '+',
    threshold: 20,
    tier: 'silver',
    gradient: 'from-green-500 to-green-300'
  },
  {
    id: 'invader',
    name: 'Invader',
    description: '50 flashes shared',
    icon: '*',
    threshold: 50,
    tier: 'gold',
    gradient: 'from-green-400 to-green-200'
  },
  {
    id: 'commander',
    name: 'Commander',
    description: '100 flashes shared',
    icon: '#',
    threshold: 100,
    tier: 'platinum',
    gradient: 'from-green-300 to-green-100'
  },
  {
    id: 'captain',
    name: 'Captain',
    description: '200 flashes shared',
    icon: '@',
    threshold: 200,
    tier: 'diamond',
    gradient: 'from-green-200 to-white'
  },
  {
    id: 'legend',
    name: 'Legend',
    description: '500 flashes shared',
    icon: '%',
    threshold: 500,
    tier: 'diamond',
    gradient: 'from-green-100 to-white'
  },
  {
    id: 'master',
    name: 'Master',
    description: '1000+ flashes shared',
    icon: '&',
    threshold: 1000,
    tier: 'diamond',
    gradient: 'from-white to-green-100'
  }
];

// City count badges with achievable thresholds
export const CITY_COUNT_BADGES: Badge[] = [
  {
    id: 'local',
    name: 'Local',
    description: 'First city!',
    icon: '|',
    threshold: 1,
    tier: 'bronze',
    gradient: 'from-green-600 to-green-400'
  },
  {
    id: 'traveler',
    name: 'Traveler',
    description: '5 different cities',
    icon: '/',
    threshold: 5,
    tier: 'bronze',
    gradient: 'from-green-600 to-green-400'
  },
  {
    id: 'wanderer',
    name: 'Wanderer',
    description: '10 different cities',
    icon: '\\',
    threshold: 10,
    tier: 'silver',
    gradient: 'from-green-500 to-green-300'
  },
  {
    id: 'nomad',
    name: 'Nomad',
    description: '20 different cities',
    icon: '^',
    threshold: 20,
    tier: 'gold',
    gradient: 'from-green-400 to-green-200'
  },
  {
    id: 'explorer',
    name: 'Explorer',
    description: '50 different cities',
    icon: '<',
    threshold: 50,
    tier: 'platinum',
    gradient: 'from-green-300 to-green-100'
  },
  {
    id: 'globe_trotter',
    name: 'Globe Trotter',
    description: '100 different cities',
    icon: '>',
    threshold: 100,
    tier: 'diamond',
    gradient: 'from-green-200 to-white'
  },
  {
    id: 'world_invader',
    name: 'World Invader',
    description: '200+ different cities',
    icon: '~',
    threshold: 200,
    tier: 'diamond',
    gradient: 'from-green-100 to-white'
  }
];

export const ALL_BADGES = [...FLASH_COUNT_BADGES, ...CITY_COUNT_BADGES];

// Utility functions for city badges
export function getCityBadgeForCount(count: number): Badge | null {
  const eligibleBadges = CITY_COUNT_BADGES
    .filter(badge => count >= badge.threshold)
    .sort((a, b) => b.threshold - a.threshold);
  
  return eligibleBadges[0] || null;
}

export function getNextCityBadge(count: number): Badge | null {
  const nextBadges = CITY_COUNT_BADGES
    .filter(badge => count < badge.threshold)
    .sort((a, b) => a.threshold - b.threshold);
  
  return nextBadges[0] || null;
}

// Utility functions
export function getBadgeForFlashCount(count: number): Badge | null {
  const eligibleBadges = FLASH_COUNT_BADGES
    .filter(badge => count >= badge.threshold)
    .sort((a, b) => b.threshold - a.threshold);
  
  return eligibleBadges[0] || null;
}

export function getNextBadge(count: number): Badge | null {
  const nextBadges = FLASH_COUNT_BADGES
    .filter(badge => count < badge.threshold)
    .sort((a, b) => a.threshold - b.threshold);
  
  return nextBadges[0] || null;
}


export function calculateProgress(count: number, target: number): number {
  return Math.min((count / target) * 100, 100);
}

export function formatFlashCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
}