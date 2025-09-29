// components/LocaleSwitcher.tsx
'use client';

import {usePathname, useRouter, useSearchParams} from 'next/navigation';

const LOCALES = [
  {code: 'en', label: 'English'},
  {code: 'fr', label: 'Français'}
] as const;

const SUPPORTED = new Set(LOCALES.map(l => l.code));
const DEFAULT_LOCALE = 'en' as const;

/**
 * Replace the first path segment with the new locale.
 * Keeps the rest of the path intact and preserves query params.
 */
function buildPathWithLocale(pathname: string, newLocale: string): string {
  // Normalize input
  const path = pathname || '/';

  // Split into segments, keep empty segments so index is stable:
  // "/en/games" -> ["", "en", "games"]
  const segments = path.split('/');

  // If first segment isn't a supported locale, we treat it as no-locale path.
  // Examples:
  //   "/"              -> ["", ""]
  //   "/about"         -> ["", "about"]
  //   "/en"            -> ["", "en"]
  //   "/fr/rinks"      -> ["", "fr", "rinks"]
  const first = segments[1] ?? '';

  if (SUPPORTED.has(first)) {
    // Replace in-place
    segments[1] = newLocale;
  } else {
    // Insert locale after the leading empty segment
    // "/about" -> "/en/about"
    segments.splice(1, 0, newLocale);
  }

  // Join back. Remove duplicate slashes, but keep leading slash.
  const next = segments.join('/').replace(/\/{2,}/g, '/');

  return next.endsWith('/') && next !== '/' ? next.slice(0, -1) : next;
}

export default function LocaleSwitcher() {
  const pathname = usePathname();
  const search = useSearchParams();
  const router = useRouter();

  // Derive current locale from pathname’s first segment
  const currentLocale = (() => {
    if (!pathname) return DEFAULT_LOCALE;
    const seg = pathname.split('/').filter(Boolean)[0];
    return SUPPORTED.has(seg as any) ? (seg as typeof DEFAULT_LOCALE) : DEFAULT_LOCALE;
  })();

  const switchLocale = (newLocale: string) => {
    if (!pathname) {
      // Fallback if pathname is not yet available
      router.push(`/${newLocale}`);
      return;
    }
    if (newLocale === currentLocale) return;

    const base = buildPathWithLocale(pathname, newLocale);

    // Preserve query string if present
    const qs = search?.toString();
    const url = qs && qs.length ? `${base}?${qs}` : base;

    router.push(url);
  };

  return (
    <div className="inline-flex items-center gap-2" role="group" aria-label="Locale switcher">
      <span aria-hidden>🌐</span>
      {LOCALES.map(({code, label}) => {
        const active = code === currentLocale;
        return (
          <button
            key={code}
            type="button"
            onClick={() => switchLocale(code)}
            className={`text-sm px-2 py-1 rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              active
                ? 'bg-gray-900 text-white border-gray-900 focus:ring-gray-900'
                : 'bg-white hover:bg-gray-100 border-gray-300 focus:ring-gray-300'
            }`}
            aria-pressed={active}
            aria-current={active ? 'true' : undefined}
            aria-label={`Switch language to ${label}`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
