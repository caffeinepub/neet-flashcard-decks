import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  HelpCircle,
  Lightbulb,
  RefreshCw,
} from "lucide-react";
import { useState } from "react";
import type { Deck } from "../backend.d";
import type { BuiltinDeck } from "../decks/reproductiveHealth";

// ── Types ────────────────────────────────────────────────────

type ViewerDeck = Deck | BuiltinDeck;

interface FlashcardViewerProps {
  deck: ViewerDeck;
  onBack: () => void;
}

// ── Helper ───────────────────────────────────────────────────

function getCards(deck: ViewerDeck) {
  return deck.cards;
}

function getCardField(
  card: ViewerDeck["cards"][number],
  field: "front" | "back" | "title" | "cardType" | "trap" | "hook",
): string | undefined {
  // Cast to unknown first to satisfy strict TypeScript
  return (card as unknown as Record<string, unknown>)[field] as
    | string
    | undefined;
}

// ── Component ────────────────────────────────────────────────

export function FlashcardViewer({ deck, onBack }: FlashcardViewerProps) {
  const cards = getCards(deck);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [showScore, setShowScore] = useState(false);

  const currentCard = cards[currentIndex];
  const trap = getCardField(currentCard, "trap");
  const hook = getCardField(currentCard, "hook");
  const hasTips = !!(trap || hook);

  const handleNext = () => {
    setIsFlipped(false);
    setShowTips(false);
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setShowScore(true);
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setShowTips(false);
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
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

  const cardType = getCardField(currentCard, "cardType") ?? "";
  const title = getCardField(currentCard, "title") ?? "";
  const front = getCardField(currentCard, "front") ?? "";
  const back = getCardField(currentCard, "back") ?? "";

  // Card number: bigint (backend) or number (builtin)
  const cardNum = (() => {
    const id = (currentCard as unknown as Record<string, unknown>).id;
    if (typeof id === "bigint") return Number(id);
    if (typeof id === "number") return id;
    return currentIndex + 1;
  })();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-lg relative z-10">
        {/* Back button */}
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 group"
          aria-label="Back to deck list"
        >
          <ArrowLeft
            size={18}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span className="text-sm font-semibold">All Decks</span>
        </button>

        {/* Progress Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight leading-tight">
              {deck.name}
            </h1>
            <p className="text-xs font-semibold text-primary/80 mt-0.5 flex items-center gap-1">
              <CheckCircle size={11} />
              {cards.length} cards
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span className="text-sm font-bold text-muted-foreground tabular-nums">
              {currentIndex + 1}
              <span className="text-border mx-1">/</span>
              {cards.length}
            </span>
            <div className="w-28 h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300 rounded-full"
                style={{
                  width: `${((currentIndex + 1) / cards.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Card + Score */}
        {!showScore ? (
          <div>
            {/* 3D Flip Card */}
            <div className="relative w-full" style={{ perspective: "1200px" }}>
              <div
                className={`relative w-full transition-all duration-700 preserve-3d ${isFlipped ? "rotate-y-180" : ""}`}
                style={{ height: "480px" }}
              >
                {/* FRONT */}
                <button
                  type="button"
                  onClick={handleFlip}
                  className="absolute inset-0 backface-hidden bg-card rounded-3xl border border-border cursor-pointer select-none flex flex-col items-center justify-center p-10 text-center w-full"
                  style={{
                    boxShadow:
                      "0 20px 60px 0 oklch(0 0 0 / 0.1), 0 4px 12px 0 oklch(0 0 0 / 0.06)",
                  }}
                  aria-label="Flip card to see answer"
                >
                  {/* Decorative background glyph */}
                  <div className="absolute top-5 left-5 text-primary/5 pointer-events-none">
                    <HelpCircle size={72} />
                  </div>

                  {/* Decorative geometric accent */}
                  <div
                    className="absolute bottom-0 right-0 w-40 h-40 rounded-tl-[4rem] opacity-[0.04] pointer-events-none"
                    style={{ background: "oklch(var(--primary))" }}
                  />

                  <div className="relative z-10 space-y-3">
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      <span className="inline-flex items-center px-3 py-1 bg-secondary text-secondary-foreground text-[10px] font-black uppercase tracking-[0.18em] rounded-full">
                        {cardType}
                      </span>
                      <span className="text-[10px] font-bold text-muted-foreground tabular-nums">
                        #{cardNum}
                      </span>
                    </div>
                    {title && (
                      <p className="text-xs font-bold text-primary/70 uppercase tracking-widest">
                        {title}
                      </p>
                    )}
                    <p className="text-[1.35rem] font-bold text-foreground leading-snug">
                      {front}
                    </p>
                  </div>

                  <div className="absolute bottom-6 left-0 right-0 text-center">
                    <p className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-[0.3em] animate-pulse">
                      Tap to flip
                    </p>
                  </div>
                </button>

                {/* BACK */}
                <div
                  className="absolute inset-0 backface-hidden rotate-y-180 bg-card rounded-3xl border border-primary/20 flex flex-col overflow-hidden"
                  style={{
                    boxShadow:
                      "0 20px 60px 0 oklch(0 0 0 / 0.1), 0 4px 12px 0 oklch(0 0 0 / 0.06)",
                  }}
                >
                  <div className="flex-1 flex flex-col p-8 overflow-y-auto">
                    {/* Answer area — clickable to flip back */}
                    <button
                      type="button"
                      onClick={handleFlip}
                      className="text-center mb-auto pt-4 cursor-pointer w-full"
                    >
                      <span className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.18em] rounded-full mb-3">
                        Answer
                      </span>
                      <p className="text-[1.4rem] font-black text-primary leading-snug">
                        {back}
                      </p>
                      <p className="text-[9px] text-muted-foreground/50 mt-2 uppercase tracking-widest font-bold">
                        Tap to flip back
                      </p>
                    </button>

                    {/* Study Tips section */}
                    <div className="mt-6">
                      {hasTips && !showTips && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowTips(true);
                          }}
                          className="w-full py-3.5 bg-secondary hover:bg-accent border-2 border-dashed border-border hover:border-primary/30 rounded-2xl flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-all font-bold text-sm group"
                        >
                          <Eye
                            size={16}
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
                                border: "1px solid oklch(var(--trap-border))",
                              }}
                            >
                              <div
                                className="p-1.5 rounded-lg h-fit shrink-0"
                                style={{
                                  background: "oklch(var(--trap-border))",
                                }}
                              >
                                <AlertTriangle
                                  size={15}
                                  style={{ color: "oklch(var(--trap))" }}
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
                                border: "1px solid oklch(var(--hook-border))",
                              }}
                            >
                              <div
                                className="p-1.5 rounded-lg h-fit shrink-0"
                                style={{
                                  background: "oklch(var(--hook-border))",
                                }}
                              >
                                <Lightbulb
                                  size={15}
                                  style={{ color: "oklch(var(--hook))" }}
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

            {/* Navigation */}
            <div className="flex items-center gap-3 mt-6">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="p-4 bg-card border border-border rounded-2xl text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all disabled:opacity-30 active:scale-95"
                aria-label="Previous card"
              >
                <ChevronLeft size={24} />
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="flex-1 bg-primary text-primary-foreground font-black py-4 rounded-2xl hover:opacity-90 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-base"
                style={{
                  boxShadow: "0 4px 20px 0 oklch(var(--primary) / 0.3)",
                }}
              >
                {currentIndex === cards.length - 1
                  ? "Finish Deck"
                  : "Next Concept"}
                <ChevronRight size={22} />
              </button>
            </div>
          </div>
        ) : (
          /* Completion Screen */
          <div
            className="bg-card rounded-[2rem] p-10 text-center border border-border animate-scale-in"
            style={{ boxShadow: "0 20px 60px 0 oklch(0 0 0 / 0.1)" }}
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: "oklch(0.85 0.1 168 / 0.2)" }}
            >
              <CheckCircle style={{ color: "oklch(0.5 0.14 168)" }} size={44} />
            </div>
            <h2 className="text-2xl font-black text-foreground mb-2 tracking-tight">
              Chapter Complete!
            </h2>
            <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
              You've cleared all{" "}
              <span className="font-bold text-foreground">{cards.length}</span>{" "}
              cards from{" "}
              <span className="font-bold text-foreground">{deck.name}</span>.
            </p>
            <div className="space-y-3">
              <button
                type="button"
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
                onClick={onBack}
                className="w-full bg-secondary text-secondary-foreground font-bold py-4 rounded-2xl hover:bg-accent transition-all"
              >
                Back to Decks
              </button>
            </div>
          </div>
        )}

        {/* Footer branding */}
        <div className="mt-8 text-center">
          <p className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-[0.4em]">
            High-Yield NCERT Extracts
          </p>
        </div>
      </div>

      {/* 3D flip CSS */}
      <style>{`
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
}
