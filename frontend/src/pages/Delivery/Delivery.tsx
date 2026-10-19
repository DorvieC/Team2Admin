import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styles from './Delivery.module.css';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import { novaPoshtaApi } from '../../api/novaPoshta';
import type { NpCity, NpWarehouse } from '../../api/novaPoshta';
import type { CheckoutDeliveryProps, DeliveryMethod, DeliveryNavState } from '../../types/index';

const UAH = '₴';
const fmt = (n: number) => n.toLocaleString('uk-UA').replace(/\u00a0/g, ' ');

const defaultDeliveryMethods: DeliveryMethod[] = [
  { id: 'nova-poshta', name: 'Нова Пошта', eta: '1-2 дні', price: 70 },
  { id: 'ukrposhta', name: 'Укрпошта', eta: '4-5 дні', price: 45 },
  { id: 'courier', name: "Кур'єр", eta: 'сьогодні до 21.00', price: 95 },
  { id: 'pickup', name: 'Самовивіз', eta: '1-2 дні', price: 0 },
];

// ВАЖЛИВО: підстав свої реальні адреси магазинів
const pickupPoints = [
  { id: 'khreshchatyk', address: 'вул. Хрещатик, 1, Київ' },
  { id: 'obolon', address: 'пр. Оболонський, 12, Київ' },
  { id: 'lisova', address: 'пр. Лісовий, 25, Київ' },
];

