/**
 * Deck import utilities: parse and validate JSON/CSV deck files.
 */

import type { Card } from "../backend.d";

export interface ParsedCard {
  id: number;
  cardType: string;
  title: string;
  front: string;
  back: string;
  trap?: string;
  hook?: string;
}

export interface ParsedDeck {
  id: string;
  name: string;
  description: string;
  cards: ParsedCard[];
}

// ── Validation ───────────────────────────────────────────────

const FRONT_ALIASES_JSON = ["front", "q", "question", "prompt", "term", "word"];
const BACK_ALIASES_JSON = ["back", "a", "answer", "definition", "meaning"];

function pickFieldJSON(c: Record<string, unknown>, aliases: string[]): unknown {
  for (const key of aliases) {
    if (key in c) return c[key];
  }
  return undefined;
}

export function validateDeck(deck: unknown): deck is ParsedDeck {
  if (!deck || typeof deck !== "object") return false;
  const d = deck as Record<string, unknown>;
  if (typeof d.name !== "string" || !d.name.trim()) return false;
  if (!Array.isArray(d.cards) || d.cards.length === 0) return false;

  for (const card of d.cards) {
    if (!card || typeof card !== "object") return false;
    const c = card as Record<string, unknown>;
    const frontVal = pickFieldJSON(c, FRONT_ALIASES_JSON);
    if (typeof frontVal !== "string" || !frontVal.trim()) return false;
    const backVal = pickFieldJSON(c, BACK_ALIASES_JSON);
    if (typeof backVal !== "string" || !backVal.trim()) return false;
  }
  return true;
}

// ── JSON Parser ──────────────────────────────────────────────

export function parseJSONDeck(content: string): ParsedDeck | Error {
  let raw: unknown;
  try {
    raw = JSON.parse(content);
  } catch {
    return new Error("Invalid JSON: could not parse file.");
  }

  // Accept both { name, cards } and an array of cards
  let deckObj: unknown = raw;
  if (Array.isArray(raw)) {
    // Bare array — wrap it
    deckObj = { name: "Imported Deck", cards: raw };
  }

  if (!validateDeck(deckObj)) {
    return new Error(
      "Invalid deck structure. Expected { name: string, cards: [{ front, back, ... }] }.",
    );
  }

  const d = deckObj as unknown as Record<string, unknown>;
  const rawCards = d.cards as Record<string, unknown>[];

  const TRAP_ALIASES_JSON = [
    "trap",
    "tip",
    "note",
    "warning",
    "neetTrap",
    "neet_trap",
  ];
  const HOOK_ALIASES_JSON = [
    "hook",
    "hint",
    "mnemonic",
    "ncertHook",
    "ncert_hook",
    "memory",
  ];

  const cards: ParsedCard[] = rawCards.map((c, idx) => {
    const frontVal = pickFieldJSON(c, FRONT_ALIASES_JSON) as string;
    const backVal = pickFieldJSON(c, BACK_ALIASES_JSON) as string;
    const trapVal = pickFieldJSON(c, TRAP_ALIASES_JSON);
    const hookVal = pickFieldJSON(c, HOOK_ALIASES_JSON);
    return {
      id: typeof c.id === "number" ? c.id : idx + 1,
      cardType:
        typeof c.cardType === "string"
          ? c.cardType
          : typeof c.type === "string"
            ? c.type
            : typeof c.category === "string"
              ? c.category
              : "General",
      title: typeof c.title === "string" ? c.title : "",
      front: frontVal,
      back: backVal,
      trap: typeof trapVal === "string" && trapVal.trim() ? trapVal : undefined,
      hook: typeof hookVal === "string" && hookVal.trim() ? hookVal : undefined,
    };
  });

  return {
    id: typeof d.id === "string" ? d.id : crypto.randomUUID(),
    name: (d.name as string).trim(),
    description: typeof d.description === "string" ? d.description : "",
    cards,
  };
}

// ── JS/TS Code Parser ─────────────────────────────────────────
//
// Accepts code in these forms:
//   const rawData = [ ... ]
//   const rawData = [ ... ];
//   export const rawData = [ ... ]
//   [ ... ]   (bare array literal)
//   Full React component files (extracts rawData/any array variable + h1 deck name)
//
// The deck name is derived from the <h1> tag in JSX, the variable name, or defaults to "Imported Deck".

