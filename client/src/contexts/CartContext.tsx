import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  size?: string;
  color?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id' | 'quantity'> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount and when user changes
  useEffect(() => {
    const storageKey = user ? `cart_${user.uid}` : 'cart_guest';
    const savedCart = localStorage.getItem(storageKey);
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    }
  }, [user]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    const storageKey = user ? `cart_${user.uid}` : 'cart_guest';
    localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items, user]);

  const addItem = (item: Omit<CartItem, 'id' | 'quantity'> & { quantity?: number }) => {
    setItems((currentItems) => {
      // Check if item already exists (same product, size, color)
      const existingIndex = currentItems.findIndex(
        (i) =>
          i.productId === item.productId &&
          i.size === item.size &&
          i.color === item.color
      );

      if (existingIndex > -1) {
        // Update quantity
        const updated = [...currentItems];
        updated[existingIndex].quantity += item.quantity || 1;
        return updated;
      } else {
        // Add new item
        return [
          ...currentItems,
          {
            ...item,
            id: `${item.productId}_${item.size || ''}_${item.color || ''}_${Date.now()}`,
            quantity: item.quantity || 1
          }
        ];
      }
    });
  };

  const removeItem = (id: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
    } else {
      setItems((currentItems) =>
        currentItems.map((item) =>
          item.id === id ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = () => {
    setItems([]);
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const value = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    total,
    itemCount
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
