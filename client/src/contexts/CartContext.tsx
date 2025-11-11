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
    console.log('[Cart] Generated new session ID:', sessionId);
  } else {
    console.log('[Cart] Using existing session ID:', sessionId);
  }
  return sessionId;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch cart from backend when component mounts or user changes
  useEffect(() => {
    // Wait for auth to load before fetching cart
    if (loading) {
      console.log('[Cart] Waiting for auth to load...');
      return;
    }

    const fetchCart = async () => {
      setIsLoading(true);
      try {
        const userId = user?.uid;
        const sessionId = getSessionId();
        
        console.log('[Cart] Fetching cart with:', { userId, sessionId });
        
        const params = new URLSearchParams();
        if (userId) {
          params.append('user_id', userId);
        } else {
          params.append('session_id', sessionId);
        }

        const response = await fetch(`/api/cart?${params}`);
        if (response.ok) {
          const backendItems = await response.json();
          
          console.log('[Cart] Backend items:', backendItems);
          
          // Transform backend cart items to frontend format
          const transformedItems: CartItem[] = backendItems.map((item: any) => {
            console.log('[Cart] Product data:', item.product);
            const image = item.product?.image_url || item.product?.images?.[0] || item.products?.image_url || '';
            console.log('[Cart] Using image:', image);
            return {
              id: item.id,
              productId: item.product_id,
              name: item.product?.name || item.products?.name || 'Product',
              price: item.product?.price || item.products?.price || 0,
              quantity: item.quantity,
              image,
              size: item.size || undefined,
              color: item.color || undefined,
            };
          });
          
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
  }, [user, loading]);

  // Save to localStorage as backup
  useEffect(() => {
    const storageKey = user ? `cart_${user.uid}` : 'cart_guest';
    localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items, user]);

  const addItem = async (item: Omit<CartItem, 'id' | 'quantity'> & { quantity?: number }) => {
    const userId = user?.uid;
    const sessionId = getSessionId();

    // OPTIMISTIC UPDATE - Update UI immediately
    const tempId = `temp_${Date.now()}`;
    const optimisticItem: CartItem = {
      ...item,
      id: tempId,
      quantity: item.quantity || 1
    };

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
        return [...currentItems, optimisticItem];
      }
    });

    try {
      // Make API request in background
      const response = await apiRequest('POST', '/api/cart', {
        user_id: userId,
        session_id: !userId ? sessionId : undefined,
        product_id: item.productId,
        quantity: item.quantity || 1,
        size: item.size,
        color: item.color,
      });

      const addedItem = await response.json();
      
      // Replace optimistic item with real data from server
      setItems((currentItems) => 
        currentItems.map(i => i.id === tempId ? {
          id: addedItem.id,
          productId: item.productId,
          name: item.name,
          price: item.price,
          image: item.image,
          quantity: addedItem.quantity,
          size: item.size,
          color: item.color,
        } : i)
      );
    } catch (error) {
      console.warn('Backend unavailable, keeping optimistic update:', error);
      // Keep the optimistic update - don't revert
    }
  };

  const removeItem = async (id: string) => {
    // OPTIMISTIC UPDATE - Remove from UI immediately
    const removedItem = items.find(item => item.id === id);
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));

    try {
      await apiRequest('DELETE', `/api/cart/${id}`);
    } catch (error) {
      console.warn('Backend unavailable, item removed locally:', error);
      // If API fails, item is still removed locally (which is fine for UX)
      // We could revert here if needed: setItems(prev => [...prev, removedItem])
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(id);
      return;
    }

    // OPTIMISTIC UPDATE - Update UI immediately
    const previousItems = items;
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    );

    try {
      await apiRequest('PUT', `/api/cart/${id}`, { quantity });
    } catch (error) {
      console.warn('Backend unavailable, keeping optimistic update:', error);
      // We could revert on error: setItems(previousItems)
      // But for better UX, we keep the optimistic update
    }
  };

  const clearCart = async () => {
    const userId = user?.uid;
    const sessionId = getSessionId();

    // OPTIMISTIC UPDATE - Clear UI immediately
    const previousItems = items;
    setItems([]);

    try {
      const params = new URLSearchParams();
      if (userId) {
        params.append('user_id', userId);
      } else {
        params.append('session_id', sessionId);
      }

      await apiRequest('DELETE', `/api/cart?${params}`);
    } catch (error) {
      console.warn('Backend unavailable, cart cleared locally:', error);
      // We could revert: setItems(previousItems)
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
