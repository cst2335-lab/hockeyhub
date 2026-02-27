import { describe, expect, it } from 'vitest';
import {
  inferRinkDataSource,
  resolveRinkCardImage,
} from '@/lib/rinks/card-metadata';

describe('inferRinkDataSource', () => {
  it('prefers explicit data_source values', () => {
    expect(inferRinkDataSource({ data_source: 'official', source: 'community' })).toBe('official');
    expect(inferRinkDataSource({ data_source: 'imported' })).toBe('imported');
    expect(inferRinkDataSource({ data_source: 'community' })).toBe('community');
  });

  it('falls back to source aliases', () => {
    expect(inferRinkDataSource({ source: 'ottawa_sync' })).toBe('official');
    expect(inferRinkDataSource({ source: 'manager_updated' })).toBe('community');
  });

  it('returns unknown when source is unmapped', () => {
    expect(inferRinkDataSource({ source: 'custom' })).toBe('unknown');
  });
});

describe('resolveRinkCardImage', () => {
  it('uses manual layer for verified external image', () => {
    const image = resolveRinkCardImage({
      image_url: 'https://example.com/rink.jpg',
      image_verified: true,
      source: 'ottawa_sync',
    });
    expect(image.layer).toBe('manual');
    expect(image.confidence).toBe(1);
    expect(image.src).toBe('https://example.com/rink.jpg');
  });

  it('uses auto layer when confidence passes threshold', () => {
    const image = resolveRinkCardImage({
      source: 'ottawa_sync',
    });
    expect(image.layer).toBe('auto');
    expect(image.src).toBe('/img/rinks/official.svg');
    expect(image.confidence).toBeGreaterThanOrEqual(0.7);
  });

  it('uses fallback layer for low confidence sources', () => {
    const image = resolveRinkCardImage({
      source: 'unknown_source',
    });
    expect(image.layer).toBe('fallback');
    expect(image.src).toBe('/img/rinks/placeholder.svg');
  });
});

