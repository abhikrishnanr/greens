import * as React from 'react'
import { cn } from '@/lib/utils'

export const Command = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col', className)} {...props} />
)

export const CommandInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input className="mb-2 w-full border px-2 py-1" {...props} />
)

export const CommandList = ({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
  <ul className={cn('max-h-60 overflow-auto', className)} {...props} />
)

export const CommandEmpty = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('p-2 text-sm text-gray-500', className)} {...props} />
)

export const CommandGroup = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('p-1', className)} {...props} />
)

export const CommandItem = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('cursor-pointer px-2 py-1 hover:bg-gray-100', className)} {...props} />
)

export const CommandSeparator = ({ className, ...props }: React.HTMLAttributes<HTMLHRElement>) => (
  <hr className={cn('my-1', className)} {...props} />
)
