# NEET Flashcard Decks

## Current State
Multi-deck NEET flashcard app with 3 collapsible sections (Biology, Physics, Chemistry). Biology has 6 built-in decks. Physics and Chemistry are empty. Built-in decks are registered in `BUILTIN_DECKS` array in `reproductiveHealth.ts`, each as a separate `.ts` file in `src/frontend/src/decks/`.

## Requested Changes (Diff)

### Add
- 4 new Physics built-in decks:
  - **Laws of Motion** (14 cards) -- Physics section
  - **Gravitation** (9 cards) -- Physics section
  - **SHM** (12 cards) -- Physics section
  - **Electrostatics** (12 cards) -- Physics section
- 4 new deck files: `lawsOfMotion.ts`, `gravitation.ts`, `shm.ts`, `electrostatics.ts`

### Modify
- `reproductiveHealth.ts`: import and register all 4 new decks in `BUILTIN_DECKS`

### Remove
- Nothing

## Implementation Plan
1. Create `src/frontend/src/decks/lawsOfMotion.ts` with 14 cards, `section: "Physics"`
2. Create `src/frontend/src/decks/gravitation.ts` with 9 cards, `section: "Physics"`
3. Create `src/frontend/src/decks/shm.ts` with 12 cards, `section: "Physics"`
4. Create `src/frontend/src/decks/electrostatics.ts` with 12 cards, `section: "Physics"`
5. Update `BUILTIN_DECKS` in `reproductiveHealth.ts` to import and include all 4 new decks
6. Verify build passes
