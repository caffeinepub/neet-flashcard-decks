import {
  AlertTriangle,
  ArrowLeftRight,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Eye,
  Lightbulb,
  Loader2,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Deck } from "../backend.d";
import type { BuiltinDeck } from "../decks/reproductiveHealth";
import { useSaveDeck } from "../hooks/useQueries";
import type { ParsedCard, ParsedDeck } from "../utils/deckImport";

// ── Types ────────────────────────────────────────────────────

type ViewerDeck = Deck | BuiltinDeck;

interface FlashcardViewerProps {
  deck: ViewerDeck;
  onBack: () => void;
  isBuiltin?: boolean;
  onDeckChange?: (updatedCards: ParsedCard[]) => void;
}

// ── Helper ───────────────────────────────────────────────────

function deckToParsed(deck: ViewerDeck, cards: ParsedCard[]): ParsedDeck {
  return {
    id: deck.id,
    name: deck.name,
    description:
      ((deck as unknown as Record<string, unknown>).description as string) ??
      "",
    cards,
  };
}

function rawCardsToParsed(deck: ViewerDeck): ParsedCard[] {
  return deck.cards.map((card, idx) => {
    const c = card as unknown as Record<string, unknown>;
    return {
      id:
        typeof c.id === "bigint"
          ? Number(c.id)
          : typeof c.id === "number"
            ? c.id
            : idx + 1,
      cardType: (c.cardType as string) ?? "General",
      title: (c.title as string) ?? "",
      front: (c.front as string) ?? "",
      back: (c.back as string) ?? "",
      trap: typeof c.trap === "string" && c.trap.trim() ? c.trap : undefined,
      hook: typeof c.hook === "string" && c.hook.trim() ? c.hook : undefined,
    };
  });
}

// ── Add Card Modal ────────────────────────────────────────────

interface AddCardModalProps {
  onClose: () => void;
  onAdd: (front: string, back: string) => Promise<void>;
}

