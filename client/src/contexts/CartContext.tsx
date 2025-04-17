import {
  createContext,
  ReactNode,
  useState,
  useEffect,
  useCallback,
} from "react";
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

interface Transaction {
  id: number;
  date: string;
  totalAmount: number;
  status: string;
  items: { name?: string; quantity: number; price?: number }[];
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  removeFromCart: (itemId: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
  transactionHistory: Transaction[];
  addTransaction: (tx: Transaction) => void;
}

export const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [transactionHistory, setTransactionHistory] = useState<Transaction[]>(
    []
  );
  const { toast } = useToast();
  const { user } = useAuth();
  const [location, navigate] = useLocation();

  // Load cart and transaction history from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    const savedTransactions = localStorage.getItem("transactionHistory");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart from localStorage", e);
        localStorage.removeItem("cart");
      }
    }
    if (savedTransactions) {
      try {
        setTransactionHistory(JSON.parse(savedTransactions));
      } catch (e) {
        console.error(
          "Failed to parse transaction history from localStorage",
          e
        );
        localStorage.removeItem("transactionHistory");
      }
    }
  }, []);

  // Save cart and transaction history to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(
      "transactionHistory",
      JSON.stringify(transactionHistory)
    );
  }, [transactionHistory]);

  const addToCart = useCallback(
    (item: CartItem) => {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please login to add items to your cart",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      setCart((prevCart) => {
        const existingItemIndex = prevCart.findIndex(
          (cartItem) => cartItem.id === item.id
        );
        if (existingItemIndex >= 0) {
          const updatedCart = [...prevCart];
          updatedCart[existingItemIndex] = {
            ...updatedCart[existingItemIndex],
            quantity:
              updatedCart[existingItemIndex].quantity + (item.quantity || 1),
          };
          return updatedCart;
        } else {
          return [...prevCart, { ...item, quantity: item.quantity || 1 }];
        }
      });

      toast({
        title: "Added to cart",
        description: `${item.name || "Item"} has been added to your cart`,
      });
    },
    [user, toast, navigate]
  );

  const updateQuantity = useCallback((itemId: number, quantity: number) => {
    if (quantity < 1) return;
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  }, []);

  const removeFromCart = useCallback(
    (itemId: number) => {
      setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
      toast({
        title: "Item removed",
        description: "The item has been removed from your cart",
      });
    },
    [toast]
  );

  const clearCart = useCallback(() => {
    setCart([]);
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart",
    });
  }, [toast]);

  const getTotalItems = useCallback(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  const getSubtotal = useCallback(() => {
    return cart.reduce(
      (total, item) => total + (item.price || 0) * item.quantity,
      0
    );
  }, [cart]);

  const addTransaction = useCallback((tx: Transaction) => {
    setTransactionHistory((prev) => [...prev, tx]);
  }, []);

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
        transactionHistory,
        addTransaction,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
