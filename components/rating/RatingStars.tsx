'use client'

import { Star } from 'lucide-react'

interface RatingStarsProps {
  rating: number
  onChange?: (rating: number) => void
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function RatingStars({ rating, onChange, readonly = false, size = 'md' }: RatingStarsProps) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  }

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizes[size]} ${
            star <= rating 
              ? 'fill-yellow-400 text-yellow-400' 
              : 'text-gray-300'
          } ${!readonly && 'cursor-pointer hover:text-yellow-400'}`}
          onClick={() => !readonly && onChange?.(star)}
        />
      ))}
    </div>
  )
}