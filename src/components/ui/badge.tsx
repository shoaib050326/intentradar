import * as React from 'react'
import { cn } from '@/lib/utils'

function Badge({ className, variant = 'default', ...props }: React.HTMLAttributes<HTMLDivElement> & { variant?: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline' }) {
  const variants = {
    default: 'border-transparent bg-blue-600 text-white',
    secondary: 'border-transparent bg-gray-700 text-gray-200',
    success: 'border-transparent bg-green-900/50 text-green-400',
    warning: 'border-transparent bg-yellow-900/50 text-yellow-400',
    destructive: 'border-transparent bg-red-900/50 text-red-400',
    outline: 'border-gray-600 bg-transparent text-gray-300',
  }

  return (
    <div
      className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500', variants[variant], className)}
      {...props}
    />
  )
}

export { Badge }
