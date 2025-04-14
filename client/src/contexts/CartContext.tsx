import { createContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

// Define cart item type
export interface CartItem {
  id: number;
  quantity: number;
  name?: string;
  price?: number;
  imageUrl?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  removeFromCart: (itemId: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
}

export const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();
  const [location, navigate] = useLocation();

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart from localStorage", e);
        localStorage.removeItem('cart');
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Add item to cart - requires auth
  const addToCart = useCallback((item: CartItem) => {
    // Check if user is logged in
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to add items to your cart",
        variant: "destructive"
      });
      navigate("/login");
      return;
    }

    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(cartItem => cartItem.id === item.id);
      
      if (existingItemIndex >= 0) {
        // Item exists, increment quantity
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          quantity: updatedCart[existingItemIndex].quantity + (item.quantity || 1)
        };
        return updatedCart;
      } else {
        // Item does not exist, add it
        return [...prevCart, { ...item, quantity: item.quantity || 1 }];
      }
    });

    toast({
      title: "Added to cart",
      description: `${item.name || "Item"} has been added to your cart`,
    });
  }, [user, toast, navigate]);

  // Update item quantity
  const updateQuantity = useCallback((itemId: number, quantity: number) => {
    if (quantity < 1) return;
    
    setCart(prevCart => 
      prevCart.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  }, []);

  // Remove item from cart
  const removeFromCart = useCallback((itemId: number) => {
    setCart(prevCart => {
      const updatedCart = prevCart.filter(item => item.id !== itemId);
      
      // If cart becomes empty after removing item, explicitly remove from localStorage
      if (updatedCart.length === 0) {
        localStorage.removeItem('cart');
      } else {
        localStorage.setItem('cart', JSON.stringify(updatedCart));
      }
      
      // Dispatch custom event to notify other components about cart changes
      const cartUpdateEvent = new CustomEvent('cartUpdated');
      window.dispatchEvent(cartUpdateEvent);
      
      return updatedCart;
    });
    
    toast({
      title: "Item removed",
      description: "The item has been removed from your cart",
    });
  }, [toast]);

  // Clear cart
  const placeOrder = useCallback(async () => {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items: cart,
          totalAmount: getSubtotal()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to place order');
      }

      // Clear cart after successful order
      setCart([]);
      localStorage.removeItem('cart');
      
      toast({
        title: "Order placed successfully",
        description: "Your order has been placed and is being processed",
      });

      return true;
    } catch (error) {
      toast({
        title: "Error placing order",
        description: "There was a problem placing your order. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  }, [cart, getSubtotal, toast]);

  const clearCart = useCallback(() => {
    setCart([]);
    localStorage.removeItem('cart');
    
    const cartUpdateEvent = new CustomEvent('cartUpdated');
    window.dispatchEvent(cartUpdateEvent);
    
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart",
    });
  }, [toast]);

  // Get total number of items in cart
  const getTotalItems = useCallback(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  // Calculate subtotal if prices are available
  const getSubtotal = useCallback(() => {
    return cart.reduce((total, item) => {
      return total + ((item.price || 0) * item.quantity);
    }, 0);
  }, [cart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getTotalItems,
        getSubtotal,
        placeOrder
      }}
    >
      {children}
    </CartContext.Provider>
  );
}