import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { cartApi, type CartDto } from '../api/cart';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: CartDto | null;
  itemCount: number;
  loading: boolean;
  addItem: (productId: number, quantity?: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  updateItem: (itemId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refresh: () => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const [cart, setCart] = useState<CartDto | null>(null);
  const [loading, setLoading] = useState(false);
  // Кошик існує тільке у покупця — для Seller/Admin не викликаємо API,
  // щоб не отримувати зайвий 404 на кожній сторінці їхнього кабінету.
  const isBuyer = !user?.role || user.role === 'Buyer';

  const refresh = useCallback(async () => {
    if (!isAuthenticated || !isBuyer) { setCart(null); return; }
    try {
      const data = await cartApi.getMyCart();
      setCart(data);
    } catch {
      setCart(null);
    }
  }, [isAuthenticated, isBuyer]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addItem = async (productId: number, quantity = 1) => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      await cartApi.addItem(productId, quantity);
      await refresh();
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId: number) => {
    setLoading(true);
    try {
      await cartApi.deleteItem(itemId);
      await refresh();
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (itemId: number, quantity: number) => {
    setLoading(true);
    try {
      await cartApi.updateItem(itemId, quantity);
      await refresh();
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    setLoading(true);
    try {
      await cartApi.clearCart();
      await refresh();
    } finally {
      setLoading(false);
    }
  };

  const itemCount = cart?.items?.reduce((sum, i) => sum + i.quantity, 0) ?? 0;

  return (
    <CartContext.Provider value={{ cart, itemCount, loading, addItem, removeItem, updateItem, clearCart, refresh }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
