'use client';

import { useEffect, useState } from 'react';

type Props = {
  src: string;
  fallbackSrc: string;
  alt: string;
  className?: string;
};

export default function RinkCardImage({ src, fallbackSrc, alt, className }: Props) {
  const [resolvedSrc, setResolvedSrc] = useState(src || fallbackSrc);

  useEffect(() => {
    setResolvedSrc(src || fallbackSrc);
  }, [src, fallbackSrc]);

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      loading="lazy"
      className={className}
      onError={() => {
        if (resolvedSrc !== fallbackSrc) {
          setResolvedSrc(fallbackSrc);
        }
      }}
    />
  );
}

