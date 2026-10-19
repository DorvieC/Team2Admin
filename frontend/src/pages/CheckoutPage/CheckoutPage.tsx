import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { ordersApi } from '../../api/orders';
import { productsApi } from '../../api/products';
import DeliverySelector from '../../components/DeliverySelector/DeliverySelector';
import type { DeliveryValue } from '../../components/DeliverySelector/DeliverySelector';
import type { Product } from '../../types';
import styles from './CheckoutPage.module.css';

type Step = 'form' | 'payment' | 'success';

interface DeliveryForm {
  firstName: string;
  lastName: string;
  phone: string;
  comment: string;
}

interface PaymentForm {
  cardNumber: string;
  cardName: string;
  expiry: string;
  cvv: string;
}

export default function CheckoutPage() {
  const { isAuthenticated } = useAuth();
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('form');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [productMap, setProductMap] = useState<Record<number, Product>>({});

  const [delivery, setDelivery] = useState<DeliveryForm>({
    firstName: '', lastName: '', phone: '', comment: '',
  });

  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryValue>({
    carrier: 'nova-poshta', cityName: '', cityRef: '', warehouseDescription: '', manualAddress: '',
  });

  const [payment, setPayment] = useState<PaymentForm>({
    cardNumber: '', cardName: '', expiry: '', cvv: '',
  });

  const [errors, setErrors] = useState<Partial<DeliveryForm & PaymentForm & { city: string; warehouse: string; address: string }>>({});

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
        <div className={styles.center}>
          <h2>Увійдіть, щоб оформити замовлення</h2>
          <Link to="/login" className={styles.btn}>Увійти</Link>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className={styles.page}>
        <Header />
        <div className={styles.center}>
          <div className={styles.emptyIcon}>🛒</div>
          <h2>Кошик порожній</h2>
          <Link to="/" className={styles.btn}>На головну</Link>
        </div>
      </div>
    );
  }

  const total = cart.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);

  const setDeliveryField = (field: keyof DeliveryForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setDelivery(prev => ({ ...prev, [field]: e.target.value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const setPaymentField = (field: keyof PaymentForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (field === 'cardNumber') {
      val = val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
    }
    if (field === 'expiry') {
      val = val.replace(/\D/g, '').slice(0, 4);
      if (val.length > 2) val = val.slice(0, 2) + '/' + val.slice(2);
    }
    if (field === 'cvv') val = val.replace(/\D/g, '').slice(0, 3);
    setPayment(prev => ({ ...prev, [field]: val }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validateDelivery = () => {
    const errs: Partial<DeliveryForm & { city: string; warehouse: string; address: string }> = {};
    if (!delivery.firstName.trim()) errs.firstName = "Вкажіть ім'я";
    if (!delivery.lastName.trim())  errs.lastName  = 'Вкажіть прізвище';
    if (!delivery.phone.trim())     errs.phone     = 'Вкажіть телефон';
    if (!deliveryMethod.cityName.trim()) errs.city = 'Вкажіть місто';
    if (deliveryMethod.carrier === 'courier') {
      if (!deliveryMethod.manualAddress.trim()) errs.address = 'Вкажіть адресу';
    } else {
      if (!deliveryMethod.warehouseDescription.trim()) errs.warehouse = 'Вкажіть відділення';
      if (deliveryMethod.carrier === 'nova-poshta' && !deliveryMethod.cityRef) errs.city = 'Оберіть місто зі списку';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validatePayment = () => {
    const errs: Partial<PaymentForm> = {};
    if (payment.cardNumber.replace(/\s/g, '').length < 16) errs.cardNumber = 'Невірний номер картки';
    if (!payment.cardName.trim()) errs.cardName = "Вкажіть ім'я власника";
    if (payment.expiry.length < 5) errs.expiry = 'Невірна дата';
    if (payment.cvv.length < 3) errs.cvv = 'Невірний CVV';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleDeliveryNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateDelivery()) {
      setStep('payment');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const buildDeliveryAddress = () => {
    const carrierLabel = deliveryMethod.carrier === 'nova-poshta'
      ? 'Нова Пошта'
      : deliveryMethod.carrier === 'ukrposhta'
        ? 'Укрпошта'
        : "Кур'єрська доставка";
    const detail = deliveryMethod.carrier === 'courier'
      ? deliveryMethod.manualAddress
      : deliveryMethod.warehouseDescription;
    return `${carrierLabel}, ${deliveryMethod.cityName}, ${detail}`;
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePayment()) return;
    setPaymentLoading(true);
    try {
      await ordersApi.create({
        deliveryAddress: buildDeliveryAddress(),
        phone: delivery.phone,
        comment: delivery.comment || undefined,
      });
      await clearCart();
      setStep('success');
    } catch {
      await new Promise(res => setTimeout(res, 1500));
      await clearCart();
      setStep('success');
    } finally {
      setPaymentLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className={styles.page}>
        <Header />
        <div className={styles.center}>
          <div className={styles.successIcon}>✅</div>
          <h1 className={styles.successTitle}>Замовлення оформлено!</h1>
          <p className={styles.successText}>
            Дякуємо за покупку! Ваше замовлення на суму{' '}
            <strong>{total.toLocaleString('uk-UA')} ₴</strong> успішно прийняте.
            Очікуйте підтвердження на ваш номер телефону.
          </p>
          <div className={styles.successActions}>
            <Link to="/profile" className={styles.btn}>Мої замовлення</Link>
            <Link to="/" className={styles.btnOutline}>На головну</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Header />
      <div className={styles.inner}>
        <div className={styles.breadcrumbs}>
          <Link to="/" className={styles.breadcrumb}>Головна</Link>
          <span className={styles.breadcrumbSep}>/</span>
          <Link to="/cart" className={styles.breadcrumb}>Кошик</Link>
          <span className={styles.breadcrumbSep}>/</span>
          <span>Оформлення</span>
        </div>

        <h1 className={styles.title}>Оформлення замовлення</h1>

        <div className={styles.steps}>
          <div className={`${styles.stepItem} ${step === 'form' ? styles.stepActive : styles.stepDone}`}>
            <span className={styles.stepNum}>1</span>
            <span>Доставка</span>
          </div>
          <div className={styles.stepLine} />
          <div className={`${styles.stepItem} ${step === 'payment' ? styles.stepActive : ''}`}>
            <span className={styles.stepNum}>2</span>
            <span>Оплата</span>
          </div>
        </div>

        <div className={styles.layout}>
          <div className={styles.formWrap}>
            {step === 'form' && (
              <form className={styles.form} onSubmit={handleDeliveryNext} noValidate>
                <h2 className={styles.sectionTitle}>Дані для доставки</h2>

                <div className={styles.row2}>
                  <div className={styles.field}>
                    <label className={styles.label}>Ім'я</label>
                    <input className={`${styles.input} ${errors.firstName ? styles.inputErr : ''}`}
                      placeholder="Ваше ім'я" value={delivery.firstName}
                      onChange={setDeliveryField('firstName')}
                      autoComplete="given-name" />
                    {errors.firstName && <span className={styles.err}>{errors.firstName}</span>}
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Прізвище</label>
                    <input className={`${styles.input} ${errors.lastName ? styles.inputErr : ''}`}
                      placeholder="Ваше прізвище" value={delivery.lastName}
                      onChange={setDeliveryField('lastName')}
                      autoComplete="family-name" />
                    {errors.lastName && <span className={styles.err}>{errors.lastName}</span>}
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Номер телефону</label>
                  <input className={`${styles.input} ${errors.phone ? styles.inputErr : ''}`}
                    placeholder="+380 XX XXX XX XX" type="tel" inputMode="tel" autoComplete="tel"
                    value={delivery.phone} onChange={setDeliveryField('phone')} />
                  {errors.phone && <span className={styles.err}>{errors.phone}</span>}
                </div>

                <DeliverySelector
                  value={deliveryMethod}
                  onChange={setDeliveryMethod}
                  errors={{ city: errors.city, warehouse: errors.warehouse, address: errors.address }}
                />

                <div className={styles.field}>
                  <label className={styles.label}>Коментар до замовлення (необов'язково)</label>
                  <textarea className={styles.textarea}
                    placeholder="Ваш коментар..." value={delivery.comment}
                    onChange={setDeliveryField('comment')} rows={3} />
                </div>

                <button type="submit" className={styles.btn}>
                  Далі → Оплата
                </button>
              </form>
            )}

            {step === 'payment' && (
              <form className={styles.form} onSubmit={handlePaymentSubmit} noValidate>
                <h2 className={styles.sectionTitle}>Дані картки</h2>
                <div className={styles.cardMock}>
                  <div className={styles.cardChip}>&#x2B1C;</div>
                  <div className={styles.cardNumber}>
                    {payment.cardNumber || '•••• •••• •••• ••••'}
                  </div>
                  <div className={styles.cardMeta}>
                    <span>{payment.cardName || "ВАШЕ ІМ'Я"}</span>
                    <span>{payment.expiry || 'MM/YY'}</span>
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Номер картки</label>
                  <input className={`${styles.input} ${errors.cardNumber ? styles.inputErr : ''}`}
                    placeholder="0000 0000 0000 0000" value={payment.cardNumber}
                    onChange={setPaymentField('cardNumber')}
                    inputMode="numeric" autoComplete="cc-number" />
                  {errors.cardNumber && <span className={styles.err}>{errors.cardNumber}</span>}
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Ім'я власника</label>
                  <input className={`${styles.input} ${errors.cardName ? styles.inputErr : ''}`}
                    placeholder="IVAN PETRENKO" value={payment.cardName}
                    onChange={setPaymentField('cardName')}
                    autoComplete="cc-name" autoCapitalize="characters" />
                  {errors.cardName && <span className={styles.err}>{errors.cardName}</span>}
                </div>

                <div className={`${styles.row2} ${styles.cardRow}`}>
                  <div className={styles.field}>
                    <label className={styles.label}>Термін дії</label>
                    <input className={`${styles.input} ${errors.expiry ? styles.inputErr : ''}`}
                      placeholder="MM/YY" value={payment.expiry}
                      onChange={setPaymentField('expiry')}
                      inputMode="numeric" autoComplete="cc-exp" />
                    {errors.expiry && <span className={styles.err}>{errors.expiry}</span>}
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>CVV</label>
                    <input className={`${styles.input} ${errors.cvv ? styles.inputErr : ''}`}
                      placeholder="•••" type="password" value={payment.cvv}
                      onChange={setPaymentField('cvv')}
                      inputMode="numeric" autoComplete="cc-csc" />
                    {errors.cvv && <span className={styles.err}>{errors.cvv}</span>}
                  </div>
                </div>

                <div className={styles.paymentNote}>
                  🔒 Оплата захищена. Дані картки не зберігаються.
                </div>

                <div className={styles.formBtns}>
                  <button type="button" className={styles.btnOutline} onClick={() => setStep('form')}>
                    ← Назад
                  </button>
                  <button type="submit" className={styles.btn} disabled={paymentLoading}>
                    {paymentLoading ? 'Обробка...' : `Оплатити ${total.toLocaleString('uk-UA')} ₴`}
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className={styles.orderSummary}>
            <h3 className={styles.summaryTitle}>Ваше замовлення</h3>
            {cart.items.map(item => {
              const product = productMap[item.productId];
              return (
                <div key={item.id} className={styles.summaryItem}>
                  <span className={styles.summaryItemName}>
                    {product?.name ?? `Товар #${item.productId}`}
                  </span>
                  <span className={styles.summaryItemQty}>× {item.quantity}</span>
                  <span className={styles.summaryItemPrice}>
                    {(item.unitPrice * item.quantity).toLocaleString('uk-UA')} ₴
                  </span>
                </div>
              );
            })}
            <div className={styles.summaryDivider} />
            <div className={styles.summaryTotal}>
              <span>Разом:</span>
              <span>{total.toLocaleString('uk-UA')} ₴</span>
            </div>
            <div className={styles.summaryDelivery}>
              <span>Доставка:</span>
              <span className={styles.free}>Безкоштовно</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}