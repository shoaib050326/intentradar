import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getIntentBucket(score: number): string {
  if (score >= 8) return 'high'
  if (score >= 5) return 'medium'
  return 'low'
}

export function getIntentColor(bucket: string): string {
  switch (bucket) {
    case 'high':
      return 'text-green-600 bg-green-50'
    case 'medium':
      return 'text-yellow-600 bg-yellow-50'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
