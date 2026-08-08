import { describe, expect, it, vi } from 'vitest';
import {
  UNICODE_REPLACEMENT,
  collectRinkEncodingWarnings,
  foldForSearch,
  hasEncodingCorruption,
  repairRinkText,
  rinkTextMatchesQuery,
} from '@/lib/rinks/text-encoding';

describe('rink text encoding', () => {
  it('detects U+FFFD replacement character', () => {
    expect(hasEncodingCorruption(`Ar${UNICODE_REPLACEMENT}na Campeau`)).toBe(true);
    expect(hasEncodingCorruption('Aréna Campeau')).toBe(false);
    expect(hasEncodingCorruption('Bernard Grandmaître Arena')).toBe(false);
  });

  it('repairs Ar�na Campeau => Aréna Campeau', () => {
    const { text, repaired, stillCorrupt } = repairRinkText(
      `Ar${UNICODE_REPLACEMENT}na Campeau`
    );
    expect(text).toBe('Aréna Campeau');
    expect(repaired).toBe(true);
    expect(stillCorrupt).toBe(false);
  });

  it('repairs Aréna family names and Grandmaître', () => {
    expect(repairRinkText(`Ar${UNICODE_REPLACEMENT}na Baribeau`).text).toBe('Aréna Baribeau');
    expect(repairRinkText(`Bernard Grandma${UNICODE_REPLACEMENT}tre Arena`).text).toBe(
      'Bernard Grandmaître Arena'
    );
  });

  it('repairs verified outdoor address fragments', () => {
    expect(repairRinkText(`6250 beaus${UNICODE_REPLACEMENT}jour dr.`).text).toBe(
      '6250 beauséjour dr.'
    );
    expect(repairRinkText(`625 la v${UNICODE_REPLACEMENT}rendrye dr.`).text).toBe(
      '625 la vérendrye dr.'
    );
    expect(repairRinkText(`2955 mich${UNICODE_REPLACEMENT}le dr.`).text).toBe('2955 michèle dr.');
    expect(repairRinkText(`43 ste-c${UNICODE_REPLACEMENT}cile st.`).text).toBe(
      '43 ste-cécile st.'
    );
    expect(repairRinkText(`1705 orl${UNICODE_REPLACEMENT}ans blvd.`).text).toBe(
      '1705 orléans blvd.'
    );
    expect(repairRinkText(`${UNICODE_REPLACEMENT}merillon ridge`).text).toBe('émerillon ridge');
    expect(repairRinkText(`300 des p${UNICODE_REPLACEMENT}res-blancs ave.`).text).toBe(
      '300 des pères-blancs ave.'
    );
  });

  it('repairs classic Ã© mojibake without inventing unrelated text', () => {
    expect(repairRinkText('ArÃ©na Campeau').text).toBe('Aréna Campeau');
    expect(repairRinkText('Unknown Rink Name').text).toBe('Unknown Rink Name');
  });

  it('does not leave U+FFFD in representative repaired rink data', () => {
    const samples = [
      `Ar${UNICODE_REPLACEMENT}na Campeau`,
      `Bernard Grandma${UNICODE_REPLACEMENT}tre Arena`,
      `Ar${UNICODE_REPLACEMENT}na Jean-Paul-Sabourin`,
    ];
    for (const s of samples) {
      const { text, stillCorrupt } = repairRinkText(s);
      expect(text.includes(UNICODE_REPLACEMENT)).toBe(false);
      expect(stillCorrupt).toBe(false);
    }
  });

  it('foldForSearch lets arena match Aréna', () => {
    expect(foldForSearch('Aréna Campeau')).toContain('arena');
    expect(rinkTextMatchesQuery(['Aréna Campeau', 'Ottawa'], 'arena')).toBe(true);
    expect(rinkTextMatchesQuery(['Aréna Campeau'], 'aréna')).toBe(true);
    expect(rinkTextMatchesQuery(['Aréna Campeau'], 'campeau')).toBe(true);
  });

  it('collectRinkEncodingWarnings logs for corrupt import rows', () => {
    const log = vi.fn();
    const n = collectRinkEncodingWarnings(
      { id: '1', name: `Ar${UNICODE_REPLACEMENT}na Campeau`, address: 'ok' },
      log
    );
    expect(n).toBe(1);
    expect(log).toHaveBeenCalled();
  });
});
