'use client';

import Image, { type ImageProps } from 'next/image';
import { cn } from '@/lib/utils';

/**
 * 封装 next/image，用于优化图片加载（lazy、WebP、响应式）
 * 适用于用户头像、冰场照片、俱乐部 Logo 等
 */
export function OptimizedImage({
  className,
  priority = false,
  alt = '',
  ...props
}: ImageProps) {
  return (
    <Image
      className={cn('object-cover', className)}
      loading={priority ? 'eager' : 'lazy'}
      quality={85}
      alt={alt}
      {...props}
    />
  );
}
