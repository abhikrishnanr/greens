import * as React from 'react'
import { cn } from '@/lib/utils'

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'value' | 'onChange'> {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
  className?: string
}

export const Select = ({ value, onValueChange, children, className, ...props }: SelectProps) => {
  const placeholderRef = React.useRef<string>('')
  const options: Array<{ value: string; label: React.ReactNode; props: React.OptionHTMLAttributes<HTMLOptionElement> }> = []

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return
    if (child.type === SelectTrigger) {
      React.Children.forEach(child.props.children, (c) => {
        if (React.isValidElement(c) && c.type === SelectValue) {
          placeholderRef.current = c.props.placeholder || ''
        }
      })
    }
    if (child.type === SelectContent) {
      React.Children.forEach(child.props.children, (c) => {
        if (React.isValidElement(c) && c.type === SelectItem) {
          const { value, children: lbl, ...rest } = c.props as SelectItemProps
          options.push({ value, label: lbl, props: rest })
        }
      })
    }
  })

  return (
    <select
      className={cn('h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500', className)}
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      {...props}
    >
      {placeholderRef.current && (
        <option value="" disabled hidden>
          {placeholderRef.current}
        </option>
      )}
      {options.map((o) => (
        <option key={o.value} value={o.value} {...o.props}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

export const SelectTrigger = ({ children }: { children: React.ReactNode }) => <>{children}</>
export const SelectValue = ({ placeholder }: { placeholder?: string }) => null
export const SelectContent = ({ children }: { children: React.ReactNode }) => <>{children}</>
export interface SelectItemProps extends React.OptionHTMLAttributes<HTMLOptionElement> {
  value: string
  children: React.ReactNode
}
export const SelectItem = ({ value, children, ...props }: SelectItemProps) => (
  <option value={value} {...props}>{children}</option>
)

