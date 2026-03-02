import {
  AlertCircle,
  BookOpen,
  Check,
  ChevronDown,
  Code2,
  GraduationCap,
  Loader2,
  Lock,
  Pencil,
  Trash2,
  Upload,
  WifiOff,
  X,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import type { Deck } from "../backend.d";
import type { BuiltinDeck } from "../decks/reproductiveHealth";
import { BUILTIN_DECKS } from "../decks/reproductiveHealth";
import {
  useDeleteDeck,
  useListDecks,
  useRenameDeck,
  useSaveDeck,
} from "../hooks/useQueries";
import { parseAnyDeck, parseCSVDeck } from "../utils/deckImport";

// ── Types ────────────────────────────────────────────────────

type MergedDeck = (Deck | BuiltinDeck) & { isBuiltin?: boolean };

interface DeckListProps {
  onOpenDeck: (deck: MergedDeck) => void;
}

// ── Delete Confirmation Dialog ────────────────────────────────

interface DeleteDialogProps {
  deckName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

function DeleteDialog({
  deckName,
  onConfirm,
  onCancel,
  isLoading,
}: DeleteDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm cursor-default"
        onClick={onCancel}
        onKeyDown={(e) => e.key === "Escape" && onCancel()}
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
              Delete deck?
            </h3>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              <span className="font-semibold text-foreground">
                "{deckName}"
              </span>{" "}
              will be permanently deleted. This cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl bg-secondary text-secondary-foreground font-semibold text-sm hover:bg-accent transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
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

// ── Deck Card ────────────────────────────────────────────────

interface DeckCardProps {
  deck: MergedDeck;
  onOpen: () => void;
  onDelete?: () => void;
  onRename?: (newName: string) => void;
  isDeleting: boolean;
  isRenaming: boolean;
}

function DeckCard({
  deck,
  onOpen,
  onDelete,
  onRename,
  isDeleting,
  isRenaming,
}: DeckCardProps) {
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(deck.name);
  const inputRef = useRef<HTMLInputElement>(null);

  const isBuiltin = !!(deck as BuiltinDeck).isBuiltin;
  const cardCount = deck.cards.length;

  const startEdit = () => {
    setNameValue(deck.name);
    setEditingName(true);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const submitEdit = () => {
    const trimmed = nameValue.trim();
    if (trimmed && trimmed !== deck.name && onRename) {
      onRename(trimmed);
    }
    setEditingName(false);
  };

  const cancelEdit = () => {
    setNameValue(deck.name);
    setEditingName(false);
  };

  return (
    <article
      className="group bg-card rounded-2xl border border-border hover:border-primary/30 transition-all hover:shadow-card-hover animate-fade-up"
      style={{ boxShadow: "0 2px 8px 0 oklch(0 0 0 / 0.05)" }}
    >
      {/* Top section */}
      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            {editingName ? (
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submitEdit();
                    if (e.key === "Escape") cancelEdit();
                  }}
                  className="flex-1 text-sm font-bold bg-secondary border border-primary/30 rounded-lg px-2 py-1 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 min-w-0"
                />
                <button
                  type="button"
                  onClick={submitEdit}
                  disabled={isRenaming}
                  className="p-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 shrink-0"
                  aria-label="Save name"
                >
                  {isRenaming ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Check size={13} />
                  )}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="p-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-foreground transition-colors shrink-0"
                  aria-label="Cancel rename"
                >
                  <X size={13} />
                </button>
              </div>
            ) : (
              <h3 className="font-bold text-foreground text-base leading-tight truncate">
                {deck.name}
              </h3>
            )}
          </div>

          {/* Badges */}
          <div className="flex items-center gap-1.5 shrink-0">
            {isBuiltin && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full"
                style={{
                  background: "oklch(var(--primary) / 0.1)",
                  color: "oklch(var(--primary))",
                }}
              >
                <Lock size={8} />
                Built-in
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        {deck.description && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">
            {deck.description}
          </p>
        )}

        {/* Card count */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <BookOpen size={13} />
          <span className="font-semibold">{cardCount} cards</span>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* Action row */}
      <div className="flex items-center gap-1 p-3">
        <button
          type="button"
          onClick={onOpen}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-all active:scale-[0.98]"
          style={{ boxShadow: "0 2px 10px 0 oklch(var(--primary) / 0.25)" }}
        >
          <GraduationCap size={15} />
          Study
        </button>

        {!isBuiltin && (
          <>
            <button
              type="button"
              onClick={startEdit}
              disabled={editingName || isRenaming}
              className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-all disabled:opacity-40"
              aria-label="Rename deck"
            >
              <Pencil size={15} />
            </button>

            <button
              type="button"
              onClick={onDelete}
              disabled={isDeleting}
              className="p-2.5 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all disabled:opacity-40"
              aria-label="Delete deck"
            >
              {isDeleting ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Trash2 size={15} />
              )}
            </button>
          </>
        )}
      </div>
    </article>
  );
}

