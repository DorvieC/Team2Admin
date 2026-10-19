import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { productsApi } from '../../api/products';
import type { Product } from '../../types';
import styles from './CartPage.module.css';

export default function CartPage() {
  const { isAuthenticated } = useAuth();
  const { cart, itemCount, loading, removeItem, updateItem, clearCart } = useCart();
  const navigate = useNavigate();

  const [productMap, setProductMap] = useState<Record<number, Product>>({});

  useEffect(() => {
    if (!cart || cart.items.length === 0) return;
    const ids = [...new Set(cart.items.map(i => i.productId))];
    Promise.all(ids.map(id => productsApi.getById(id).catch(() => null)))
      .then(results => {
        const map: Record<number, Product> = {};
        results.forEach(p => { if (p) map[p.id] = p; });
        setProductMap(map);
      });
  }, [cart]);

  if (!isAuthenticated) {
    return (
      <div className={styles.page}>
        <Header />
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🛒</div>
          <h2>Увійдіть, щоб переглянути кошик</h2>
          <Link to="/login" className={styles.loginBtn}>Увійти</Link>
        </div>
      </div>
    );
  }

  const total = cart?.items?.reduce((s, i) => s + i.unitPrice * i.quantity, 0) ?? 0;

  const goToDelivery = () => {
    const items = (cart?.items ?? []).map(item => {
      const product = productMap[item.productId];
      return {
        id: String(item.id),
        name: product?.name ?? `Товар #${item.productId}`,
        variant: product?.categoryName ?? '',
        qty: item.quantity,
        brand: '',
        price: item.unitPrice,
        image: product?.imageUrl ?? '',
      };
    });
    navigate('/delivery', {
      state: {
        items,
        itemsCount: itemCount,
        goodsTotal: total,
        cashback: 0,
      },
    });
  };

  return (
    <div className={styles.page}>
      <Header />
      <div className={styles.inner}>
        <h1 className={styles.title}>Кошик {itemCount > 0 && `(${itemCount})`}</h1>

        {!cart || cart.items.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🛒</div>
            <h2>Кошик порожній</h2>
            <Link to="/" className={styles.loginBtn}>Продовжити покупки</Link>
          </div>
        ) : (
          <div className={styles.layout}>
            <div className={styles.items}>
              {cart.items.map(item => {
                const product = productMap[item.productId];
                return (
                  <div key={item.id} className={styles.item}>
                    {product?.imageUrl && (
                      <Link to={`/product/${item.productId}`}>
                        <img src={product.imageUrl} alt={product.name} className={styles.itemImg} />
                      </Link>
                    )}
                    <div className={styles.itemInfo}>
                      <Link to={`/product/${item.productId}`} className={styles.itemName}>
                        {product?.name ?? `Товар #${item.productId}`}
                      </Link>
                      {product?.categoryName && (
                        <span className={styles.itemCategory}>{product.categoryName}</span>
                      )}
                      <span className={styles.itemPrice}>{item.unitPrice.toLocaleString('uk-UA')} ₴ / шт.</span>
                    </div>
                    <div className={styles.itemControls}>
                      <button
                        className={styles.qtyBtn}
                        onClick={() => item.quantity > 1 ? updateItem(item.id, item.quantity - 1) : removeItem(item.id)}
                        disabled={loading}
                      >−</button>
                      <span className={styles.qty}>{item.quantity}</span>
                      <button
                        className={styles.qtyBtn}
                        onClick={() => updateItem(item.id, item.quantity + 1)}
                        disabled={loading}
                      >+</button>
                      <span className={styles.itemTotal}>{(item.unitPrice * item.quantity).toLocaleString('uk-UA')} ₴</span>
                      <button className={styles.removeBtn} onClick={() => removeItem(item.id)} disabled={loading}>✕</button>
                    </div>
                  </div>
                );
              })}

              <button className={styles.clearBtn} onClick={clearCart} disabled={loading}>
                Очистити кошик
              </button>
            </div>

            <div className={styles.summary}>
              <h3 className={styles.summaryTitle}>Разом</h3>
              <div className={styles.summaryRow}>
                <span>Товарів:</span>
                <span>{itemCount} шт.</span>
              </div>
              <div className={styles.summaryTotal}>
                <span>Сума:</span>
                <span>{total.toLocaleString('uk-UA')} ₴</span>
              </div>
              <button className={styles.orderBtn} onClick={goToDelivery}>
                Оформити замовлення
              </button>
              <Link to="/" className={styles.continueLink}>← Продовжити покупки</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
