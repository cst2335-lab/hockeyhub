'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

type LogoProps = {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  light?: boolean;
  className?: string;
};

const SIZES = { sm: 40, md: 48, lg: 96 } as const;

/** Logo: /img/logo/icon.svg per public/img/SPEC.md */
export function Logo({ size = 'md', showText = true, light = false, className }: LogoProps) {
  const d = SIZES[size];

  return (
    <div
      className={cn(
        'inline-flex items-center gap-3',
        size === 'lg' && 'flex-col gap-6',
        className
      )}
    >
      <div
        className={cn(
          'relative shrink-0 transition-transform duration-200 hover:-translate-y-0.5',
          size === 'sm' && 'drop-shadow-md',
          size === 'md' && 'drop-shadow-lg',
          size === 'lg' && 'drop-shadow-xl'
        )}
      >
        <Image
          src="/img/logo/icon.svg"
          alt="GoGoHockey"
          width={d}
          height={d}
          className="object-contain"
          unoptimized
        />
      </div>
      {showText && (
        <span
          className={cn(
            'font-extrabold tracking-tight',
            light ? 'text-white drop-shadow-md' : 'bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-sky-600 dark:from-sky-100 dark:to-sky-300',
            size === 'sm' && 'text-lg',
            size === 'md' && 'text-2xl',
            size === 'lg' && 'text-5xl sm:text-6xl md:text-7xl'
          )}
        >
          GoGoHockey
        </span>
      )}
    </div>
  );
}
