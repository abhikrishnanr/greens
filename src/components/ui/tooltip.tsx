import * as React from 'react'
import { cn } from '@/lib/utils'

const TooltipContext = React.createContext<boolean>(false)

export const TooltipProvider: React.FC<{children: React.ReactNode}> = ({children}) => <>{children}</>

export const Tooltip = ({children}: {children: React.ReactNode}) => (
  <div className="relative inline-block group">
    <TooltipContext.Provider value={true}>{children}</TooltipContext.Provider>
  </div>
)

export const TooltipTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(function Trigger({className, ...props}, ref){
  return <button ref={ref} className={className} {...props} />
})

export const TooltipContent = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <span className={cn('absolute z-50 m-1 hidden min-w-max rounded bg-black px-2 py-1 text-xs text-white group-hover:block', className)}>
    {children}
  </span>
)