// ── Import Button ────────────────────────────────────────────

interface ImportButtonProps {
  onImport: (file: File) => void;
  isImporting: boolean;
  importError: string | null;
  disabled?: boolean;
}

function ImportButton({
  onImport,
  isImporting,
  importError,
  disabled,
}: ImportButtonProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <input
        ref={fileRef}
        type="file"
        accept=".json,.csv"
        className="sr-only"
        aria-label="Upload deck file"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            onImport(file);
            e.target.value = "";
          }
        }}
      />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={isImporting || disabled}
        title={disabled ? "Go online to import new decks" : undefined}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          background: "oklch(var(--primary) / 0.1)",
          color: "oklch(var(--primary))",
          border: "1.5px solid oklch(var(--primary) / 0.25)",
        }}
      >
        {isImporting ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Upload size={16} />
        )}
        Import Deck
      </button>

      {importError && (
        <div
          className="mt-3 flex items-start gap-2 p-3 rounded-xl text-sm animate-fade-in"
          style={{
            background: "oklch(var(--destructive) / 0.08)",
            border: "1px solid oklch(var(--destructive) / 0.2)",
            color: "oklch(var(--destructive))",
          }}
        >
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          <p className="font-medium leading-snug">{importError}</p>
        </div>
      )}
    </div>
  );
}

// ── Paste Code Modal ─────────────────────────────────────────

const PASTE_PLACEHOLDER = `// Paste any of these formats:

// 1. Full React component (deck name auto-detected from <h1>):
import React, { useState } from 'react';
const rawData = [
  { id: 1, type: "Concept", title: "Photosynthesis",
    front: "What is photosynthesis?",
    back: "Conversion of sunlight to glucose.",
    trap: "Occurs only in chloroplasts.",
    hook: "Plants use sun to make food." }
];
const App = () => { ... };

// 2. JS variable (any name works):
const rawData = [
  { front: "Question", back: "Answer", trap: "Trap", hook: "Hook" }
];

// 3. Bare JS array:
[{ front: "Question", back: "Answer" }]

// 4. JSON object:
{ "name": "My Deck", "cards": [{ "front": "Q", "back": "A" }] }`;

interface PasteCodeModalProps {
  onClose: () => void;
  onSuccess: () => void;
  allDecks: MergedDeck[];
  saveDeck: ReturnType<typeof useSaveDeck>;
}

