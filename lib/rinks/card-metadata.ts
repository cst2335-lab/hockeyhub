export type RinkDataSource = 'official' | 'imported' | 'community' | 'unknown';
export type RinkImageLayer = 'manual' | 'auto' | 'fallback';

type RinkLike = {
  name?: string | null;
  source?: string | null;
  data_source?: string | null;
  image_url?: string | null;
  image_verified?: boolean | null;
};

const DEFAULT_IMAGE = '/img/rinks/placeholder.svg';
const AUTO_IMAGE_BY_SOURCE: Record<Exclude<RinkDataSource, 'unknown'>, string> = {
  official: '/img/rinks/official.svg',
  imported: '/img/rinks/imported.svg',
  community: '/img/rinks/community.svg',
};

function normalizeSource(value?: string | null): string {
  return String(value ?? '')
    .trim()
    .toLowerCase();
}

function isWebUrl(value?: string | null): boolean {
  if (!value) return false;
  return /^https?:\/\/.+/i.test(value.trim());
}

export function inferRinkDataSource(rink: Pick<RinkLike, 'source' | 'data_source'>): RinkDataSource {
  const dataSource = normalizeSource(rink.data_source);
  if (dataSource === 'official' || dataSource === 'imported' || dataSource === 'community') {
    return dataSource;
  }

  const source = normalizeSource(rink.source);
  if (source === 'ottawa_sync' || source === 'official') return 'official';
  if (source === 'imported') return 'imported';
  if (source === 'manager_updated' || source === 'community') return 'community';
  return 'unknown';
}

function scoreAutoImageConfidence(source: RinkDataSource, hasExternalImageUrl: boolean): number {
  const base =
    source === 'official' ? 0.78 :
    source === 'imported' ? 0.72 :
    source === 'community' ? 0.66 :
    0.55;
  const withUrlBoost = hasExternalImageUrl ? base + 0.1 : base;
  return Math.min(0.95, withUrlBoost);
}

export function resolveRinkCardImage(rink: RinkLike): {
  src: string;
  fallbackSrc: string;
  layer: RinkImageLayer;
  confidence: number;
  source: RinkDataSource;
} {
  const source = inferRinkDataSource(rink);
  const externalImageUrl = isWebUrl(rink.image_url) ? String(rink.image_url) : null;

  // Manual layer: explicitly verified by admin.
  if (rink.image_verified && externalImageUrl) {
    return {
      src: externalImageUrl,
      fallbackSrc: DEFAULT_IMAGE,
      layer: 'manual',
      confidence: 1,
      source,
    };
  }

  const confidence = scoreAutoImageConfidence(source, !!externalImageUrl);

  // Auto layer with confidence gate.
  if (confidence >= 0.7) {
    return {
      src:
        externalImageUrl ||
        (source !== 'unknown' ? AUTO_IMAGE_BY_SOURCE[source] : DEFAULT_IMAGE),
      fallbackSrc: DEFAULT_IMAGE,
      layer: 'auto',
      confidence,
      source,
    };
  }

  // Fallback layer for low-confidence image guesses.
  return {
    src: DEFAULT_IMAGE,
    fallbackSrc: DEFAULT_IMAGE,
    layer: 'fallback',
    confidence,
    source,
  };
}

