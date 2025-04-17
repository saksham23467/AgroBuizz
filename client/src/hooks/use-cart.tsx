import { useContext } from 'react';
import { CartContext, CartItem } from '@/contexts/CartContext';

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export type { CartItem };