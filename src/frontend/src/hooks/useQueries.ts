import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Card, Deck } from "../backend.d";
import type { ParsedDeck } from "../utils/deckImport";
import { parsedCardToBackendCard } from "../utils/deckImport";
import { cacheDecks, isOffline, loadCachedDecks } from "../utils/offlineCache";
import { useActor } from "./useActor";

// ── List Decks ───────────────────────────────────────────────

export function useListDecks() {
  const { actor, isFetching } = useActor();

  return useQuery<Deck[]>({
    queryKey: ["decks"],
    queryFn: async () => {
      // Offline: serve from local cache
      if (isOffline()) {
        return loadCachedDecks();
      }
      if (!actor) return [];
      const decks = await actor.listDecks();
      // Persist to local cache for future offline use
      cacheDecks(decks);
      return decks;
    },
    // Also try the cache as a placeholder while online fetch is in progress
    placeholderData: loadCachedDecks,
    enabled: isOffline() || (!!actor && !isFetching),
    staleTime: 30_000,
  });
}

// ── Save Deck ────────────────────────────────────────────────
// Uses chunked upload to avoid IC message size limits for large decks.
// Cards are sent in batches of 30 after initialising the deck metadata.

const CARD_CHUNK_SIZE = 30;

export function useSaveDeck() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (deck: ParsedDeck) => {
      if (!actor) throw new Error("Not connected");
      const cards: Card[] = deck.cards.map(parsedCardToBackendCard);

      if (cards.length <= CARD_CHUNK_SIZE) {
        // Small deck: single call
        await actor.saveDeck(deck.id, deck.name, deck.description, cards);
      } else {
        // Large deck: init then send cards in chunks
        await actor.initDeck(deck.id, deck.name, deck.description);
        for (let i = 0; i < cards.length; i += CARD_CHUNK_SIZE) {
          const chunk = cards.slice(i, i + CARD_CHUNK_SIZE);
          await actor.appendCards(deck.id, chunk);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decks"] });
    },
  });
}

// ── Delete Deck ──────────────────────────────────────────────

export function useDeleteDeck() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Not connected");
      await actor.deleteDeck(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decks"] });
    },
  });
}

// ── Rename Deck ──────────────────────────────────────────────

export function useRenameDeck() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, newName }: { id: string; newName: string }) => {
      if (!actor) throw new Error("Not connected");
      await actor.renameDeck(id, newName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decks"] });
    },
  });
}
