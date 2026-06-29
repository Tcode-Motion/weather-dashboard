/* ── useKeyboardShortcut — Global keyboard shortcuts ─── */

import { useEffect, useCallback } from 'react';

type KeyCombo = {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
};

export function useKeyboardShortcut(combo: KeyCombo, callback: () => void): void {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const isModMatch =
        (combo.ctrl ? e.ctrlKey : true) &&
        (combo.meta ? e.metaKey : true) &&
        (combo.shift ? e.shiftKey : true) &&
        (combo.alt ? e.altKey : true);

      if (isModMatch && e.key.toLowerCase() === combo.key.toLowerCase()) {
        // Don't trigger in inputs unless it's a global shortcut (Ctrl/Cmd)
        const target = e.target as HTMLElement;
        const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
        if (isInput && !combo.ctrl && !combo.meta) return;

        e.preventDefault();
        callback();
      }
    },
    [combo, callback]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
