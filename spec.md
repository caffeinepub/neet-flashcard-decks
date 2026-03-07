# NEET Flashcard Decks

## Current State
The FlashcardViewer component shows a 3D flip card with a header (deck name, card count, search toggle, add card button, progress counter), a search panel, the flip card itself, navigation buttons (prev icon + next large button), and a footer. There are no category filter tabs, no bookmark feature, and no bottom action bar. The card number is shown inline with the card type badge.

## Requested Changes (Diff)

### Add
- **Category filter tabs** row below the progress bar -- always shown for all decks. If a deck has no `cardType` diversity (all "General" or all same), show only "All Cards" tab. Otherwise show "All Cards" plus one tab per unique `cardType` value. Active tab is filled/solid, inactive tabs are outlined pill buttons.
- **Bookmark button** on the flashcard front (top-right corner area, or as an icon overlay). Bookmarked state toggles a filled bookmark icon. Bookmark state persisted to localStorage keyed by `{deckId}-{cardIndex}`.
- **Bottom action bar** (fixed at bottom of screen, above safe area): three equal columns -- Shuffle (RefreshCw icon + "SHUFFLE" label), Bookmarked (Bookmark icon + "BOOKMARKED" label, acts as filter toggle to show only bookmarked cards), Reset (Trash2 icon + "RESET" label in red/destructive color).
- **Card number format**: top-right of card shows `#001`, `#002` etc (zero-padded to 3 digits) -- position in the **full unfiltered deck** (the card's original index + 1, not filtered position).

### Modify
- **Viewer layout**: change from centered `min-h-screen` with `max-w-lg` to a full-width mobile-first layout. Background should be light grey (`bg-slate-100` or equivalent). Remove the outer centering wrapper padding, use full width.
- **Header section**: 
  - Back button: plain `<` chevron icon on dark/black top bar (as in screenshot), no "All Decks" text label.
  - Below back bar: deck title in primary/indigo color, bold, large. Subtitle row: deck description or chapter label in small uppercase grey text. Card counter (`1 / 150`) right-aligned. Progress bar below this row (thin, full width).
- **Card front**: White card with rounded corners and subtle shadow. Top-left: category badge (pill, outlined, small uppercase text). Top-right: `#001` card number in muted color. Question text centered vertically. Bottom center: "TAP TO REVEAL" hint with up-down arrows icon. No decorative glyph overlays.
- **Card back**: Keep existing flip behavior. Keep "Reveal Study Tips" for trap/hook content. Remove decorative glyph overlays from back too.
- **Navigation**: PREV button (outline, grey, left half width) + NEXT button (solid indigo, right half width), both full-height rounded rectangles. Remove the separate delete/add icon buttons from the nav row -- these functions remain accessible via existing modals.
- **"Mark as Mastered" row**: Replace entirely with bookmark button behavior (bookmark is on the card face itself, not a separate row button).
- Bottom action bar replaces the existing footer branding.

### Remove
- Centered `min-h-screen flex items-center justify-center` layout wrapper
- "All Decks" text label next to back button (keep icon only in dark bar)
- Footer branding text ("High-Yield NCERT Extracts")
- Decorative HelpCircle glyph and geometric accent div from card front
- "Mark as Mastered" / mastered concept entirely -- replaced by bookmark
- Search toggle button from header (keep search accessible via a different entry point or remove for now -- the bottom bar replaces it)

## Implementation Plan
1. **FlashcardViewer.tsx** -- Full layout redesign:
   a. Add `bookmarkedCards` state: `Set<number>` (by card index), persisted to localStorage with key `bookmarks-{deckId}`.
   b. Add `activeCategory` state (string, default "All Cards") and `showBookmarkedOnly` state (boolean).
   c. Derive `categories` from all cards' `cardType` values. If only one unique value or all "General", categories = `["All Cards"]` only.
   d. Derive `filteredCards` based on activeCategory + showBookmarkedOnly filters. The current card index always refers to position in `localCards` (full deck). `filteredCards` is used for PREV/NEXT navigation but `#NNN` badge uses original index.
   e. Redesign header: dark top bar with back `<` button only, then white/light section with deck title (indigo), subtitle, counter + progress bar.
   f. Add category tabs row (scrollable horizontal, pill style).
   g. Redesign card front: remove decorative overlays, add category badge top-left + card number `#NNN` top-right + bookmark icon (top-right or corner), question centered, TAP TO REVEAL at bottom.
   h. Bookmark icon: filled when bookmarked, outline when not. Clicking it toggles bookmark for that card index.
   i. Redesign nav: PREV half-width outline + NEXT half-width solid indigo.
   j. Add fixed bottom bar: Shuffle | Bookmarked (toggle) | Reset -- with icons and labels. When `showBookmarkedOnly` is active, the Bookmarked icon/label appears highlighted/filled.
   k. Keep AddCardModal, DeleteCardDialog, search panel, score screen, and empty deck state intact. Search toggle can remain in header as a small icon.
   l. Apply bottom padding to main content so fixed bottom bar doesn't overlap cards.
2. **Preserve** all existing logic: saveDeck, deleteDeck, handleAddCard, handleDeleteCard, handleReset, handleShuffle (new: shuffle localCards), search.
3. **Add shuffle handler**: shuffle `localCards` array, reset to index 0.
