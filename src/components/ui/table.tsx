import * as React from 'react'
import { cn } from '@/lib/utils'

export const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(function Table({className, ...props}, ref) {
  return <table ref={ref} className={cn('w-full text-sm', className)} {...props} />
})

export const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(function TableHeader({className, ...props}, ref) {
  return <thead ref={ref} className={cn('bg-gray-50', className)} {...props} />
})

export const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(function TableBody({className, ...props}, ref) {
  return <tbody ref={ref} className={cn('', className)} {...props} />
})

export const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(function TableRow({className, ...props}, ref) {
  return <tr ref={ref} className={cn('border-b', className)} {...props} />
})

export const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(function TableHead({className, ...props}, ref) {
  return <th ref={ref} className={cn('px-3 py-2 text-left font-semibold', className)} {...props} />
})

export const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(function TableCell({className, ...props}, ref) {
  return <td ref={ref} className={cn('px-3 py-2', className)} {...props} />
})

export default Table
