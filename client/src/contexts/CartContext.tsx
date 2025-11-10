import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { apiRequest } from '@/lib/queryClient';

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
  addItem: (item: Omit<CartItem, 'id' | 'quantity'> & { quantity?: number }) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  total: number;
  itemCount: number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}

// Generate or get session ID for guest users
function getSessionId(): string {
  let sessionId = localStorage.getItem('cart_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    localStorage.setItem('cart_session_id', sessionId);
  }
  return sessionId;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch cart from backend when component mounts or user changes
  useEffect(() => {
    const fetchCart = async () => {
      setIsLoading(true);
      try {
        const userId = user?.uid;
        const sessionId = getSessionId();
        
        const params = new URLSearchParams();
        if (userId) {
          params.append('user_id', userId);
        } else {
          params.append('session_id', sessionId);
        }

        const response = await fetch(`/api/cart?${params}`);
        if (response.ok) {
          const backendItems = await response.json();
          
          // Transform backend cart items to frontend format
          const transformedItems: CartItem[] = backendItems.map((item: any) => ({
            id: item.id,
            productId: item.product_id,
            name: item.product?.name || 'Product',
            price: item.product?.price || 0,
            quantity: item.quantity,
            image: item.product?.image_url || item.product?.images?.[0] || '',
            size: item.size || undefined,
            color: item.color || undefined,
          }));
          
          setItems(transformedItems);
        } else {
          // Backend returned error, fall back to localStorage
          const storageKey = user ? `cart_${user.uid}` : 'cart_guest';
          const savedCart = localStorage.getItem(storageKey);
          if (savedCart) {
            try {
              setItems(JSON.parse(savedCart));
            } catch (e) {
              console.error('Error loading from localStorage:', e);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching cart:', error);
        // Network error or backend unavailable, fall back to localStorage
        const storageKey = user ? `cart_${user.uid}` : 'cart_guest';
        const savedCart = localStorage.getItem(storageKey);
        if (savedCart) {
          try {
            setItems(JSON.parse(savedCart));
          } catch (e) {
            console.error('Error loading from localStorage:', e);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchCart();
  }, [user]);

  // Save to localStorage as backup
  useEffect(() => {
    const storageKey = user ? `cart_${user.uid}` : 'cart_guest';
    localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items, user]);

  const addItem = async (item: Omit<CartItem, 'id' | 'quantity'> & { quantity?: number }) => {
    const userId = user?.uid;
    const sessionId = getSessionId();

    try {
      const response = await apiRequest('POST', '/api/cart', {
        user_id: userId,
        session_id: !userId ? sessionId : undefined,
        product_id: item.productId,
        quantity: item.quantity || 1,
        size: item.size,
        color: item.color,
      });

      const addedItem = await response.json();
      
      // Update local state
      setItems((currentItems) => {
        const existingIndex = currentItems.findIndex(
          (i) =>
            i.productId === item.productId &&
            i.size === item.size &&
            i.color === item.color
        );

        if (existingIndex > -1) {
          const updated = [...currentItems];
          updated[existingIndex].quantity = addedItem.quantity;
          return updated;
        } else {
          return [
            ...currentItems,
            {
              id: addedItem.id,
              productId: item.productId,
              name: item.name,
              price: item.price,
              image: item.image,
              quantity: addedItem.quantity,
              size: item.size,
              color: item.color,
            }
          ];
        }
      });
    } catch (error) {
      console.warn('Backend unavailable, using local cart:', error);
      // Fallback to local-only add if backend fails - don't throw error
      setItems((currentItems) => {
        const existingIndex = currentItems.findIndex(
          (i) =>
            i.productId === item.productId &&
            i.size === item.size &&
            i.color === item.color
        );

        if (existingIndex > -1) {
          const updated = [...currentItems];
          updated[existingIndex].quantity += item.quantity || 1;
          return updated;
        } else {
          return [
            ...currentItems,
            {
              ...item,
              id: `local_${Date.now()}`,
              quantity: item.quantity || 1
            }
          ];
        }
      });
      // Don't throw - operation succeeded locally
    }
  };

  const removeItem = async (id: string) => {
    try {
      await apiRequest('DELETE', `/api/cart/${id}`);
      setItems((currentItems) => currentItems.filter((item) => item.id !== id));
    } catch (error) {
      console.warn('Backend unavailable, using local cart:', error);
      // Still remove locally even if backend fails - don't throw error
      setItems((currentItems) => currentItems.filter((item) => item.id !== id));
      // Don't throw - operation succeeded locally
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(id);
    } else {
      try {
        await apiRequest('PUT', `/api/cart/${id}`, { quantity });
        setItems((currentItems) =>
          currentItems.map((item) =>
            item.id === id ? { ...item, quantity } : item
          )
        );
      } catch (error) {
        console.warn('Backend unavailable, using local cart:', error);
        // Still update locally even if backend fails - don't throw error
        setItems((currentItems) =>
          currentItems.map((item) =>
            item.id === id ? { ...item, quantity } : item
          )
        );
        // Don't throw - operation succeeded locally
      }
    }
  };

  const clearCart = async () => {
    const userId = user?.uid;
    const sessionId = getSessionId();

    try {
      const params = new URLSearchParams();
      if (userId) {
        params.append('user_id', userId);
      } else {
        params.append('session_id', sessionId);
      }

      await apiRequest('DELETE', `/api/cart?${params}`);
      setItems([]);
    } catch (error) {
      console.warn('Backend unavailable, using local cart:', error);
      // Still clear locally even if backend fails - don't throw error
      setItems([]);
      // Don't throw - operation succeeded locally
    }
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
    itemCount,
    isLoading,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
