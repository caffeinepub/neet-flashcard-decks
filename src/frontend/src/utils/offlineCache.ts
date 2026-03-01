/**
 * Offline deck cache using localStorage.
 *
 * When online: decks fetched from the backend are automatically saved here.
 * When offline: these cached decks are returned instead, so studying continues.
 */

import type { Deck } from "../backend.d";

const CACHE_KEY = "neet_offline_decks_v1";

/** Save the full deck list returned by the backend. */
export function cacheDecks(decks: Deck[]): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(decks));
  } catch {
    // localStorage may be full or unavailable — fail silently
  }
}

/** Load the cached deck list. Returns [] if nothing is cached. */
export function loadCachedDecks(): Deck[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Deck[];
  } catch {
    return [];
  }
}

/** Returns true when the browser has no usable internet connection. */
export function isOffline(): boolean {
  return !navigator.onLine;
}
