import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Basket.module.css';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import { useAuth } from '../../context/AuthContext';
import EmptyCart, { pluralGoods } from './Emptycart';
import type { CartItem, Product } from '../../types/index'; 
import type {BasketProps} from '../../types/index';



const UAH = '₴';
const fmt = (n: number) => n.toLocaleString('uk-UA').replace(/\u00a0/g, ' ');

const HeartIcon = ({ filled }: { filled: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M12 21s-7.5-4.6-9.6-9.3C.9 8.2 3 4.5 6.6 4.5c2 0 3.6 1.1 5.4 3 1.8-1.9 3.4-3 5.4-3 3.6 0 5.7 3.7 4.2 7.2C19.5 16.4 12 21 12 21z"
      fill={filled ? '#d62d2d' : 'none'}
      stroke="#d62d2d"
      strokeWidth="2"
    />
  </svg>
);

const CartIcon = () => (
  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="1.5" aria-hidden="true">
    <path d="M2 3h2.5l2.4 11.5h11.2L20.5 7H6" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="9" cy="19" r="1.5" />
    <circle cx="17" cy="19" r="1.5" />
  </svg>
);

const StarIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 2l3 6.6 7.2.8-5.4 4.9 1.5 7.1L12 17.7 5.7 21.4l1.5-7.1L1.8 9.4 9 8.6z" />
  </svg>
);

export default function Basket({
  cartItems = [],
  products = [],
  suggestions = [],
  favoriteIds = [],
  bonuses = 0,
  cashback = 0,
  onQuantityChange,
  onRemove,
  onClear,
  onToggleFavorite,
  onApplyPromo,
  onAddToCart,
  onCheckout,
}: BasketProps) {
  const { isAuthenticated } = useAuth();
  const [promo, setPromo] = useState('');
  const [useBonuses, setUseBonuses] = useState(false);

  const goods = cartItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const count = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const discount = useBonuses ? Math.min(bonuses, goods) : 0;
  const total = goods - discount;
  const isEmpty = cartItems.length === 0;

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
    <>
      <Header />

      <main className={styles.cartPage}>
        <nav className={styles.cartCrumbs} aria-label="Навігація">
          <a href="/">Головна</a>
          <span>/</span>
          <span>Кошик</span>
        </nav>

        <div className={styles.cartHead}>
          <h1 className={styles.cartTitle}>Кошик&nbsp; {count} {pluralGoods(count)}</h1>
        </div>

        {isEmpty ? (
          <EmptyCart />
        ) : (
        <div className={styles.cartBody}>
          <section className={`${styles.cartCard} ${styles.cartItems}`} aria-label="Товари в кошику">
            {cartItems.map((item) => {
              const product = products.find((p) => p.id === item.productId);
              if (!product) return null;

              return (
                <article className={styles.cartItem} key={item.id}>
                  <img className={styles.cartItemImg} src={product.imageUrl} alt={product.name} />

                  <div>
                    <h2 className={styles.cartItemName}>{product.name}</h2>
                    <div className={styles.cartItemMeta}>
                      {product.brandName && <span>{product.brandName}</span>}
                      <span>{(product.quantity ?? 0) > 0 ? 'В наявності' : 'Немає в наявності'}</span>
                    </div>
                    <div className={styles.cartItemActions}>
                      <button className={styles.cartLink} onClick={() => onToggleFavorite?.(product.id)}>
                        <HeartIcon filled={favoriteIds.includes(product.id)} /> В обране
                      </button>
                      <button className={styles.cartLink} onClick={() => onRemove?.(item.id)}>
                        <span aria-hidden="true">✕</span> Видалити
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className={styles.cartItemPrice}>
                      {fmt(item.unitPrice * item.quantity)} {UAH}
                    </div>
                    <div className={styles.cartQty}>
                      <button
                        onClick={() => onQuantityChange?.(item.id, Math.max(1, item.quantity - 1))}
                        aria-label="Менше"
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button onClick={() => onQuantityChange?.(item.id, item.quantity + 1)} aria-label="Більше">
                        +
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}

            <div className={styles.cartItemButtons}>
              <button className={styles.cartOutline} onClick={() => onClear?.()}>
                Очистити кошик
              </button>
              <button
                className={styles.cartOutline}
                disabled={cartItems.length === 0}
                onClick={() => onCheckout?.()}
              >
                Продовжити покупки
              </button>
            </div>
          </section>

          <aside className={`${styles.cartCard} ${styles.cartSummary}`}>
            <h2>Разом</h2>

            <div className={styles.cartRow}>
              <span>Товари</span>
              <span>
                {fmt(goods)} {UAH}
              </span>
            </div>
            <div className={styles.cartRow}>
              <span>Доставка</span>
              <span>безкоштовно</span>
            </div>
            <div className={`${styles.cartRow} ${styles.cartRowTotal}`}>
              <span>До сплати</span>
              <span>
                {fmt(total)} {UAH}
              </span>
            </div>

            <div className={styles.cartPromo}>
              <input
                type="text"
                placeholder="Промокод"
                value={promo}
                onChange={(e) => setPromo(e.target.value)}
              />
              <button onClick={() => onApplyPromo?.(promo)}>Ок</button>
            </div>

            <div className={styles.cartBonus}>
              <button
                type="button"
                role="switch"
                aria-checked={useBonuses}
                aria-label="Списати бонуси"
                className={styles.switch}
                onClick={() => setUseBonuses((v) => !v)}
              />
              <span>Списати бонуси ({bonuses} доступно)</span>
            </div>

            <button className={styles.cartCheckout} disabled={cartItems.length === 0} onClick={() => onCheckout?.()}>
              Оформити замовлення
            </button>

            <p className={styles.cartCashback}>Кешбек за це замовлення: +{cashback} бонусів</p>
          </aside>

          {cartItems.length > 0 && suggestions.length > 0 && (
          <section className={styles.cartTogether}>
            <h2>Купують разом</h2>
            {suggestions.slice(0, 3).map((p) => (
              <article className={styles.miniCard} key={p.id}>
                <img className={styles.miniCardImg} src={p.imageUrl} alt={p.name} />
                <div className={styles.miniCardBody}>
                  {p.rating !== undefined && (
                    <div className={styles.miniCardStars}>
                      {Array.from({ length: Math.round(p.rating) }).map((_, i) => (
                        <StarIcon key={i} />
                      ))}
                      {p.reviewCount !== undefined && <span>{p.reviewCount}</span>}
                    </div>
                  )}
                  <h3 className={styles.miniCardName}>{p.name}</h3>
                  <p className={styles.miniCardPrice}>
                    {fmt(p.price)} {UAH}
                  </p>
                  <div className={styles.miniCardSub}>
                    {p.brandName && <span>{p.brandName}</span>}
                    <span>{(p.quantity ?? 0) > 0 ? 'В наявності' : 'Немає в наявності'}</span>
                  </div>
                  <button className={styles.miniCardCart} aria-label="Додати в кошик" onClick={() => onAddToCart?.(p.id)}>
                    <CartIcon />
                  </button>
                </div>
              </article>
            ))}
          </section>
          )}
        </div>
        )}
      </main>

      <Footer />
    </>
  );
}