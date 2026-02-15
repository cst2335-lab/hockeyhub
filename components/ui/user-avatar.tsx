'use client';

import * as Avatar from '@radix-ui/react-avatar';
import { cn } from '@/lib/utils';

type UserAvatarProps = {
  src?: string | null;
  name?: string | null;
  email?: string | null;
  size?: 'sm' | 'md' | 'lg';
  /** Use when avatar is on dark background (e.g. nav bar) for better contrast */
  onDark?: boolean;
  className?: string;
};

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-9 w-9 text-sm',
  lg: 'h-12 w-12 text-base',
} as const;

function getInitials(name?: string | null, email?: string | null): string {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0]! + parts[parts.length - 1]![0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  if (email?.trim()) {
    return email[0]!.toUpperCase();
  }
  return '?';
}

/** User avatar with image or initials fallback */
export function UserAvatar({ src, name, email, size = 'md', onDark = false, className }: UserAvatarProps) {
  const initials = getInitials(name, email);
  const sizeClass = sizeClasses[size];
  const fallbackClass = onDark
    ? 'flex h-full w-full items-center justify-center rounded-full bg-white text-gogo-primary font-semibold'
    : 'flex h-full w-full items-center justify-center rounded-full bg-gogo-primary text-white font-semibold';

  return (
    <Avatar.Root
      className={cn(
        'relative inline-flex shrink-0 overflow-hidden rounded-full bg-muted',
        sizeClass,
        className
      )}
    >
      <Avatar.Image
        src={src ?? undefined}
        alt={name ?? undefined}
        className="aspect-square h-full w-full object-cover"
      />
      <Avatar.Fallback className={fallbackClass} delayMs={0}>
        {initials}
      </Avatar.Fallback>
    </Avatar.Root>
  );
}
