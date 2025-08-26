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

// Badge tiers for flash counts
export const FLASH_COUNT_BADGES: Badge[] = [
  {
    id: 'newbie',
    name: 'Space Cadet',
    description: 'First flash!',
    icon: '^',
    threshold: 1,
    tier: 'bronze',
    gradient: 'from-amber-600 to-amber-400'
  },
  {
    id: 'explorer',
    name: 'Explorer',
    description: '10 flashes shared',
    icon: '?',
    threshold: 10,
    tier: 'bronze',
    gradient: 'from-amber-600 to-amber-400'
  },
  {
    id: 'flasher',
    name: 'Flasher',
    description: '100 flashes shared',
    icon: '!',
    threshold: 100,
    tier: 'silver',
    gradient: 'from-gray-500 to-gray-300'
  },
  {
    id: 'invader',
    name: 'Invader',
    description: '500 flashes shared',
    icon: '*',
    threshold: 500,
    tier: 'gold',
    gradient: 'from-yellow-500 to-yellow-300'
  },
  {
    id: 'commander',
    name: 'Commander',
    description: '1,000 flashes shared',
    icon: '+',
    threshold: 1000,
    tier: 'gold',
    gradient: 'from-yellow-500 to-yellow-300'
  },
  {
    id: 'legend',
    name: 'Legend',
    description: '2,000 flashes shared',
    icon: '#',
    threshold: 2000,
    tier: 'platinum',
    gradient: 'from-purple-500 to-purple-300'
  },
  {
    id: 'master',
    name: 'Flash Master',
    description: '4,000 flashes shared',
    icon: '@',
    threshold: 4000,
    tier: 'diamond',
    gradient: 'from-blue-500 to-cyan-300'
  }
];

// City-based achievements
export const CITY_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'city_explorer',
    name: 'City Explorer',
    description: '20 flashes in the same city',
    icon: '&',
    type: 'city_explorer',
    requirement: 20,
    gradient: 'from-green-500 to-emerald-300'
  },
  {
    id: 'globe_trotter',
    name: 'Globe Trotter',
    description: 'Flash in 10 different cities',
    icon: '%',
    type: 'city_explorer',
    requirement: 10,
    gradient: 'from-blue-500 to-cyan-300'
  },
  {
    id: 'world_invader',
    name: 'World Invader',
    description: 'Flash in 25 different cities',
    icon: '$',
    type: 'city_explorer',
    requirement: 25,
    gradient: 'from-purple-500 to-pink-300'
  }
];

export const ALL_BADGES = [...FLASH_COUNT_BADGES];
export const ALL_ACHIEVEMENTS = [...CITY_ACHIEVEMENTS];

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

export function getCityAchievements(citiesVisited: string[], flashesPerCity: Record<string, number>): Achievement[] {
  const earned: Achievement[] = [];
  
  // City Explorer: 20 flashes in same city
  if (Object.values(flashesPerCity).some(count => count >= 20)) {
    const cityExplorer = CITY_ACHIEVEMENTS.find(a => a.id === 'city_explorer');
    if (cityExplorer) earned.push(cityExplorer);
  }
  
  // Globe Trotter: 10 different cities
  if (citiesVisited.length >= 10) {
    const globeTrotter = CITY_ACHIEVEMENTS.find(a => a.id === 'globe_trotter');
    if (globeTrotter) earned.push(globeTrotter);
  }
  
  // World Invader: 25 different cities
  if (citiesVisited.length >= 25) {
    const worldInvader = CITY_ACHIEVEMENTS.find(a => a.id === 'world_invader');
    if (worldInvader) earned.push(worldInvader);
  }
  
  return earned;
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