import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export interface KeyboardShortcuts {
  onHome?: () => void;
  onProfile?: () => void;
  onGlobal?: () => void;
  onLeaderboard?: () => void;
  onSearch?: () => void;
  onShare?: () => void;
  onFavorite?: () => void;
  onBack?: () => void;
  onRefresh?: () => void;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcuts = {}) {
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Only trigger shortcuts when not in input fields
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      // Modifier key combinations
      if (event.ctrlKey || event.metaKey) {
        switch (event.key.toLowerCase()) {
          case 'h':
            event.preventDefault();
            if (shortcuts.onHome) {
              shortcuts.onHome();
            } else {
              router.push('/');
            }
            break;
          case 'p':
            event.preventDefault();
            if (shortcuts.onProfile) {
              shortcuts.onProfile();
            } else {
              router.push('/profile');
            }
            break;
          case 'g':
            event.preventDefault();
            if (shortcuts.onGlobal) {
              shortcuts.onGlobal();
            } else {
              router.push('/');
            }
            break;
          case 'l':
            event.preventDefault();
            if (shortcuts.onLeaderboard) {
              shortcuts.onLeaderboard();
            }
            break;
          case 'k':
            event.preventDefault();
            if (shortcuts.onSearch) {
              shortcuts.onSearch();
            }
            break;
          case 's':
            event.preventDefault();
            if (shortcuts.onShare) {
              shortcuts.onShare();
            }
            break;
          case 'f':
            event.preventDefault();
            if (shortcuts.onFavorite) {
              shortcuts.onFavorite();
            }
            break;
          case 'r':
            event.preventDefault();
            if (shortcuts.onRefresh) {
              shortcuts.onRefresh();
            } else {
              window.location.reload();
            }
            break;
        }
        return;
      }

      // Single key shortcuts
      switch (event.key) {
        case 'Escape':
          if (shortcuts.onBack) {
            shortcuts.onBack();
          } else {
            router.back();
          }
          break;
        case '?':
          event.preventDefault();
          showKeyboardShortcutsHelp();
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router, shortcuts]);
}

function showKeyboardShortcutsHelp() {
  const helpText = `
🎯 FLASHCASTR KEYBOARD SHORTCUTS

NAVIGATION:
Ctrl/Cmd + H    →  Home
Ctrl/Cmd + P    →  Profile  
Ctrl/Cmd + G    →  Global Feed
Ctrl/Cmd + L    →  Leaderboard

ACTIONS:
Ctrl/Cmd + K    →  Search
Ctrl/Cmd + S    →  Share
Ctrl/Cmd + F    →  Add to Favorites
Ctrl/Cmd + R    →  Refresh

OTHER:
Escape          →  Go Back
?               →  Show this help

Press any key to close...
`;

  // Create modal overlay
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 font-mono';
  modal.innerHTML = `
    <div class="bg-gray-900 border-2 border-green-400 p-6 max-w-md mx-4">
      <pre class="text-green-400 text-xs whitespace-pre-wrap">${helpText}</pre>
    </div>
  `;

  document.body.appendChild(modal);

  // Close on any key press or click
  function closeModal() {
    document.body.removeChild(modal);
    document.removeEventListener('keydown', closeModal);
    modal.removeEventListener('click', closeModal);
  }

  document.addEventListener('keydown', closeModal);
  modal.addEventListener('click', closeModal);
}