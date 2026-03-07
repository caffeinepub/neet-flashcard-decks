import { useState } from "react";
import type { Deck } from "./backend.d";
import { DeckList } from "./components/DeckList";
import { FlashcardViewer } from "./components/FlashcardViewer";
import type { BuiltinDeck } from "./decks/reproductiveHealth";
import type { ParsedCard } from "./utils/deckImport";

type AppView = "list" | "viewer";
type ViewerDeck = Deck | BuiltinDeck;

export default function App() {
  const [view, setView] = useState<AppView>("list");
  const [activeDeck, setActiveDeck] = useState<ViewerDeck | null>(null);

  const handleOpenDeck = (deck: ViewerDeck) => {
    setActiveDeck(deck);
    setView("viewer");
  };

  const handleBack = () => {
    setView("list");
    setActiveDeck(null);
  };

  const handleDeckChange = (updatedCards: ParsedCard[]) => {
    if (activeDeck) {
      setActiveDeck({ ...activeDeck, cards: updatedCards as any });
    }
  };

  if (view === "viewer" && activeDeck) {
    return (
      <FlashcardViewer
        deck={activeDeck}
        onBack={handleBack}
        isBuiltin={!!(activeDeck as any)?.isBuiltin}
        onDeckChange={handleDeckChange}
      />
    );
  }

  return <DeckList onOpenDeck={handleOpenDeck} />;
}