export function parseCodeDeck(content: string): ParsedDeck | Error {
  const trimmed = content.trim();

  // Step 1: Try to detect deck name from JSX <h1> tag
  // e.g. <h1 className="...">Photosynthesis Master</h1>
  let deckName = "Imported Deck";
  const h1Match = trimmed.match(/<h1[^>]*>\s*([^<]{2,80}?)\s*<\/h1>/);
  if (h1Match) {
    deckName = h1Match[1].trim();
  }

  // Step 2: Find any variable declaration assigned to an array literal
  // Search anywhere in the file (not just at the start) for:
  //   (export)? (const|let|var) <name> = [
  // Excludes destructuring patterns like: const [a, b] = ...
  let arrayText = trimmed;

  // Use matchAll with a non-global-looping approach to avoid infinite loop issues
  // with exec on large strings. We collect all matches first.
  const varPattern = /(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*\[/g;

  type VarMatch = { name: string; startIndex: number };
  const allVarMatches: VarMatch[] = [];
  for (const vm of trimmed.matchAll(varPattern)) {
    allVarMatches.push({
      name: vm[1],
      startIndex: vm.index + vm[0].length - 1,
    });
  }

  // Prefer 'rawData' match, otherwise use the first match found
  let bestVarMatch: VarMatch | null = null;
  for (const m of allVarMatches) {
    if (!bestVarMatch || m.name === "rawData") {
      bestVarMatch = m;
      if (m.name === "rawData") break;
    }
  }

  if (bestVarMatch) {
    const varName = bestVarMatch.name;
    // Only use variable name for deck name if we didn't find an h1
    if (deckName === "Imported Deck") {
      deckName = varName
        .replace(/([A-Z])/g, " $1")
        .replace(/[_-]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      deckName = deckName.charAt(0).toUpperCase() + deckName.slice(1);
    }
    // Slice from the '[' character of the matched variable's array
    arrayText = trimmed.slice(bestVarMatch.startIndex);
  }

  // Step 3: Locate the outermost [ ... ] array literal
  const startIdx = arrayText.indexOf("[");
  if (startIdx === -1) {
    return new Error(
      "No array found. Paste the full variable declaration (e.g. const rawData = [...]) or a bare array.",
    );
  }

  // Walk to find matching closing bracket, handling strings and nesting
  let depth = 0;
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inTemplate = false;
  let endIdx = -1;

  for (let i = startIdx; i < arrayText.length; i++) {
    const ch = arrayText[i];
    const prev = i > 0 ? arrayText[i - 1] : "";

    if (ch === "'" && !inDoubleQuote && !inTemplate && prev !== "\\") {
      inSingleQuote = !inSingleQuote;
    } else if (ch === '"' && !inSingleQuote && !inTemplate && prev !== "\\") {
      inDoubleQuote = !inDoubleQuote;
    } else if (
      ch === "`" &&
      !inSingleQuote &&
      !inDoubleQuote &&
      prev !== "\\"
    ) {
      inTemplate = !inTemplate;
    } else if (!inSingleQuote && !inDoubleQuote && !inTemplate) {
      if (ch === "[") depth++;
      else if (ch === "]") {
        depth--;
        if (depth === 0) {
          endIdx = i;
          break;
        }
      }
    }
  }

  if (endIdx === -1) {
    return new Error("Unmatched brackets — make sure the array is complete.");
  }

  const rawArraySource = arrayText.slice(startIdx, endIdx + 1);

  // Step 4: Evaluate the array in a sandboxed way using Function constructor.
  // This supports JS object syntax (unquoted keys, trailing commas, etc.)
  let rawArray: unknown;
  try {
    // eslint-disable-next-line no-new-func
    rawArray = new Function(`"use strict"; return (${rawArraySource});`)();
  } catch (e) {
    return new Error(
      `Could not evaluate array: ${e instanceof Error ? e.message : String(e)}`,
    );
  }

  if (!Array.isArray(rawArray) || rawArray.length === 0) {
    return new Error("The array is empty or not a valid array of objects.");
  }

  // Step 4: Normalize field aliases and validate each card.
  // Supported aliases:
  //   front: q, question, prompt, term, word
  //   back:  a, answer, definition, meaning
  //   trap:  tip, note, warning, neetTrap, neet_trap
  //   hook:  hint, mnemonic, ncertHook, ncert_hook, memory
  const FRONT_ALIASES = ["front", "q", "question", "prompt", "term", "word"];
  const BACK_ALIASES = ["back", "a", "answer", "definition", "meaning"];
  const TRAP_ALIASES = [
    "trap",
    "tip",
    "note",
    "warning",
    "neetTrap",
    "neet_trap",
  ];
  const HOOK_ALIASES = [
    "hook",
    "hint",
    "mnemonic",
    "ncertHook",
    "ncert_hook",
    "memory",
  ];

  function pickField(c: Record<string, unknown>, aliases: string[]): unknown {
    for (const key of aliases) {
      if (key in c) return c[key];
    }
    return undefined;
  }

  for (const item of rawArray) {
    if (!item || typeof item !== "object") {
      return new Error(
        "Each card must be an object with at least front/q and back/a fields.",
      );
    }
    const c = item as Record<string, unknown>;
    const frontVal = pickField(c, FRONT_ALIASES);
    if (typeof frontVal !== "string" || !frontVal.trim()) {
      return new Error(
        'Each card must have a non-empty "front" (or "q" / "question") string field.',
      );
    }
    const backVal = pickField(c, BACK_ALIASES);
    if (typeof backVal !== "string" || !backVal.trim()) {
      return new Error(
        'Each card must have a non-empty "back" (or "a" / "answer") string field.',
      );
    }
  }

  // Step 5: Map to ParsedCard (using aliases for all fields)
  const cards: ParsedCard[] = (rawArray as Record<string, unknown>[]).map(
    (c, idx) => {
      const front = pickField(c, FRONT_ALIASES) as string;
      const back = pickField(c, BACK_ALIASES) as string;
      const trapVal = pickField(c, TRAP_ALIASES);
      const hookVal = pickField(c, HOOK_ALIASES);
      return {
        id: typeof c.id === "number" ? c.id : idx + 1,
        cardType:
          typeof c.cardType === "string"
            ? c.cardType
            : typeof c.type === "string"
              ? c.type
              : typeof c.category === "string"
                ? c.category
                : "General",
        title: typeof c.title === "string" ? c.title : "",
        front,
        back,
        trap:
          typeof trapVal === "string" && trapVal.trim() ? trapVal : undefined,
        hook:
          typeof hookVal === "string" && hookVal.trim() ? hookVal : undefined,
      };
    },
  );

  return {
    id: crypto.randomUUID(),
    name: deckName,
    description: "",
    cards,
  };
}

// ── Auto-detect Parser ────────────────────────────────────────
//
// Tries JSON first; if that fails, falls back to JS code parsing.

export function parseAnyDeck(content: string): ParsedDeck | Error {
  const trimmed = content.trim();

  // Looks like JSON if it starts with { or [
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    const jsonResult = parseJSONDeck(trimmed);
    if (!(jsonResult instanceof Error)) return jsonResult;
    // Might still be a JS array literal — fall through
  }

  return parseCodeDeck(trimmed);
}

// ── CSV Parser ───────────────────────────────────────────────

/**
 * Parses a CSV file.
 * Expected header: id,cardType,title,front,back,trap,hook
 * `trap` and `hook` columns are optional.
 */
export function parseCSVDeck(
  content: string,
  deckName: string,
): ParsedDeck | Error {
  const lines = content.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) {
    return new Error("CSV must have a header row and at least one card row.");
  }

  const headerLine = lines[0];
  const headers = parseCSVLine(headerLine).map((h) => h.toLowerCase().trim());

  const frontIdx =
    ["front", "q", "question", "prompt", "term", "word"]
      .map((k) => headers.indexOf(k))
      .find((i) => i !== -1) ?? -1;
  const backIdx =
    ["back", "a", "answer", "definition", "meaning"]
      .map((k) => headers.indexOf(k))
      .find((i) => i !== -1) ?? -1;

  if (frontIdx === -1 || backIdx === -1) {
    return new Error('CSV must have "front"/"q" and "back"/"a" columns.');
  }

  const idIdx = headers.indexOf("id");
  const cardTypeIdx = headers.indexOf("cardtype");
  const titleIdx = headers.indexOf("title");
  const trapIdx = headers.indexOf("trap");
  const hookIdx = headers.indexOf("hook");

  const cards: ParsedCard[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    const front = (cols[frontIdx] ?? "").trim();
    const back = (cols[backIdx] ?? "").trim();
    if (!front || !back) continue; // skip empty rows

    const trap = trapIdx !== -1 ? (cols[trapIdx] ?? "").trim() : undefined;
    const hook = hookIdx !== -1 ? (cols[hookIdx] ?? "").trim() : undefined;

    cards.push({
      id: idIdx !== -1 ? Number(cols[idIdx]) || i : i,
      cardType:
        cardTypeIdx !== -1
          ? (cols[cardTypeIdx] ?? "General").trim()
          : "General",
      title: titleIdx !== -1 ? (cols[titleIdx] ?? "").trim() : "",
      front,
      back,
      trap: trap || undefined,
      hook: hook || undefined,
    });
  }

  if (cards.length === 0) {
    return new Error("No valid cards found in CSV.");
  }

  return {
    id: crypto.randomUUID(),
    name: deckName.trim() || "Imported Deck",
    description: "",
    cards,
  };
}

/** Simple CSV line parser supporting quoted fields */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

// ── Backend Card Conversion ──────────────────────────────────

export function parsedCardToBackendCard(card: ParsedCard): Card {
  return {
    id: BigInt(card.id),
    cardType: card.cardType,
    title: card.title,
    front: card.front,
    back: card.back,
    trap: card.trap,
    hook: card.hook,
  };
}