export default function Delivery(props: CheckoutDeliveryProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const navState = (location.state ?? {}) as DeliveryNavState;

  const itemsCount = navState.itemsCount ?? props.itemsCount ?? 0;
  const goodsTotal = navState.goodsTotal ?? props.goodsTotal ?? 0;
  const cashback = navState.cashback ?? props.cashback ?? 0;
  const items = navState.items ?? [];
  const deliveryMethods = props.deliveryMethods ?? defaultDeliveryMethods;
  const { onSubmit, onApplyPromo } = props;

  const [firstName, setFirstName] = useState(navState.firstName ?? '');
  const [lastName, setLastName] = useState(navState.lastName ?? '');
  const [phone, setPhone] = useState(navState.phone ?? '');
  const [city, setCity] = useState('');
  const [cityRef, setCityRef] = useState('');
  const [deliveryMethodId, setDeliveryMethodId] = useState(deliveryMethods[0]?.id ?? '');
  const [address, setAddress] = useState(navState.address ?? '');
  const [comment, setComment] = useState(navState.comment ?? '');
  const [promo, setPromo] = useState('');

  const [cityResults, setCityResults] = useState<NpCity[]>([]);
  const [cityOpen, setCityOpen] = useState(false);
  const [warehouseResults, setWarehouseResults] = useState<NpWarehouse[]>([]);
  const [warehouseOpen, setWarehouseOpen] = useState(false);
  const [errors, setErrors] = useState<{ firstName?: string; lastName?: string; phone?: string; city?: string; address?: string }>({});

  const isNovaPoshta = deliveryMethodId === 'nova-poshta';
  const isUkrposhta = deliveryMethodId === 'ukrposhta';
  const isCourier = deliveryMethodId === 'courier';
  const isPickup = deliveryMethodId === 'pickup';
  const isWarehouseCarrier = isNovaPoshta || isUkrposhta;
  const needsCity = true;

  const addressLabel = isPickup
    ? 'Оберіть адресу'
    : isCourier
      ? 'Вкажіть адресу доставки'
      : 'Відділення / Поштомат';

  const cityBoxRef = useRef<HTMLDivElement>(null);
  const addressBoxRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent | TouchEvent) => {
      if (cityBoxRef.current && !cityBoxRef.current.contains(e.target as Node)) setCityOpen(false);
      if (addressBoxRef.current && !addressBoxRef.current.contains(e.target as Node)) setWarehouseOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
    };
  }, []);

  const handleCityChange = (value: string) => {
    setCity(value);
    setCityRef('');
    if (!isNovaPoshta) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length < 2) { setCityResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      const results = await novaPoshtaApi.searchCities(value).catch(() => []);
      setCityResults(results);
      setCityOpen(true);
    }, 350);
  };

  const handleSelectCity = (c: NpCity) => {
    setCity(c.name);
    setCityRef(c.deliveryCityRef);
    setCityOpen(false);
    setAddress('');
  };

  const handleAddressChange = (value: string) => {
    setAddress(value);
    if (!isNovaPoshta || !cityRef) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const results = await novaPoshtaApi.getWarehouses(cityRef, value).catch(() => []);
      setWarehouseResults(results.slice(0, 30));
      setWarehouseOpen(true);
    }, 300);
  };

  const handleAddressFocus = async () => {
    if (!isNovaPoshta || !cityRef) return;
    setWarehouseOpen(true);
    if (warehouseResults.length === 0) {
      const results = await novaPoshtaApi.getWarehouses(cityRef, address).catch(() => []);
      setWarehouseResults(results.slice(0, 30));
    }
  };

  const handleSelectWarehouse = (w: NpWarehouse) => {
    setAddress(w.description);
    setWarehouseOpen(false);
  };

  const selectedMethod = deliveryMethods.find((m) => m.id === deliveryMethodId);
  const deliveryPrice = selectedMethod?.price ?? 0;
  const total = goodsTotal + deliveryPrice;

  const validate = () => {
    const errs: typeof errors = {};
    if (!firstName.trim()) errs.firstName = "Вкажіть ім'я";
    if (!lastName.trim()) errs.lastName = 'Вкажіть прізвище';
    if (!phone.trim()) errs.phone = 'Вкажіть номер телефону';
    if (needsCity && !city.trim()) errs.city = 'Вкажіть місто';
    if (needsCity && isNovaPoshta && !cityRef) errs.city = 'Оберіть місто зі списку';
    if (!address.trim()) {
      errs.address = isPickup
        ? 'Оберіть адресу самовивозу'
        : isWarehouseCarrier
          ? 'Вкажіть відділення або поштомат'
          : 'Вкажіть адресу доставки';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit?.({ firstName, lastName, phone, city, deliveryMethodId, address, comment });

    navigate('/payment', {
      state: {
        items,
        itemsCount,
        goodsTotal,
        cashback,
        deliveryPrice,
        deliveryLabel: selectedMethod
          ? `${selectedMethod.name}${city ? `, ${city}` : ''}`
          : city,
        firstName,
        lastName,
        phone,
        address,
        comment,
      },
    });
  };

  return (
    <div className={styles.pageWrapper}>
      <Header />

      <main className={styles.checkoutPage}>
        <nav className={styles.crumbs} aria-label="Навігація">
          <Link to="/">Головна</Link>
          <span>/</span>
          <Link to="/cart">Кошик</Link>
          <span>/</span>
          <span>Оформлення замовлення</span>
        </nav>

        <ol className={styles.stepper}>
          <li className={styles.stepActive}>
            <span className={styles.stepNumber}>1</span>Доставка
          </li>
          <li className={styles.stepperArrow}>→</li>
          <li>
            <span className={styles.stepNumber}>2</span>Оплата
          </li>
          <li className={styles.stepperArrow}>→</li>
          <li>
            <span className={styles.stepNumber}>3</span>Підтвердження
          </li>
        </ol>

        <div className={styles.body}>
          <form className={`${styles.card} ${styles.form}`} onSubmit={handleSubmit} noValidate>
            <h1 className={styles.formTitle}>Дані для доставки</h1>

            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label htmlFor="firstName">Ім'я</label>
                <input
                  id="firstName"
                  type="text"
                  placeholder="Ваше ім'я"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(e) => { setFirstName(e.target.value); setErrors((prev) => ({ ...prev, firstName: undefined })); }}
                />
                {errors.firstName && <span className={styles.err}>{errors.firstName}</span>}
              </div>
              <div className={styles.field}>
                <label htmlFor="lastName">Прізвище</label>
                <input
                  id="lastName"
                  type="text"
                  placeholder="Ваше прізвище"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(e) => { setLastName(e.target.value); setErrors((prev) => ({ ...prev, lastName: undefined })); }}
                />
                {errors.lastName && <span className={styles.err}>{errors.lastName}</span>}
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="phone">Номер телефону</label>
              <input
                id="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="+380 XX XXX XX XX"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setErrors((prev) => ({ ...prev, phone: undefined })); }}
              />
              {errors.phone && <span className={styles.err}>{errors.phone}</span>}
            </div>

            {needsCity && (
              <div className={`${styles.field} ${styles.relative}`} ref={cityBoxRef}>
                <label htmlFor="city">Місто</label>
                <input
                  id="city"
                  type="text"
                  placeholder={isNovaPoshta ? 'Почніть вводити назву міста...' : 'Місто'}
                  value={city}
                  onChange={(e) => { handleCityChange(e.target.value); setErrors((prev) => ({ ...prev, city: undefined })); }}
                  onFocus={() => cityResults.length > 0 && setCityOpen(true)}
                  autoComplete="off"
                />
                {isNovaPoshta && cityOpen && cityResults.length > 0 && (
                  <div className={styles.suggestDropdown}>
                    {cityResults.map((c) => (
                      <div key={c.ref} className={styles.suggestItem} onClick={() => handleSelectCity(c)}>
                        {c.name} <span className={styles.suggestMeta}>{c.area}</span>
                      </div>
                    ))}
                  </div>
                )}
                {errors.city && <span className={styles.err}>{errors.city}</span>}
              </div>
            )}

            <p className={styles.methodsLabel}>Спосіб доставки</p>
            <div className={styles.methods} role="radiogroup" aria-label="Спосіб доставки">
              {deliveryMethods.map((method) => {
                const selected = method.id === deliveryMethodId;
                return (
                  <label
                    key={method.id}
                    className={`${styles.method} ${selected ? styles.methodSelected : ''}`}
                  >
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value={method.id}
                      checked={selected}
                      className={styles.hiddenRadio}
                      onChange={() => {
                        setDeliveryMethodId(method.id);
                        setCityRef('');
                        setAddress('');
                        setErrors((prev) => ({ ...prev, city: undefined, address: undefined }));
                      }}
                    />
                    <span className={styles.radio} aria-hidden="true" />
                    <span className={styles.methodText}>
                      <span className={styles.methodName}>{method.name}</span>
                      <span className={styles.methodMeta}>
                        {method.eta} {method.price > 0 ? `${fmt(method.price)} ${UAH}` : 'безкоштовно'}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>

            {isPickup ? (
              <div className={styles.field}>
                <label htmlFor="pickupAddress">{addressLabel}</label>
                <div className={styles.selectWrap}>
                  <select
                    id="pickupAddress"
                    className={styles.select}
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      setErrors((prev) => ({ ...prev, address: undefined }));
                    }}
                  >
                    <option value="" disabled>Оберіть адресу магазину</option>
                    {pickupPoints.map((p) => (
                      <option key={p.id} value={p.address}>{p.address}</option>
                    ))}
                  </select>
                </div>
                {errors.address && <span className={styles.err}>{errors.address}</span>}
              </div>
            ) : (
              <div className={`${styles.field} ${styles.addressField} ${styles.relative}`} ref={addressBoxRef}>
                <label htmlFor="address">{addressLabel}</label>
                <input
                  id="address"
                  type="text"
                  placeholder={
                    isNovaPoshta
                      ? (cityRef ? 'Оберіть або знайдіть відділення...' : 'Спочатку оберіть місто зі списку')
                      : isUkrposhta
                        ? 'Відділення або поштомат Укрпошти'
                        : 'Вулиця, будинок, квартира'
                  }
                  value={address}
                  disabled={isNovaPoshta && !cityRef}
                  onChange={(e) => { handleAddressChange(e.target.value); setErrors((prev) => ({ ...prev, address: undefined })); }}
                  onFocus={handleAddressFocus}
                  autoComplete="off"
                />
                {isNovaPoshta && warehouseOpen && warehouseResults.length > 0 && (
                  <div className={styles.suggestDropdown}>
                    {warehouseResults.map((w) => (
                      <div key={w.ref} className={styles.suggestItem} onClick={() => handleSelectWarehouse(w)}>
                        {w.description}
                      </div>
                    ))}
                  </div>
                )}
                {errors.address && <span className={styles.err}>{errors.address}</span>}
              </div>
            )}

            <button type="submit" className={styles.submit}>
              Далі → оплата
            </button>
          </form>

          <div className={styles.rightCol}>
            <aside className={`${styles.card} ${styles.summary}`}>
              <h2>Разом</h2>

              <div className={styles.row}>
                <span>Товари ({itemsCount})</span>
                <span>{fmt(goodsTotal)} {UAH}</span>
              </div>
              <div className={styles.row}>
                <span>Доставка</span>
                <span>{deliveryPrice > 0 ? `${fmt(deliveryPrice)} ${UAH}` : 'безкоштовно'}</span>
              </div>
              <div className={`${styles.row} ${styles.rowCashback}`}>
                <span>Кешбек</span>
                <span>+ {cashback} бонусів</span>
              </div>
              <div className={`${styles.row} ${styles.rowTotal}`}>
                <span>До сплати</span>
                <span>{fmt(total)} {UAH}</span>
              </div>

              <div className={styles.promo}>
                <input
                  type="text"
                  placeholder="Промокод"
                  autoCapitalize="characters"
                  autoComplete="off"
                  value={promo}
                  onChange={(e) => setPromo(e.target.value)}
                />
                <button type="button" onClick={() => onApplyPromo?.(promo)}>
                  Ок
                </button>
              </div>
            </aside>

            <section className={`${styles.card} ${styles.commentCard}`}>
              <h2>Коментар</h2>
              <textarea
                placeholder="Коментар до замовлення (необов'язково)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}