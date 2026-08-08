/**
 * Rink text encoding helpers.
 *
 * Historical CSV/SQL imports lost non-ASCII bytes and stored U+FFFD (�).
 * We repair only verified Ottawa/Gatineau French patterns — never invent names.
 */

export const UNICODE_REPLACEMENT = '\uFFFD';

/** True when text contains U+FFFD or classic UTF-8/Windows-1252 mojibake markers. */
export function hasEncodingCorruption(value: string | null | undefined): boolean {
  if (!value) return false;
  if (value.includes(UNICODE_REPLACEMENT)) return true;
  // Common double-encoded UTF-8 as Latin-1 artifacts (e.g. Ã© for é)
  if (/Ã[\u0080-\u00ff]|Â[\u0080-\u00ff]/.test(value)) return true;
  return false;
}

/**
 * Verified repairs for Ottawa-area rink/address text that already contains U+FFFD.
 * Order matters: longer / more specific fragments first.
 */
const VERIFIED_FFFD_REPAIRS: Array<[RegExp, string]> = [
  [/Ar\uFFFDna/g, 'Aréna'],
  [/Grandma\uFFFDtre/g, 'Grandmaître'],
  [/beaus\uFFFDjour/gi, 'beauséjour'],
  [/v\uFFFDrendrye/gi, 'vérendrye'],
  [/mich\uFFFDle/gi, 'michèle'],
  [/c\uFFFDcile/gi, 'cécile'],
  [/orl\uFFFDans/gi, 'orléans'],
  [/\uFFFDmerillon/gi, 'émerillon'],
  [/p\uFFFDres-blancs/gi, 'pères-blancs'],
];

/**
 * Classic mojibake sequences (UTF-8 bytes read as Latin-1) seen in French place names.
 * Applied only when present; does not touch already-correct accented text.
 */
const VERIFIED_MOJIBAKE_REPAIRS: Array<[RegExp, string]> = [
  [/ArÃ©na/g, 'Aréna'],
  [/GrandmaÃ®tre/g, 'Grandmaître'],
  [/beausÃ©jour/gi, 'beauséjour'],
  [/vÃ©rendrye/gi, 'vérendrye'],
  [/michÃ¨le/gi, 'michèle'],
  [/cÃ©cile/gi, 'cécile'],
  [/orlÃ©ans/gi, 'orléans'],
  [/Ã©merillon/gi, 'émerillon'],
  [/pÃ¨res-blancs/gi, 'pères-blancs'],
  [/OrlÃ©ans/g, 'Orléans'],
  [/CÃ´tÃ©/g, 'Côté'],
  [/FranÃ§ois/g, 'François'],
];

/**
 * Repair known corrupted rink name/address fragments.
 * Leaves text unchanged when no verified pattern matches.
 * Returns `{ text, repaired, stillCorrupt }` for import warnings.
 */
export function repairRinkText(input: string | null | undefined): {
  text: string;
  repaired: boolean;
  stillCorrupt: boolean;
} {
  if (input == null) return { text: '', repaired: false, stillCorrupt: false };
  let text = String(input);
  const before = text;

  for (const [re, replacement] of VERIFIED_FFFD_REPAIRS) {
    text = text.replace(re, replacement);
  }
  for (const [re, replacement] of VERIFIED_MOJIBAKE_REPAIRS) {
    text = text.replace(re, replacement);
  }

  return {
    text,
    repaired: text !== before,
    stillCorrupt: hasEncodingCorruption(text),
  };
}

/** Fold accents for search so "arena" matches "Aréna". */
export function foldForSearch(value: string | null | undefined): string {
  if (!value) return '';
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function rinkTextMatchesQuery(
  fields: Array<string | null | undefined>,
  query: string
): boolean {
  const q = foldForSearch(query).trim();
  if (!q) return true;
  return fields.some((f) => foldForSearch(f).includes(q));
}

/**
 * Dev/import: log warnings for corrupted fields (never shown to end users).
 */
export function collectRinkEncodingWarnings(
  row: { id?: string; name?: string; address?: string },
  log: (msg: string) => void = console.warn
): number {
  let n = 0;
  for (const key of ['name', 'address'] as const) {
    const raw = row[key];
    if (!raw || !hasEncodingCorruption(raw)) continue;
    const { text, repaired, stillCorrupt } = repairRinkText(raw);
    n += 1;
    if (stillCorrupt) {
      log(
        `[rink-encoding] unresolved corruption in ${key} id=${row.id ?? '?'} sample=${JSON.stringify(raw.slice(0, 80))}`
      );
    } else if (repaired) {
      log(
        `[rink-encoding] repaired ${key} id=${row.id ?? '?'} -> ${JSON.stringify(text.slice(0, 80))}`
      );
    }
  }
  return n;
}