function PasteCodeModal({
  onClose,
  onSuccess,
  allDecks,
  saveDeck,
}: PasteCodeModalProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImport = async () => {
    setError(null);
    const trimmed = code.trim();
    if (!trimmed) {
      setError("Please paste your deck code before importing.");
      return;
    }

    setIsSubmitting(true);
    try {
      let parsed = parseAnyDeck(trimmed);
      if (parsed instanceof Error) {
        setError(parsed.message);
        return;
      }

      // Deduplicate IDs
      const existingIds = new Set(allDecks.map((d) => d.id));
      if (existingIds.has(parsed.id)) {
        parsed = { ...parsed, id: crypto.randomUUID() };
      }

      await saveDeck.mutateAsync(parsed);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to import deck.");
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
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        aria-label="Close dialog"
      />

      {/* Modal card */}
      <div
        className="relative bg-card rounded-2xl p-6 w-full max-w-lg border border-border flex flex-col gap-4 animate-scale-in"
        style={{ boxShadow: "0 20px 60px 0 oklch(0 0 0 / 0.15)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-xl shrink-0"
              style={{ background: "oklch(var(--primary) / 0.1)" }}
            >
              <Code2 size={18} style={{ color: "oklch(var(--primary))" }} />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-base leading-tight">
                Import via Code
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Paste JS array, variable, or JSON — any format works
              </p>
            </div>
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

        {/* Textarea */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="paste-code-area"
            className="text-xs font-semibold text-muted-foreground uppercase tracking-widest"
          >
            Deck Code
          </label>
          <textarea
            id="paste-code-area"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              if (error) setError(null);
            }}
            placeholder={PASTE_PLACEHOLDER}
            rows={14}
            spellCheck={false}
            className="w-full rounded-xl border border-border bg-secondary text-foreground text-xs leading-relaxed p-4 resize-none focus:outline-none focus:ring-2 transition-all placeholder:text-muted-foreground/50"
            style={{
              fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
            }}
          />
        </div>

        {/* Error */}
        {error && (
          <div
            className="flex items-start gap-2 p-3 rounded-xl text-sm animate-fade-in"
            style={{
              background: "oklch(var(--destructive) / 0.08)",
              border: "1px solid oklch(var(--destructive) / 0.2)",
              color: "oklch(var(--destructive))",
            }}
          >
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <p className="font-medium leading-snug">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-secondary text-secondary-foreground font-semibold text-sm hover:bg-accent transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleImport}
            disabled={isSubmitting || saveDeck.isPending}
            className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ boxShadow: "0 2px 10px 0 oklch(var(--primary) / 0.25)" }}
          >
            {isSubmitting || saveDeck.isPending ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Code2 size={15} />
            )}
            {isSubmitting || saveDeck.isPending ? "Importing…" : "Import Deck"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Section constants ────────────────────────────────────────

const SECTIONS = ["Biology", "Physics", "Chemistry"] as const;
type Section = (typeof SECTIONS)[number];

const getDeckSection = (deck: MergedDeck): Section => {
  const section = (deck as BuiltinDeck).section;
  if (section === "Biology" || section === "Physics" || section === "Chemistry")
    return section;
  return "Biology";
};

// ── Section Group ────────────────────────────────────────────

interface SectionGroupProps {
  title: Section;
  deckCount: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function SectionGroup({
  title,
  deckCount,
  defaultOpen = false,
  children,
}: SectionGroupProps) {
  const [open, setOpen] = useState(defaultOpen);

  const sectionAccentMap: Record<Section, string> = {
    Biology: "var(--section-bio)",
    Physics: "var(--section-phys)",
    Chemistry: "var(--section-chem)",
  };
  const accent = sectionAccentMap[title];

  return (
    <div className="rounded-2xl border border-border overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 bg-card hover:bg-secondary/50 transition-colors text-left group"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Colored dot */}
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ background: `oklch(${accent})` }}
          />
          <span className="font-bold text-foreground text-sm tracking-tight">
            {title}
          </span>
          {/* Deck count badge */}
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0"
            style={{
              background: `oklch(${accent} / 0.12)`,
              color: `oklch(${accent})`,
            }}
          >
            {deckCount === 0
              ? "empty"
              : `${deckCount} deck${deckCount !== 1 ? "s" : ""}`}
          </span>
        </div>
        <ChevronDown
          size={16}
          className="text-muted-foreground transition-transform duration-200 shrink-0"
          style={{ transform: open ? "rotate(0deg)" : "rotate(-90deg)" }}
        />
      </button>

      {/* Divider */}
      <div
        className="h-px"
        style={{
          background: open ? `oklch(${accent} / 0.15)` : "transparent",
          transition: "background 0.2s",
        }}
      />

      {/* Body */}
      {open && (
        <div className="p-4 bg-background">
          {deckCount === 0 ? (
            <div className="py-8 flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <BookOpen size={22} className="opacity-30" />
              <p className="text-xs font-medium">No decks yet</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
              {children}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main DeckList ────────────────────────────────────────────

export function DeckList({ onOpenDeck }: DeckListProps) {
  const { data: backendDecks = [], isLoading } = useListDecks();
  const saveDeck = useSaveDeck();
  const deleteDeck = useDeleteDeck();
  const renameDeck = useRenameDeck();

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [offline, setOffline] = useState(!navigator.onLine);

  // Keep offline state in sync with browser connectivity
  useEffect(() => {
    const goOffline = () => setOffline(true);
    const goOnline = () => setOffline(false);
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  // Merge: built-ins first, then backend decks (exclude any that shadow built-in IDs)
  const builtinIds = new Set(BUILTIN_DECKS.map((d) => d.id));
  const filteredBackend = backendDecks.filter((d) => !builtinIds.has(d.id));
  const allDecks: MergedDeck[] = [...BUILTIN_DECKS, ...filteredBackend];

  // ── Import handler ──

  const handleImport = async (file: File) => {
    setImportError(null);
    setIsImporting(true);

    try {
      const content = await file.text();
      const deckName = file.name.replace(/\.[^.]+$/, "");

      let parsed:
        | ReturnType<typeof parseCSVDeck>
        | ReturnType<typeof parseAnyDeck>;
      if (file.name.endsWith(".csv")) {
        parsed = parseCSVDeck(content, deckName);
      } else {
        parsed = parseAnyDeck(content);
      }

      if (parsed instanceof Error) {
        setImportError(parsed.message);
        return;
      }

      // Check for duplicate IDs against all existing decks
      const existingIds = new Set(allDecks.map((d) => d.id));
      if (existingIds.has(parsed.id)) {
        parsed = { ...parsed, id: crypto.randomUUID() };
      }

      await saveDeck.mutateAsync(parsed);
    } catch (err) {
      setImportError(
        err instanceof Error ? err.message : "Failed to import deck.",
      );
    } finally {
      setIsImporting(false);
    }
  };

  // ── Delete handler ──

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteDeck.mutateAsync(deleteTarget);
    } finally {
      setDeleteTarget(null);
    }
  };

  // ── Rename handler ──

  const handleRename = async (id: string, newName: string) => {
    setRenamingId(id);
    try {
      await renameDeck.mutateAsync({ id, newName });
    } finally {
      setRenamingId(null);
    }
  };

  const deleteTargetDeck = allDecks.find((d) => d.id === deleteTarget);

  return (
    <div className="min-h-screen bg-background relative z-10">
      {/* Offline banner */}
      {offline && (
        <div
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold"
          style={{
            background: "oklch(0.65 0.12 50 / 0.12)",
            borderBottom: "1px solid oklch(0.65 0.12 50 / 0.3)",
            color: "oklch(0.5 0.1 50)",
          }}
        >
          <WifiOff size={13} />
          You are offline — studying from your cached decks
        </div>
      )}

      {/* Header */}
      <header className="border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-foreground tracking-tight">
              NEET Flashcards
            </h1>
            <p className="text-xs text-muted-foreground font-medium">
              {allDecks.length} deck{allDecks.length !== 1 ? "s" : ""} ·{" "}
              {allDecks.reduce((sum, d) => sum + d.cards.length, 0)} cards
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            <button
              type="button"
              onClick={() => setShowPasteModal(true)}
              disabled={offline}
              title={offline ? "Go online to add new decks" : undefined}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: "oklch(var(--primary) / 0.08)",
                color: "oklch(var(--primary))",
                border: "1.5px solid oklch(var(--primary) / 0.2)",
              }}
            >
              <Code2 size={16} />
              <span className="hidden sm:inline">Paste Code</span>
            </button>

            <ImportButton
              onImport={handleImport}
              isImporting={isImporting || saveDeck.isPending}
              importError={importError}
              disabled={offline}
            />
          </div>
        </div>
      </header>

      {/* Import error (mobile — repeated below header for visibility) */}

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Import error shown inline under header on mobile */}
        {importError && (
          <div
            className="mb-6 flex items-start gap-2 p-4 rounded-xl text-sm animate-fade-in sm:hidden"
            style={{
              background: "oklch(var(--destructive) / 0.08)",
              border: "1px solid oklch(var(--destructive) / 0.2)",
              color: "oklch(var(--destructive))",
            }}
          >
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <p className="font-medium leading-snug">{importError}</p>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {(["sk-1", "sk-2", "sk-3"] as const).map((sk) => (
              <div
                key={sk}
                className="rounded-2xl border border-border bg-card animate-pulse"
                style={{ height: 64 }}
              />
            ))}
          </div>
        ) : (
          (() => {
            const decksBySection = Object.fromEntries(
              SECTIONS.map((s) => [
                s,
                allDecks.filter((d) => getDeckSection(d) === s),
              ]),
            ) as Record<Section, MergedDeck[]>;

            return (
              <div className="space-y-3">
                {SECTIONS.map((section) => (
                  <SectionGroup
                    key={section}
                    title={section}
                    deckCount={decksBySection[section].length}
                    defaultOpen={section === "Biology"}
                  >
                    {decksBySection[section].map((deck) => (
                      <DeckCard
                        key={deck.id}
                        deck={deck}
                        onOpen={() => onOpenDeck(deck)}
                        onDelete={
                          !(deck as BuiltinDeck).isBuiltin
                            ? () => setDeleteTarget(deck.id)
                            : undefined
                        }
                        onRename={
                          !(deck as BuiltinDeck).isBuiltin
                            ? (newName) => handleRename(deck.id, newName)
                            : undefined
                        }
                        isDeleting={
                          deleteDeck.isPending && deleteTarget === deck.id
                        }
                        isRenaming={renamingId === deck.id}
                      />
                    ))}
                  </SectionGroup>
                ))}
              </div>
            );
          })()
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-auto py-6">
        <p className="text-center text-[11px] text-muted-foreground">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </footer>

      {/* Delete Confirmation */}
      {deleteTarget && deleteTargetDeck && (
        <DeleteDialog
          deckName={deleteTargetDeck.name}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          isLoading={deleteDeck.isPending}
        />
      )}

      {/* Paste Code Modal */}
      {showPasteModal && (
        <PasteCodeModal
          allDecks={allDecks}
          saveDeck={saveDeck}
          onClose={() => setShowPasteModal(false)}
          onSuccess={() => setShowPasteModal(false)}
        />
      )}
    </div>
  );
}
