import * as React from 'react'
import { cn } from '@/lib/utils'

export interface MultiSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: string[]
  value: string[]
  onValueChange?: (value: string[]) => void
  className?: string
}

export const MultiSelect = React.forwardRef<HTMLSelectElement, MultiSelectProps>(
  ({ options, value, onValueChange, className, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selected = Array.from(e.target.selectedOptions).map((o) => o.value)
      onValueChange?.(selected)
    }
    return (
      <select
        multiple
        ref={ref}
        value={value}
        onChange={handleChange}
        className={cn(
          'h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500',
          className,
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    )
  },
)
MultiSelect.displayName = 'MultiSelect'

export default MultiSelect
