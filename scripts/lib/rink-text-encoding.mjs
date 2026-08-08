/**
 * Plain ESM copy of rink text repairs for Node import scripts (no TS loader).
 * Keep in sync with lib/rinks/text-encoding.ts
 */

export const UNICODE_REPLACEMENT = '\uFFFD';

export function hasEncodingCorruption(value) {
  if (!value) return false;
  if (String(value).includes(UNICODE_REPLACEMENT)) return true;
  if (/Ã[\u0080-\u00ff]|Â[\u0080-\u00ff]/.test(String(value))) return true;
  return false;
}

const VERIFIED_FFFD_REPAIRS = [
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

const VERIFIED_MOJIBAKE_REPAIRS = [
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

export function repairRinkText(input) {
  if (input == null) return { text: '', repaired: false, stillCorrupt: false };
  let text = String(input);
  const before = text;
  for (const [re, replacement] of VERIFIED_FFFD_REPAIRS) text = text.replace(re, replacement);
  for (const [re, replacement] of VERIFIED_MOJIBAKE_REPAIRS) text = text.replace(re, replacement);
  return {
    text,
    repaired: text !== before,
    stillCorrupt: hasEncodingCorruption(text),
  };
}

export function collectRinkEncodingWarnings(row, log = console.warn) {
  let n = 0;
  for (const key of ['name', 'address']) {
    const raw = row[key];
    if (!raw || !hasEncodingCorruption(raw)) continue;
    const { text, repaired, stillCorrupt } = repairRinkText(raw);
    n += 1;
    if (stillCorrupt) {
      log(`[rink-encoding] unresolved corruption in ${key} id=${row.id ?? '?'} sample=${JSON.stringify(String(raw).slice(0, 80))}`);
    } else if (repaired) {
      log(`[rink-encoding] repaired ${key} id=${row.id ?? '?'} -> ${JSON.stringify(text.slice(0, 80))}`);
    }
  }
  return n;
}
