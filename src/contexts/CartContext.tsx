import React, {createContext, useContext, useState, ReactNode} from 'react'

export interface CartItem {
  id: string
  name: string
  price: number
  desc?: string
}

interface CartContextValue {
  items: CartItem[]
  add: (item: CartItem) => void
  remove: (id: string) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

export function CartProvider({children}:{children: ReactNode}) {
  const [items, setItems] = useState<CartItem[]>([])

  function add(item: CartItem) {
    setItems(curr => curr.some(i => i.id === item.id) ? curr : [...curr, item])
  }
  function remove(id: string) {
    setItems(curr => curr.filter(i => i.id !== id))
  }
  function clear() {
    setItems([])
  }

  return (
    <CartContext.Provider value={{items, add, remove, clear}}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if(!ctx) throw new Error('useCart must be inside CartProvider')
  return ctx
}
