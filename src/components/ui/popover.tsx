import * as React from 'react'
import { cn } from '@/lib/utils'

interface PopoverContextValue {
  open: boolean
  setOpen: (o: boolean) => void
}

const PopoverContext = React.createContext<PopoverContextValue | null>(null)

interface PopoverProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
}

export function Popover({ children, open: openProp, onOpenChange, className }: PopoverProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const open = openProp ?? uncontrolledOpen
  const setOpen = onOpenChange ?? setUncontrolledOpen

  return (
    <PopoverContext.Provider value={{ open, setOpen }}>
      <div className={cn('relative inline-block', className)}>{children}</div>
    </PopoverContext.Provider>
  )
}

interface TriggerProps extends React.HTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

export function PopoverTrigger({ className, children, asChild, ...props }: TriggerProps) {
  const ctx = React.useContext(PopoverContext)
  if (!ctx) return null
  const triggerProps = {
    className,
    onClick: () => ctx.setOpen(!ctx.open),
    ...props,
  }
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement, triggerProps)
  }
  return <button {...triggerProps}>{children}</button>
}

interface ContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function PopoverContent({ className, children, ...props }: ContentProps) {
  const ctx = React.useContext(PopoverContext)
  if (!ctx?.open) return null
  return (
    <div
      className={cn(
        'absolute left-0 z-50 mt-2 w-max rounded border bg-white shadow p-2',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
