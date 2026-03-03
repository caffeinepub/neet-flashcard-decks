# NEET Flashcard Decks

## Current State
Multi-deck NEET flashcard app with 3 collapsible sections (Biology / Physics / Chemistry). Existing Biology decks: Reproductive Health (109), Microbes in Human Welfare (130), NEET Biomolecules (120), Animal Kingdom (156), Endocrine System (120). Physics: Laws of Motion (14), Gravitation (9), SHM (12), Electrostatics (12). Chemistry: empty. App has per-deck search, 3D card flip, offline support, and localStorage persistence.

## Requested Changes (Diff)

### Add
- **Chemical Coordination & Integration** deck (83 cards, Biology section): inline ⚠️/💡 format in `back` field, parsed into `trap`/`hook` fields on the BuiltinCard model.
- **Plant Growth & Development** deck (70 cards, Biology section): same inline format.
- **Discoveries & Key Concepts** deck (60 cards, Biology section): same inline format.

### Modify
- `reproductiveHealth.ts` (BUILTIN_DECKS array): import and register the 3 new decks.

### Remove
- Nothing removed.

## Implementation Plan
1. Create `src/frontend/src/decks/chemicalCoordination.ts` — export `chemicalCoordinationDeck` as a `BuiltinDeck` with 83 cards. Parse inline ⚠️/💡 markers from the `back` strings into separate `trap` and `hook` fields.
2. Create `src/frontend/src/decks/plantGrowth.ts` — export `plantGrowthDeck` with 70 cards, same parsing.
3. Create `src/frontend/src/decks/discoveriesKeyConcepts.ts` — export `discoveriesKeyConceptsDeck` with 60 cards.
4. Update `reproductiveHealth.ts`: import the 3 new deck files and append to `BUILTIN_DECKS`.
