import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Basket from './Basket';
import Header from '../../components/Header/Header';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { productsApi } from '../../api/products';
import { CATEGORIES } from '../../data/categories';
import type { Product } from '../../types';

const FAVORITES_KEY = 'blitzmall_favorites';

function loadFavorites(): number[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? (JSON.parse(raw) as number[]) : [];
  } catch {
    return [];
  }
}

function saveFavorites(ids: number[]): void {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
}

export default function BasketContainer() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { cart, addItem, removeItem, updateItem, clearCart } = useCart();

  const [productMap, setProductMap] = useState<Record<number, Product>>({});
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<number[]>(() => loadFavorites());

  const cartItems = cart?.items ?? [];

  useEffect(() => {
    if (cartItems.length === 0) {
      setProductMap({});
      return;
    }
    const ids = [...new Set(cartItems.map((i) => i.productId))];
    Promise.all(ids.map((id) => productsApi.getById(id).catch(() => null))).then((results) => {
      const map: Record<number, Product> = {};
      results.forEach((p) => {
        if (p) map[p.id] = p;
      });
      setProductMap(map);
    });
  }, [cart]);

  useEffect(() => {
    if (cartItems.length === 0) {
      setSuggestions([]);
      return;
    }
    const products = Object.values(productMap);
    if (products.length === 0) return;

    const categoryIds = [
      ...new Set(
        products
          .map((p) => p.categoryId ?? CATEGORIES.find((c) => c.name === p.categoryName)?.backendId)
          .filter((id): id is number => !!id),
      ),
    ];
    const cartProductIds = new Set(cartItems.map((i) => i.productId));

    if (categoryIds.length === 0) {
      setSuggestions([]);
      return;
    }

    Promise.all(categoryIds.map((categoryId) => productsApi.search({ categoryId, page: 1, pageSize: 6 }).catch(() => ({ items: [] as Product[] }))))
      .then((results) => {
        const seen = new Set<number>();
        const pool: Product[] = [];
        results.forEach((res) => {
          res.items.forEach((p) => {
            if (!cartProductIds.has(p.id) && !seen.has(p.id)) {
              seen.add(p.id);
              pool.push(p);
            }
          });
        });
        setSuggestions(pool.slice(0, 3));
      })
      .catch(() => setSuggestions([]));
  }, [cart?.id, productMap]);

  const products = Object.values(productMap);
  const goodsTotal = cartItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const cashback = Math.round(goodsTotal * 0.01);

  const toggleFavorite = (productId: number) => {
    setFavoriteIds((prev) => {
      const next = prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId];
      saveFavorites(next);
      return next;
    });
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const items = cartItems.map((item) => {
      const product = productMap[item.productId];
      return {
        id: String(item.id),
        name: product?.name ?? `Товар #${item.productId}`,
        variant: product?.categoryName ?? '',
        qty: item.quantity,
        brand: product?.brandName ?? '',
        price: item.unitPrice,
        image: product?.imageUrl ?? '',
      };
    });
    navigate('/delivery', {
      state: {
        items,
        itemsCount: cartItems.reduce((sum, i) => sum + i.quantity, 0),
        goodsTotal,
        cashback,
      },
    });
  };

  if (!isAuthenticated) {
    return (
      <>
        <Header />
        <div style={{ maxWidth: 600, margin: '80px auto', textAlign: 'center' }}>
          <h2>Увійдіть, щоб переглянути кошик</h2>
          <Link to="/login">Увійти</Link>
        </div>
      </>
    );
  }

  return (
    <Basket
      cartItems={cartItems}
      products={products}
      suggestions={suggestions}
      favoriteIds={favoriteIds}
      bonuses={0}
      cashback={cashback}
      onQuantityChange={(itemId, quantity) => updateItem(itemId, quantity)}
      onRemove={(itemId) => removeItem(itemId)}
      onClear={() => clearCart()}
      onToggleFavorite={toggleFavorite}
      onApplyPromo={() => undefined}
      onAddToCart={(productId) => addItem(productId)}
      onCheckout={handleCheckout}
    />
  );
}
