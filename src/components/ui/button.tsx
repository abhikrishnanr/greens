import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm'
}

const variantClasses = {
  default: 'bg-blue-600 text-white hover:bg-blue-700',
  outline: 'border border-slate-300 hover:bg-slate-100',
  ghost: 'hover:bg-slate-100',
}

const sizeClasses = {
  default: 'h-10 px-4 py-2',
  sm: 'h-8 px-3 text-sm',
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-blue-500',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  )
)
Button.displayName = 'Button'

export { Button }
export default Button
