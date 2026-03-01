import { useState } from "react";
import type { Deck } from "./backend.d";
import { DeckList } from "./components/DeckList";
import { FlashcardViewer } from "./components/FlashcardViewer";
import type { BuiltinDeck } from "./decks/reproductiveHealth";

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

  if (view === "viewer" && activeDeck) {
    return <FlashcardViewer deck={activeDeck} onBack={handleBack} />;
  }

  return <DeckList onOpenDeck={handleOpenDeck} />;
}
