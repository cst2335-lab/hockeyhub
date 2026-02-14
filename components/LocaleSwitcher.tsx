'use client';

import {usePathname, useRouter, useSearchParams} from 'next/navigation';
import {Globe} from 'lucide-react';
import {locales as SUPPORTED_LIST} from '@/i18n';

const SUPPORTED = new Set(SUPPORTED_LIST as readonly string[]);
const DEFAULT_LOCALE = 'en';

function buildPathWithLocale(pathname: string, newLocale: string): string {
  const path = pathname || '/';
  const segs = path.split('/'); // 保留空段，从而 se gs[1] 是第一层
  const first = segs[1] ?? '';

  if (SUPPORTED.has(first as any)) {
    segs[1] = newLocale;            // /en/... -> /fr/...
  } else {
    segs.splice(1, 0, newLocale);   // /about -> /fr/about
  }
  const joined = segs.join('/').replace(/\/{2,}/g, '/');
  return joined.endsWith('/') && joined !== '/' ? joined.slice(0, -1) : joined;
}

export default function LocaleSwitcher() {
  const pathname = usePathname();
  const search = useSearchParams();
  const router = useRouter();

  const currentLocale = (() => {
    const first = pathname?.split('/').filter(Boolean)[0];
    return (first && SUPPORTED.has(first as any)) ? (first as string) : DEFAULT_LOCALE;
  })();

  const switchLocale = (newLocale: string) => {
    if (!pathname || newLocale === currentLocale) return;
    const base = buildPathWithLocale(pathname, newLocale);
    const qs = search?.toString();
    const url = qs ? `${base}?${qs}` : base;
    router.push(url); // 或 replace(url) 也可以
  };

  return (
    <div
      className="inline-flex items-center rounded-full border border-border bg-card px-1 py-1"
      role="group"
      aria-label="Locale switcher"
    >
      <Globe className="h-4 w-4 mx-2 text-muted-foreground" aria-hidden />
      {SUPPORTED_LIST.map(code => {
        const active = code === currentLocale;
        return (
          <button
            key={code}
            onClick={() => switchLocale(code)}
            className={[
              'h-8 min-w-10 px-3 rounded-full text-sm font-medium transition',
              active
                ? 'bg-gogo-primary text-white shadow'
                : 'text-foreground hover:bg-muted'
            ].join(' ')}
            aria-pressed={active}
            aria-current={active ? 'true' : undefined}
            type="button"
          >
            {code.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
