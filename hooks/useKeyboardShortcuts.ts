import { useEffect } from 'react';

interface KeyboardShortcuts {
  splitText?: () => void;
  newSession?: () => void;
}

/**
 * useKeyboardShortcuts Hook
 * Registers keyboard shortcuts for the application
 */
export const useKeyboardShortcuts = (shortcuts: KeyboardShortcuts) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Cmd/Ctrl + Enter to split text
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        shortcuts.splitText?.();
      }
      
      // Cmd/Ctrl + N for new session
      if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
        event.preventDefault();
        shortcuts.newSession?.();
      }

      // Cmd/Ctrl + / to show shortcuts help
      if ((event.ctrlKey || event.metaKey) && event.key === '/') {
        event.preventDefault();
        // This can trigger a help dialog in the future
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};
