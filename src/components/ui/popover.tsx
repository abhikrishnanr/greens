import * as React from 'react'
import { cn } from '@/lib/utils'

const PopoverContext = React.createContext<{open:boolean; setOpen:(o:boolean)=>void} | null>(null)

export function Popover({children}: {children: React.ReactNode}) {
  const [open, setOpen] = React.useState(false)
  return <PopoverContext.Provider value={{open, setOpen}}>{children}</PopoverContext.Provider>
}

export function PopoverTrigger({className, children}: React.HTMLAttributes<HTMLButtonElement>) {
  const ctx = React.useContext(PopoverContext)
  if(!ctx) return null
  return <button className={className} onClick={() => ctx.setOpen(!ctx.open)}>{children}</button>
}

interface ContentProps extends React.HTMLAttributes<HTMLDivElement> { align?: string }
export function PopoverContent({className, children, ...props}: ContentProps) {
  const ctx = React.useContext(PopoverContext)
  if(!ctx?.open) return null
  return (
    <div className={cn('absolute z-50 mt-2 rounded border bg-white shadow p-2', className)} {...props}>
      {children}
    </div>
  )
}
