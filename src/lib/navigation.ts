// Global navigation helper for tab changes
// This allows components like ProfileDropdown to trigger tab navigation

type NavTab = 'feed' | 'global' | 'leaderboard' | 'achievements' | 'map' | 'favorites' | 'wishlist';

let globalTabHandler: ((tab: NavTab) => void) | null = null;

export function registerTabHandler(handler: (tab: NavTab) => void) {
  globalTabHandler = handler;
}

export function navigateToTab(tab: NavTab) {
  if (globalTabHandler) {
    globalTabHandler(tab);
  } else {
    console.warn('No tab handler registered');
  }
}

export function unregisterTabHandler() {
  globalTabHandler = null;
}