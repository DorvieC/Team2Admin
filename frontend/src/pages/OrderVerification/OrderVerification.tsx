import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import styles from './OrderVerification.module.css';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import type { PaymentNavState } from '../../types/index';
import { ordersApi } from '../../api/orders';
import { paymentsApi } from '../../api/payments';
import { useCart } from '../../context/CartContext';

const UAH = '₴';
const fmt = (n: number) => n.toLocaleString('uk-UA').replace(/\u00a0/g, ' ');

export function OrderVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearCart } = useCart();
  const state = (location.state ?? {}) as PaymentNavState;

  const [promo, setPromo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [orderDone, setOrderDone] = useState(false);
  const [payStage, setPayStage] = useState<'idle' | 'auth' | 'success'>('idle');

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const {
    paymentMethodName = 'Банківська карта',
    items = [],
    itemsCount = 0,
    goodsTotal = 0,
    deliveryPrice = 0,
    deliveryLabel = '—',
    cashback = 0,
    total = 0,
    phone = '',
    address = '',
    comment = '',
  } = state;

  const handleApplyPromo = () => {
    console.log('promo code:', promo);
  };

  const handleBack = () => navigate('/payment');

  const paymentMethodId = state.paymentMethodId;
  const isDigitalWallet = paymentMethodId === 'apple-pay' || paymentMethodId === 'google-pay';

  const handleConfirm = async () => {
    setSubmitting(true);
    setOrderError('');

    if (isDigitalWallet) {
      setPayStage('auth');
      await sleep(1600);
      setPayStage('success');
      await sleep(900);
    } else {
      setPayStage('success');
      await sleep(1000);
    }

    try {
      const order = await ordersApi.create({
        deliveryAddress: deliveryLabel || address || 'Не вказано',
        phone,
        comment: comment || undefined,
        paymentMethod: paymentMethodId,
      });

      const payment = await paymentsApi.create({
        orderId: order.id,
        amount: order.totalAmount,
        method: paymentMethodId || 'card',
      });
      await paymentsApi.process(payment.id);

      await clearCart();
      setOrderDone(true);
    } catch {
      setOrderError('Не вдалося оформити замовлення. Спробуйте ще раз.');
      setPayStage('idle');
    } finally {
      setSubmitting(false);
    }
  };

  if (orderDone) {
    return (
      <div className={styles.pageWrapper}>
        <Header />
        <main className={styles.checkoutPage}>
          <div className={styles.body}>
            <div className={`${styles.card} ${styles.doneCard}`}>
              <h1 className={styles.formTitle}>Замовлення оформлено!</h1>
              <p className={styles.doneText}>
                Дякуємо за покупку! Сума <strong>{fmt(total)} {UAH}</strong> прийнята в обробку.
              </p>
              <div className={styles.actions}>
                <Link to="/" className={styles.back}>На головну</Link>
                <Link to="/profile" className={styles.submit}>Мої замовлення</Link>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <Header />

      <main className={styles.checkoutPage}>
        <nav className={styles.crumbs} aria-label="Навігація">
          <a href="/">Головна</a>
          <span>/</span>
          <a href="/cart">Кошик</a>
          <span>/</span>
          <span>Оформлення замовлення</span>
        </nav>

        <ol className={styles.stepper}>
          <li className={styles.stepDone}>
            <span className={styles.stepNumber}>✓</span>Доставка
          </li>
          <li className={styles.stepperArrow}>→</li>
          <li className={styles.stepDone}>
            <span className={styles.stepNumber}>✓</span>Оплата
          </li>
          <li className={styles.stepperArrow}>→</li>
          <li className={styles.stepActive}>
            <span className={styles.stepNumber}>3</span>Підтвердження
          </li>
        </ol>

        <div className={styles.body}>
          <section className={`${styles.card} ${styles.form}`}>
            <h1 className={styles.formTitle}>Перевірте замовлення</h1>

            {items.map((item) => (
              <div className={styles.productRow} key={item.id}>
                <img src={item.image} alt={item.name} />
                <div>
                  <div className={styles.productName}>{item.name}</div>
                  <div className={styles.productMeta}>
                    {item.variant} {item.qty} шт {item.brand}
                  </div>
                </div>
                <div className={styles.productPrice}>
                  {fmt(item.price)} {UAH}
                </div>
              </div>
            ))}

            <dl className={styles.detailsGrid}>
              <dt>Доставка</dt>
              <dd>{deliveryLabel}</dd>
              <dt>Оплата</dt>
              <dd>{paymentMethodName}</dd>
            </dl>

            {orderError && <p className={styles.orderError}>{orderError}</p>}

            <div className={styles.actions}>
              <button type="button" className={styles.back} onClick={handleBack}>
                Назад
              </button>
              <button
                type="button"
                className={styles.submit}
                disabled={submitting}
                onClick={handleConfirm}
              >
                {submitting ? 'Обробка…' : `Підтвердити та оплатити  ${fmt(total ?? 0)} ${UAH}`}
              </button>
            </div>
          </section>

          <aside className={`${styles.card} ${styles.summary}`}>
            <h2>Разом</h2>

            <div className={styles.row}>
              <span>Товари ({itemsCount})</span>
              <span>{fmt(goodsTotal ?? 0)} {UAH}</span>
            </div>
            <div className={styles.row}>
              <span>Доставка</span>
              <span>{deliveryPrice && deliveryPrice > 0 ? `${fmt(deliveryPrice)} ${UAH}` : 'безкоштовно'}</span>
            </div>
            <div className={`${styles.row} ${styles.rowCashback}`}>
              <span>Кешбек</span>
              <span>+ {cashback ?? 0} бонусів</span>
            </div>
            <div className={`${styles.row} ${styles.rowTotal}`}>
              <span>До сплати</span>
              <span>{fmt(total ?? 0)} {UAH}</span>
            </div>

            <div className={styles.promo}>
              <input
                type="text"
                placeholder="Промокод"
                value={promo}
                onChange={(e) => setPromo(e.target.value)}
              />
              <button type="button" onClick={handleApplyPromo}>
                Ок
              </button>
            </div>
          </aside>
        </div>
      </main>

      {payStage !== 'idle' && (
        <div className={styles.paySheetOverlay}>
          <div className={styles.paySheetCard}>
            {isDigitalWallet ? (
              paymentMethodId === 'apple-pay' ? (
                <div className={styles.paySheetLogo}>
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="#fff">
                    <path d="M16.365 1.43c0 1.14-.416 2.06-1.246 2.75-.83.7-1.79 1.09-2.88 1.02-.05-1.1.35-2.02 1.18-2.72.84-.7 1.86-1.09 3-1.06.02.01-.04.01-.05.01zM20.9 17.53c-.36.83-.79 1.6-1.29 2.31-.72 1.02-1.5 2.02-2.55 2.06-1.02.04-1.35-.62-2.52-.62-1.16 0-1.53.6-2.5.66-1.02.05-1.79-.98-2.51-2-1.44-2.1-2.55-5.94-1.06-8.53.73-1.28 2.06-2.09 3.5-2.11 1.02-.02 1.66.65 2.5.65.83 0 1.34-.65 2.55-.65 1.13.01 2.33.62 3.05 1.66-2.68 1.55-2.25 5.02.06 5.9-.24.62-.6 1.28-.63 1.27z"/>
                  </svg>
                  <span>Pay</span>
                </div>
              ) : (
                <div className={styles.paySheetLogo}>
                  <svg width="28" height="28" viewBox="0 0 48 48">
                    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.5 6.5 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-8.9 20-20 0-1.2-.1-2.3-.4-3.5z"/>
                    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.5 6.5 29.5 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"/>
                    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.4 35.6 26.8 36 24 36c-5.2 0-9.6-2.9-11.3-7l-6.5 5C9.8 40 16.4 44 24 44z"/>
                    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.5l6.2 5.2C41 35.1 44 30 44 24c0-1.2-.1-2.3-.4-3.5z"/>
                  </svg>
                  <span>Pay</span>
                </div>
              )
            ) : (
              <div className={styles.paySheetLogo}>
                <span>Оплата картою</span>
              </div>
            )}

            {payStage === 'auth' ? (
              <>
                <div className={styles.paySheetSpinner} />
                <p className={styles.paySheetText}>
                  {paymentMethodId === 'apple-pay' ? 'Підтвердіть Face ID для оплати' : 'Підтвердження оплати...'}
                </p>
              </>
            ) : (
              <>
                <div className={styles.paySheetCheck}>✓</div>
                <p className={styles.paySheetText}>Оплата успішна</p>
              </>
            )}

            <p className={styles.paySheetAmount}>{fmt(total ?? 0)} {UAH}</p>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}