function AddCardModal({ onClose, onAdd }: AddCardModalProps) {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const trimmedFront = front.trim();
    const trimmedBack = back.trim();
    if (!trimmedFront) {
      setError("Front / Question is required.");
      return;
    }
    if (!trimmedBack) {
      setError("Back / Answer is required.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await onAdd(trimmedFront, trimmedBack);
      onClose();
    } catch {
      setError("Failed to save card. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm cursor-default"
        onClick={onClose}
        aria-label="Close dialog"
      />
      {/* Modal */}
      <div
        className="relative bg-card rounded-2xl p-6 w-full max-w-sm border border-border flex flex-col gap-4 animate-scale-in"
        style={{ boxShadow: "0 20px 60px 0 oklch(0 0 0 / 0.15)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-xl shrink-0"
              style={{ background: "oklch(var(--primary) / 0.1)" }}
            >
              <Plus size={18} style={{ color: "oklch(var(--primary))" }} />
            </div>
            <h3 className="font-bold text-foreground text-base">Add Card</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Front */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="add-card-front"
            className="text-xs font-semibold text-muted-foreground uppercase tracking-widest"
          >
            Front / Question
          </label>
          <textarea
            id="add-card-front"
            data-ocid="add_card_modal.front.textarea"
            value={front}
            onChange={(e) => {
              setFront(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Enter the question or prompt…"
            rows={3}
            className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground placeholder:text-muted-foreground/60 transition-all"
          />
        </div>

        {/* Back */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="add-card-back"
            className="text-xs font-semibold text-muted-foreground uppercase tracking-widest"
          >
            Back / Answer
          </label>
          <textarea
            id="add-card-back"
            data-ocid="add_card_modal.back.textarea"
            value={back}
            onChange={(e) => {
              setBack(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Enter the answer…"
            rows={3}
            className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground placeholder:text-muted-foreground/60 transition-all"
          />
        </div>

        {/* Error */}
        {error && (
          <p
            className="text-sm font-medium"
            style={{ color: "oklch(var(--destructive))" }}
          >
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            data-ocid="add_card_modal.cancel_button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-secondary text-secondary-foreground font-semibold text-sm hover:bg-accent transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            data-ocid="add_card_modal.submit_button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ boxShadow: "0 2px 10px 0 oklch(var(--primary) / 0.25)" }}
          >
            {isSubmitting ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Plus size={15} />
            )}
            {isSubmitting ? "Adding…" : "Add Card"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delete Card Confirm Dialog ────────────────────────────────

interface DeleteCardDialogProps {
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

function DeleteCardDialog({
  onConfirm,
  onCancel,
  isLoading,
}: DeleteCardDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm cursor-default"
        onClick={onCancel}
        aria-label="Close dialog"
      />
      {/* Modal */}
      <div
        className="relative bg-card rounded-2xl p-6 w-full max-w-sm border border-border animate-scale-in"
        style={{ boxShadow: "0 20px 60px 0 oklch(0 0 0 / 0.15)" }}
      >
        <div className="flex items-start gap-4 mb-5">
          <div className="p-2.5 rounded-xl bg-destructive/10 shrink-0">
            <Trash2 size={18} className="text-destructive" />
          </div>
          <div>
            <h3 className="font-bold text-foreground text-base">
              Delete this card?
            </h3>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              This card will be permanently removed from the deck.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            data-ocid="viewer.delete_card.cancel_button"
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl bg-secondary text-secondary-foreground font-semibold text-sm hover:bg-accent transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            data-ocid="viewer.delete_card.confirm_button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isLoading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Trash2 size={15} />
            )}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Component ────────────────────────────────────────────────

export function FlashcardViewer({
  deck,
  onBack,
  isBuiltin: isBuiltinProp,
  onDeckChange,
}: FlashcardViewerProps) {
  const saveDeck = useSaveDeck();

  // Resolve builtin status: from prop or from deck object
  const isBuiltin =
    isBuiltinProp !== undefined
      ? isBuiltinProp
      : !!(deck as unknown as Record<string, unknown>).isBuiltin;

  // Local mutable cards state (starts from deck.cards, can be updated live)
  const [localCards, setLocalCards] = useState<ParsedCard[]>(() =>
    rawCardsToParsed(deck),
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [showScore, setShowScore] = useState(false);

  // Category filter
  const [activeCategory, setActiveCategory] = useState("All Cards");

  // Bookmark state — persisted to localStorage
  const bookmarkKey = `bookmarks-${deck.id}`;
  const [bookmarkedCards, setBookmarkedCards] = useState<Set<number>>(() => {
    try {
      const stored = localStorage.getItem(bookmarkKey);
      if (stored) {
        const arr = JSON.parse(stored) as number[];
        return new Set(arr);
      }
    } catch {
      // ignore
    }
    return new Set<number>();
  });

  // Show bookmarked only filter
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);

  // Persist bookmarks whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(bookmarkKey, JSON.stringify([...bookmarkedCards]));
    } catch {
      // ignore
    }
  }, [bookmarkedCards, bookmarkKey]);

  // Search state
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeletingCard, setIsDeletingCard] = useState(false);

  const cards = localCards;

  // ── Category tabs ──────────────────────────────────────────
  const categories = useMemo(() => {
    const types = [
      ...new Set(cards.map((c) => (c.cardType ?? "General").trim())),
    ].filter(Boolean);
    // If only one unique type or all are "General", show only "All Cards"
    const nonGeneral = types.filter((t) => t !== "General");
    if (nonGeneral.length <= 1) return ["All Cards"];
    return ["All Cards", ...types];
  }, [cards]);

  // ── Filtered navigation set ────────────────────────────────
  // Returns indices into localCards that are valid for current filter
  const filteredIndices = useMemo(() => {
    let indices = cards.map((_, idx) => idx);

    // Apply category filter
    if (activeCategory !== "All Cards") {
      indices = indices.filter(
        (idx) => (cards[idx].cardType ?? "General") === activeCategory,
      );
    }

    // Apply bookmark filter
    if (showBookmarkedOnly) {
      indices = indices.filter((idx) => bookmarkedCards.has(idx));
    }

    return indices;
  }, [cards, activeCategory, showBookmarkedOnly, bookmarkedCards]);

  // Position of currentIndex within filteredIndices
  const filteredPos = filteredIndices.indexOf(currentIndex);
  // If current card not in filter, find the nearest
  const effectiveFilterPos = filteredPos >= 0 ? filteredPos : 0;
  const effectiveIndex =
    filteredIndices.length > 0
      ? (filteredIndices[effectiveFilterPos] ?? filteredIndices[0])
      : currentIndex;

  // Use effectiveIndex as the safe index
  const safeIndex =
    filteredIndices.length > 0
      ? effectiveIndex
      : Math.min(currentIndex, Math.max(0, cards.length - 1));

  const currentCard = cards[safeIndex];
  const trap = currentCard?.trap;
  const hook = currentCard?.hook;
  const hasTips = !!(trap || hook);

  // ── Search filtered cards ──────────────────────────────────
  const searchFilteredCards = searchQuery.trim()
    ? cards
        .map((card, idx) => ({ card, idx }))
        .filter(({ card }) => {
          const q = searchQuery.toLowerCase();
          return (
            (card.front ?? "").toLowerCase().includes(q) ||
            (card.back ?? "").toLowerCase().includes(q) ||
            (card.trap ?? "").toLowerCase().includes(q) ||
            (card.hook ?? "").toLowerCase().includes(q)
          );
        })
    : [];

  const openSearch = () => {
    setSearchOpen(true);
    setTimeout(() => searchInputRef.current?.focus(), 50);
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery("");
  };

  const jumpToCard = (idx: number) => {
    setCurrentIndex(idx);
    setIsFlipped(false);
    setShowTips(false);
    closeSearch();
  };

  // ── Navigation ─────────────────────────────────────────────
  const handleNext = () => {
    setIsFlipped(false);
    setShowTips(false);

    if (filteredIndices.length === 0) return;

    const pos = filteredIndices.indexOf(safeIndex);
    const nextPos = pos >= 0 ? pos + 1 : 1;

    if (nextPos < filteredIndices.length) {
      setCurrentIndex(filteredIndices[nextPos]);
    } else {
      setShowScore(true);
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setShowTips(false);

    if (filteredIndices.length === 0) return;

    const pos = filteredIndices.indexOf(safeIndex);
    const prevPos = pos > 0 ? pos - 1 : 0;
    setCurrentIndex(filteredIndices[prevPos]);
  };

  const handleReset = () => {
    setCurrentIndex(filteredIndices[0] ?? 0);
    setIsFlipped(false);
    setShowTips(false);
    setShowScore(false);
  };

  const handleFlip = () => {
    if (isFlipped) {
      setShowTips(false);
    }
    setIsFlipped(!isFlipped);
  };

  // ── Shuffle ────────────────────────────────────────────────
  const handleShuffle = () => {
    const shuffled = [...localCards].sort(() => Math.random() - 0.5);
    setLocalCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowTips(false);
    setShowScore(false);
  };

  // ── Toggle bookmark ────────────────────────────────────────
  const toggleBookmark = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarkedCards((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  // ── Add Card handler ──
  const handleAddCard = async (front: string, back: string) => {
    const newCard: ParsedCard = {
      id: cards.length + 1,
      cardType: "General",
      title: "",
      front,
      back,
    };
    const updatedCards = [...cards, newCard];
    const parsedDeck = deckToParsed(deck, updatedCards);
    await saveDeck.mutateAsync(parsedDeck);
    setLocalCards(updatedCards);
    onDeckChange?.(updatedCards);
  };

  // ── Delete Card handler ──
  const handleDeleteCard = async () => {
    setIsDeletingCard(true);
    try {
      const updatedCards = cards.filter((_, idx) => idx !== safeIndex);
      const parsedDeck = deckToParsed(deck, updatedCards);
      await saveDeck.mutateAsync(parsedDeck);
      setLocalCards(updatedCards);
      onDeckChange?.(updatedCards);
      if (updatedCards.length === 0) {
        setCurrentIndex(0);
      } else if (safeIndex >= updatedCards.length) {
        setCurrentIndex(updatedCards.length - 1);
      }
      setIsFlipped(false);
      setShowTips(false);
    } finally {
      setIsDeletingCard(false);
      setShowDeleteDialog(false);
    }
  };

  const cardType = currentCard ? (currentCard.cardType ?? "General") : "";
  const title = currentCard ? (currentCard.title ?? "") : "";
  const front = currentCard ? (currentCard.front ?? "") : "";
  const back = currentCard ? (currentCard.back ?? "") : "";

  // Position in current filter set
  const filterPos = filteredIndices.indexOf(safeIndex);
  const displayPos = filterPos >= 0 ? filterPos + 1 : 1;
  const displayTotal = filteredIndices.length;

  // Progress
  const progress = displayTotal > 0 ? (displayPos / displayTotal) * 100 : 0;

  // Zero-padded card number (position in full deck)
  const cardNumFull = String(safeIndex + 1).padStart(3, "0");

  // Is card bookmarked
  const isBookmarked = bookmarkedCards.has(safeIndex);

  // Prev/Next disabled states
  const isPrevDisabled =
    filteredIndices.length === 0 || filteredIndices.indexOf(safeIndex) <= 0;
  const isLastCard =
    filteredIndices.length === 0 ||
    filteredIndices.indexOf(safeIndex) >= filteredIndices.length - 1;

  // Category change
  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setIsFlipped(false);
    setShowTips(false);
    setShowScore(false);
    // Jump to first card in this category
    const newFilteredIndices = (() => {
      let idxs = cards.map((_, i) => i);
      if (cat !== "All Cards") {
        idxs = idxs.filter((i) => (cards[i].cardType ?? "General") === cat);
      }
      if (showBookmarkedOnly) {
        idxs = idxs.filter((i) => bookmarkedCards.has(i));
      }
      return idxs;
    })();
    setCurrentIndex(newFilteredIndices[0] ?? 0);
  };

  // Toggle bookmarked filter
  const handleToggleBookmarkedFilter = () => {
    const newVal = !showBookmarkedOnly;
    setShowBookmarkedOnly(newVal);
    setIsFlipped(false);
    setShowTips(false);
    setShowScore(false);

    if (newVal) {
      // Find first bookmarked card in current category filter
      const bookmarkIndices = cards
        .map((_, i) => i)
        .filter((i) => {
          const matchesCat =
            activeCategory === "All Cards" ||
            (cards[i].cardType ?? "General") === activeCategory;
          return matchesCat && bookmarkedCards.has(i);
        });
      if (bookmarkIndices.length > 0) {
        setCurrentIndex(bookmarkIndices[0]);
      }
    } else {
      // Stay on current card position but just remove bookmark filter
    }
  };

  // Empty deck state (after all cards deleted)
  if (cards.length === 0) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col">
        {/* Top bar */}
        <div className="bg-slate-900 flex items-center px-2 py-3 shrink-0">
          <button
            type="button"
            onClick={onBack}
            className="p-3 text-white rounded-xl active:bg-white/10 transition-colors"
            aria-label="Back to deck list"
            data-ocid="viewer.back.button"
          >
            <ChevronLeft size={26} />
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl border border-border p-10 text-center w-full max-w-sm shadow-card">
            <h1 className="text-xl font-bold text-foreground mb-2">
              {deck.name}
            </h1>
            <p className="text-muted-foreground text-sm mb-6">
              This deck has no cards yet.
            </p>
            {!isBuiltin && (
              <button
                type="button"
                data-ocid="viewer.add_card.open_modal_button"
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-all"
                style={{
                  boxShadow: "0 4px 20px 0 oklch(var(--primary) / 0.3)",
                }}
              >
                <Plus size={18} />
                Add First Card
              </button>
            )}
          </div>
        </div>

        {showAddModal && (
          <AddCardModal
            onClose={() => setShowAddModal(false)}
            onAdd={handleAddCard}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* ── Dark Top Bar ─────────────────────────────────────── */}
      <div className="bg-slate-900 flex items-center justify-between px-2 py-2.5 shrink-0 z-10">
        <button
          type="button"
          onClick={onBack}
          className="p-3 text-white rounded-xl active:bg-white/10 transition-colors"
          aria-label="Back to deck list"
          data-ocid="viewer.back.button"
        >
          <ChevronLeft size={26} />
        </button>

        {/* Right side: search + add card (non-builtin) */}
        <div className="flex items-center gap-1">
          {!isBuiltin && (
            <button
              type="button"
              data-ocid="viewer.add_card.open_modal_button"
              onClick={() => setShowAddModal(true)}
              aria-label="Add card"
              className="p-3 text-white/70 hover:text-white rounded-xl active:bg-white/10 transition-colors"
            >
              <Plus size={22} />
            </button>
          )}
          <button
            type="button"
            data-ocid="search.toggle_button"
            onClick={searchOpen ? closeSearch : openSearch}
            aria-label={searchOpen ? "Close search" : "Search cards"}
            className={`p-3 rounded-xl transition-colors ${
              searchOpen
                ? "text-white bg-white/20"
                : "text-white/70 hover:text-white active:bg-white/10"
            }`}
          >
            <Search size={22} />
          </button>
        </div>
      </div>

      {/* ── Deck Info Bar ─────────────────────────────────────── */}
      <div className="bg-white border-b border-border px-4 pt-3 pb-2.5 shrink-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-primary leading-tight truncate">
              {deck.name}
            </h1>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
              {(deck as unknown as Record<string, unknown>).description
                ? String(
                    (deck as unknown as Record<string, unknown>).description,
                  )
                : `${cards.length} CARDS`}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <span className="text-sm font-bold text-muted-foreground tabular-nums">
              {displayPos} <span className="text-border mx-0.5">/</span>{" "}
              {displayTotal}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-2 w-full h-1 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* ── Search Panel ──────────────────────────────────────── */}
      {searchOpen && (
        <div className="bg-white border-b border-border shadow-sm">
          <div className="flex items-center gap-2 px-4 py-3">
            <Search size={15} className="text-muted-foreground shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              data-ocid="search.search_input"
              placeholder="Search cards…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                data-ocid="search.close_button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {searchQuery.trim() && (
            <div>
              <div className="px-4 py-1.5 border-t border-border bg-secondary/40">
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                  {searchFilteredCards.length > 0
                    ? `${searchFilteredCards.length} result${searchFilteredCards.length !== 1 ? "s" : ""}`
                    : `No results for "${searchQuery}"`}
                </p>
              </div>

              {searchFilteredCards.length === 0 ? (
                <div
                  data-ocid="search.empty_state"
                  className="px-4 py-4 text-center"
                >
                  <p className="text-sm text-muted-foreground font-medium">
                    No cards match your search.
                  </p>
                </div>
              ) : (
                <ul className="max-h-48 overflow-y-auto divide-y divide-border">
                  {searchFilteredCards.map(({ card, idx }, listIdx) => {
                    const frontText = card.front ?? "";
                    return (
                      <li key={idx}>
                        <button
                          type="button"
                          data-ocid={`search.item.${listIdx + 1}`}
                          onClick={() => jumpToCard(idx)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-secondary/60 transition-colors group"
                        >
                          <span className="text-[10px] font-black text-primary/70 tabular-nums shrink-0 w-8 text-right">
                            #{String(idx + 1).padStart(3, "0")}
                          </span>
                          <span className="text-sm text-foreground font-medium leading-snug truncate group-hover:text-primary transition-colors">
                            {frontText.length > 80
                              ? `${frontText.slice(0, 80)}…`
                              : frontText}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Category Filter Pills ─────────────────────────────── */}
      {categories.length > 1 && (
        <div className="bg-white border-b border-border px-4 py-2.5 overflow-x-auto no-scrollbar shrink-0">
          <div className="flex gap-2 w-max">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                data-ocid={"category.tab"}
                onClick={() => handleCategoryChange(cat)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-transparent text-muted-foreground border border-border hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Main Content ──────────────────────────────────────── */}
      <div className="flex-1 flex flex-col px-4 pt-4 pb-28">
        {!showScore ? (
          <>
            {/* Empty state for bookmarked filter */}
            {showBookmarkedOnly && filteredIndices.length === 0 ? (
              <div
                data-ocid="viewer.bookmarks.empty_state"
                className="flex-1 flex flex-col items-center justify-center text-center py-12"
              >
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                  <Bookmark size={28} className="text-muted-foreground" />
                </div>
                <h3 className="text-base font-bold text-foreground mb-1">
                  No Bookmarks Yet
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-[220px]">
                  Tap the bookmark icon on any card to save it here.
                </p>
                <button
                  type="button"
                  onClick={() => setShowBookmarkedOnly(false)}
                  className="mt-5 px-5 py-2.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-all"
                >
                  View All Cards
                </button>
              </div>
            ) : (
              <>
                {/* ── 3D Flip Card ─────────────────────────── */}
                <div
                  className="relative w-full mb-4"
                  style={{ perspective: "1200px" }}
                >
                  <div
                    className={`relative w-full transition-all duration-700 preserve-3d ${isFlipped ? "rotate-y-180" : ""}`}
                    style={{ minHeight: "420px" }}
                  >
                    {/* FRONT */}
                    <button
                      type="button"
                      onClick={handleFlip}
                      className="absolute inset-0 backface-hidden bg-white rounded-3xl border border-border/60 cursor-pointer select-none flex flex-col w-full shadow-flashcard"
                      aria-label="Flip card to see answer"
                      style={{ minHeight: "420px" }}
                    >
                      {/* Card top row: category badge + card number */}
                      <div className="flex items-center justify-between px-5 pt-5 pb-2">
                        <span className="inline-flex items-center px-2.5 py-1 border border-border/80 text-muted-foreground text-[9px] font-black uppercase tracking-[0.18em] rounded-full bg-secondary/50">
                          {cardType || "General"}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-muted-foreground/50 tabular-nums">
                            #{cardNumFull}
                          </span>
                          {/* Bookmark button */}
                          <button
                            type="button"
                            data-ocid="viewer.card.toggle"
                            onClick={(e) => toggleBookmark(safeIndex, e)}
                            aria-label={
                              isBookmarked ? "Remove bookmark" : "Bookmark card"
                            }
                            className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                          >
                            <Bookmark
                              size={17}
                              className={
                                isBookmarked
                                  ? "text-primary fill-primary"
                                  : "text-muted-foreground/50"
                              }
                            />
                          </button>
                        </div>
                      </div>

                      {/* Question text */}
                      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-2 text-center">
                        {title && (
                          <p className="text-[10px] font-bold text-primary/70 uppercase tracking-widest mb-3">
                            {title}
                          </p>
                        )}
                        <p className="text-[1.25rem] font-bold text-foreground leading-snug">
                          {front}
                        </p>
                      </div>

                      {/* Bottom hint */}
                      <div className="flex items-center justify-center gap-2 pb-5 text-muted-foreground/50">
                        <ArrowLeftRight size={13} />
                        <span className="text-[9px] font-black uppercase tracking-[0.25em]">
                          TAP TO REVEAL
                        </span>
                        <ArrowLeftRight size={13} />
                      </div>
                    </button>

                    {/* BACK */}
                    <div
                      className="absolute inset-0 backface-hidden rotate-y-180 bg-white rounded-3xl border border-primary/20 flex flex-col overflow-hidden shadow-flashcard"
                      style={{ minHeight: "420px" }}
                    >
                      <div className="flex-1 flex flex-col p-6 overflow-y-auto">
                        {/* Answer area — clickable to flip back */}
                        <button
                          type="button"
                          onClick={handleFlip}
                          className="text-center mb-auto pt-3 cursor-pointer w-full"
                        >
                          <span className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.18em] rounded-full mb-3">
                            Answer
                          </span>
                          <p className="text-[1.35rem] font-black text-primary leading-snug">
                            {back}
                          </p>
                          <p className="text-[9px] text-muted-foreground/50 mt-2 uppercase tracking-widest font-bold">
                            Tap to flip back
                          </p>
                        </button>

                        {/* Study Tips section */}
                        <div className="mt-5">
                          {hasTips && !showTips && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowTips(true);
                              }}
                              className="w-full py-3 bg-secondary hover:bg-accent border-2 border-dashed border-border hover:border-primary/30 rounded-2xl flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-all font-bold text-sm group"
                            >
                              <Eye
                                size={15}
                                className="group-hover:scale-110 transition-transform"
                              />
                              Reveal Study Tips
                            </button>
                          )}

                          {showTips && (
                            <div className="space-y-3 animate-scale-in">
                              {trap && (
                                <div
                                  className="rounded-2xl p-4 flex gap-3"
                                  style={{
                                    background: "oklch(var(--trap-bg))",
                                    border:
                                      "1px solid oklch(var(--trap-border))",
                                  }}
                                >
                                  <div
                                    className="p-1.5 rounded-lg h-fit shrink-0"
                                    style={{
                                      background: "oklch(var(--trap-border))",
                                    }}
                                  >
                                    <AlertTriangle
                                      size={14}
                                      style={{
                                        color: "oklch(var(--trap))",
                                      }}
                                    />
                                  </div>
                                  <div>
                                    <p
                                      className="text-[10px] font-black uppercase tracking-widest mb-1"
                                      style={{ color: "oklch(var(--trap))" }}
                                    >
                                      NEET Trap
                                    </p>
                                    <p className="text-sm font-semibold leading-snug text-foreground">
                                      {trap}
                                    </p>
                                  </div>
                                </div>
                              )}

                              {hook && (
                                <div
                                  className="rounded-2xl p-4 flex gap-3"
                                  style={{
                                    background: "oklch(var(--hook-bg))",
                                    border:
                                      "1px solid oklch(var(--hook-border))",
                                  }}
                                >
                                  <div
                                    className="p-1.5 rounded-lg h-fit shrink-0"
                                    style={{
                                      background: "oklch(var(--hook-border))",
                                    }}
                                  >
                                    <Lightbulb
                                      size={14}
                                      style={{
                                        color: "oklch(var(--hook))",
                                      }}
                                    />
                                  </div>
                                  <div>
                                    <p
                                      className="text-[10px] font-black uppercase tracking-widest mb-1"
                                      style={{ color: "oklch(var(--hook))" }}
                                    >
                                      NCERT Hook
                                    </p>
                                    <p className="text-sm font-semibold leading-snug text-foreground">
                                      {hook}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── PREV / NEXT Navigation ───────────────── */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    data-ocid="viewer.pagination_prev"
                    onClick={handlePrev}
                    disabled={isPrevDisabled}
                    className="w-[44%] py-4 rounded-2xl border-2 border-border bg-white text-muted-foreground font-bold text-sm hover:border-primary/30 hover:text-foreground transition-all disabled:opacity-30 active:scale-95 flex items-center justify-center gap-2"
                    aria-label="Previous card"
                  >
                    <ChevronLeft size={20} />
                    PREV
                  </button>

                  <button
                    type="button"
                    data-ocid="viewer.pagination_next"
                    onClick={handleNext}
                    className="flex-1 bg-primary text-primary-foreground font-black py-4 rounded-2xl hover:opacity-90 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm"
                    style={{
                      boxShadow: "0 4px 20px 0 oklch(var(--primary) / 0.3)",
                    }}
                  >
                    {isLastCard ? "FINISH" : "NEXT"}
                    <ChevronRight size={20} />
                  </button>
                </div>

                {/* Delete card (non-builtin only) — small subtle link */}
                {!isBuiltin && (
                  <div className="flex justify-center mt-3">
                    <button
                      type="button"
                      data-ocid="viewer.delete_card.open_modal_button"
                      onClick={() => setShowDeleteDialog(true)}
                      disabled={isDeletingCard}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground/50 hover:text-destructive transition-colors py-1 px-2 rounded-lg disabled:opacity-40"
                      aria-label="Delete this card"
                    >
                      {isDeletingCard ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Trash2 size={12} />
                      )}
                      Delete card
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          /* ── Completion Screen ──────────────────────────────── */
          <div className="bg-white rounded-[2rem] p-8 text-center border border-border animate-scale-in shadow-flashcard">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background: "oklch(var(--primary) / 0.1)" }}
            >
              <RefreshCw style={{ color: "oklch(var(--primary))" }} size={34} />
            </div>
            <h2 className="text-xl font-black text-foreground mb-1.5 tracking-tight">
              Chapter Complete!
            </h2>
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              You've cleared all{" "}
              <span className="font-bold text-foreground">{displayTotal}</span>{" "}
              cards from{" "}
              <span className="font-bold text-foreground">{deck.name}</span>.
            </p>
            <div className="space-y-3">
              <button
                type="button"
                data-ocid="viewer.restart.primary_button"
                onClick={handleReset}
                className="w-full bg-primary text-primary-foreground font-black py-4 rounded-2xl hover:opacity-90 transition-all flex items-center justify-center gap-3"
                style={{
                  boxShadow: "0 4px 20px 0 oklch(var(--primary) / 0.3)",
                }}
              >
                <RefreshCw size={18} />
                Restart Deck
              </button>
              <button
                type="button"
                data-ocid="viewer.back_to_decks.secondary_button"
                onClick={onBack}
                className="w-full bg-secondary text-secondary-foreground font-bold py-4 rounded-2xl hover:bg-accent transition-all"
              >
                Back to Decks
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Fixed Bottom Action Bar ───────────────────────────── */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-border z-20"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex items-center">
          {/* Shuffle */}
          <button
            type="button"
            data-ocid="viewer.shuffle.button"
            onClick={handleShuffle}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-3.5 hover:bg-secondary transition-colors active:bg-secondary"
            aria-label="Shuffle cards"
          >
            <RefreshCw size={19} className="text-foreground/70" />
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
              SHUFFLE
            </span>
          </button>

          {/* Divider */}
          <div className="w-px h-10 bg-border" />

          {/* Bookmarked */}
          <button
            type="button"
            data-ocid="viewer.bookmarks.toggle"
            onClick={handleToggleBookmarkedFilter}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-3.5 transition-colors ${
              showBookmarkedOnly
                ? "bg-primary/5"
                : "hover:bg-secondary active:bg-secondary"
            }`}
            aria-label="Toggle bookmarked cards"
          >
            <Bookmark
              size={19}
              className={
                showBookmarkedOnly
                  ? "text-primary fill-primary"
                  : "text-foreground/70"
              }
            />
            <span
              className={`text-[9px] font-black uppercase tracking-widest ${
                showBookmarkedOnly ? "text-primary" : "text-muted-foreground"
              }`}
            >
              BOOKMARKED
            </span>
          </button>

          {/* Divider */}
          <div className="w-px h-10 bg-border" />

          {/* Reset */}
          <button
            type="button"
            data-ocid="viewer.reset.button"
            onClick={handleReset}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-3.5 hover:bg-destructive/5 transition-colors active:bg-destructive/5 group"
            aria-label="Reset to first card"
          >
            <RotateCcw
              size={19}
              className="text-destructive/70 group-hover:text-destructive transition-colors"
            />
            <span className="text-[9px] font-black uppercase tracking-widest text-destructive/70 group-hover:text-destructive transition-colors">
              RESET
            </span>
          </button>
        </div>
      </div>

      {/* 3D flip CSS */}
      <style>{`
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Add Card Modal */}
      {showAddModal && (
        <AddCardModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddCard}
        />
      )}

      {/* Delete Card Dialog */}
      {showDeleteDialog && (
        <DeleteCardDialog
          onConfirm={handleDeleteCard}
          onCancel={() => setShowDeleteDialog(false)}
          isLoading={isDeletingCard}
        />
      )}
    </div>
  );
}
