import * as React from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary'
}

export const Badge = ({ className, variant = 'default', ...props }: BadgeProps) => {
  const variants = {
    default: 'bg-blue-600 text-white',
    secondary: 'bg-gray-200 text-gray-800',
  }
  return <span className={cn('inline-flex items-center rounded px-2 py-0.5 text-sm font-medium', variants[variant], className)} {...props} />
}

export default Badge
