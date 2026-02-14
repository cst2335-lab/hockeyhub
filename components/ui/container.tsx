'use client';

import { clsx } from 'clsx';

/**
 * Salient-style layout container: max-w-7xl, consistent horizontal padding.
 * Use for navbar, hero, sections, footer — layout/格局 only; colors unchanged.
 */
export function Container({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      className={clsx('mx-auto max-w-7xl px-4 sm:px-6 lg:px-8', className)}
      {...props}
    />
  );
}
