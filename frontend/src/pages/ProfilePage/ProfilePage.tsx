import { useState, useEffect, useCallback, type ReactElement } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import { useAuth } from '../../context/AuthContext';
import { profileApi, type ProfileDto } from '../../api/profile';
import { ordersApi } from '../../api/orders';
import { productsApi } from '../../api/products';
import { reviewsApi } from '../../api/reviews';
import type { OrderDto, Product, Review } from '../../types';
import { loadCompareIds, removeFromCompare, clearCompare } from '../../utils/compareList';
import {
  UserIcon,
  BoxIcon,
  ReturnIcon,
  ScaleIcon,
  StarIcon,
  ListCheckIcon,
  TagIcon,
  CardIcon,
  BellIcon,
  HeartIcon,
  WalletIcon,
} from '../../components/NavIcons/NavIcons';
import styles from './ProfilePage.module.css';

const FAVORITES_KEY = 'blitzmall_favorites';

function loadFavoriteIds(): number[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? (JSON.parse(raw) as number[]) : [];
  } catch {
    return [];
  }
}

const STATUS_LABEL: Record<string, string> = {
  Pending: 'Очікує',
  Paid: 'Оплачено',
  Processing: 'Обробляється',
  Shipped: 'В дорозі',
  Delivered: 'Доставлено',
  Cancelled: 'Скасовано',
};

const RETURN_REASONS = [
  'Не підійшов розмір',
  'Товар не відповідає опису',
  'Передумав',
  'Товар пошкоджено',
  'Інше',
];

const LEVELS = [
  { name: 'Бронзовий', from: 0, cashback: 2 },
  { name: 'Срібний', from: 5000, cashback: 3 },
  { name: 'Золотий', from: 15000, cashback: 5 },
];

type Tab =
  | 'profile'
  | 'orders'
  | 'returns'
  | 'compare'
  | 'reviews'
  | 'subscriptions'
  | 'coupons'
  | 'cards'
  | 'notifications'
  | 'favorites';

const NAV_ITEMS: { id: Tab; label: string; Icon: (props: { size?: number }) => ReactElement }[] = [
  { id: 'profile', label: 'Профіль', Icon: UserIcon },
  { id: 'orders', label: 'Замовлення', Icon: BoxIcon },
  { id: 'returns', label: 'Повернення', Icon: ReturnIcon },
  { id: 'compare', label: 'Порівняння', Icon: ScaleIcon },
  { id: 'reviews', label: 'Мої відгуки', Icon: StarIcon },
  { id: 'subscriptions', label: 'Підписки', Icon: ListCheckIcon },
  { id: 'coupons', label: 'Купони і бонуси', Icon: TagIcon },
  { id: 'cards', label: 'Мої картки', Icon: CardIcon },
  { id: 'notifications', label: 'Сповіщення', Icon: BellIcon },
];

const priceFormat = new Intl.NumberFormat('uk-UA');
const formatDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '';

interface PendingReviewItem {
  productId: number;
  product: Product;
}

interface PublishedReviewItem {
  review: Review;
  product: Product | null;
}

function ClickableStars({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className={styles.starsInput}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={styles.starBtn}
          onClick={() => onChange(star)}
          aria-label={`${star} з 5`}
        >
          <span style={{ color: star <= value ? '#f5a623' : '#d1d5db' }}>★</span>
        </button>
      ))}
    </div>
  );
}

export default function ProfilePage() {
  const { user, isAuthenticated, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const [tab, setTab] = useState<Tab>('profile');
  const [profile, setProfile] = useState<ProfileDto | null>(null);
  const [loading, setLoading] = useState(true);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [saveErr, setSaveErr] = useState('');

  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);

  const [compareIds, setCompareIds] = useState<number[]>([]);
  const [compareProducts, setCompareProducts] = useState<Product[]>([]);
  const [compareLoading, setCompareLoading] = useState(false);
  const [diffOnly, setDiffOnly] = useState(false);

  const [returnOrderId, setReturnOrderId] = useState('');
  const [returnReason, setReturnReason] = useState(RETURN_REASONS[0]);
  const [returnComment, setReturnComment] = useState('');
  const [returnMsg, setReturnMsg] = useState('');

  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [publishedReviews, setPublishedReviews] = useState<PublishedReviewItem[]>([]);
  const [pendingReviews, setPendingReviews] = useState<PendingReviewItem[]>([]);
  const [reviewsSubTab, setReviewsSubTab] = useState<'published' | 'pending'>('published');
  const [ratingDraft, setRatingDraft] = useState<Record<number, number>>({});
  const [textDraft, setTextDraft] = useState<Record<number, string>>({});
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [savingReview, setSavingReview] = useState<number | null>(null);

  const [cardAddMsg, setCardAddMsg] = useState('');

  const loadProfile = useCallback(() => {
    profileApi
      .getMe()
      .then((p) => {
        setProfile(p);
        const parts = p.name.trim().split(' ');
        setFirstName(parts[0] ?? '');
        setLastName(parts.slice(1).join(' '));
        setPhone(p.phone ?? '');
        setBirthDate(p.birthDate ? p.birthDate.slice(0, 10) : '');
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    loadProfile();
    ordersApi
      .getMyOrders()
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setOrdersLoading(false));
  }, [isAuthenticated, loadProfile]);

  useEffect(() => {
    const ids = loadFavoriteIds();
    if (ids.length === 0) {
      setFavoriteProducts([]);
      return;
    }
    Promise.all(ids.map((id) => productsApi.getById(id).catch(() => null))).then((results) => {
      setFavoriteProducts(results.filter((p): p is Product => !!p));
    });
  }, [tab]);

  useEffect(() => {
    if (tab !== 'compare') return;
    const sync = () => setCompareIds(loadCompareIds());
    sync();
    window.addEventListener('blitzmall_compare_change', sync);
    return () => window.removeEventListener('blitzmall_compare_change', sync);
  }, [tab]);

  useEffect(() => {
    if (tab !== 'compare') return;
    if (compareIds.length === 0) {
      setCompareProducts([]);
      return;
    }
    setCompareLoading(true);
    Promise.all(compareIds.map((id) => productsApi.getById(id).catch(() => null)))
      .then((results) => setCompareProducts(results.filter((p): p is Product => !!p)))
      .finally(() => setCompareLoading(false));
  }, [tab, compareIds]);

  useEffect(() => {
    if (!isAuthenticated || tab !== 'reviews') return;
    setReviewsLoading(true);
    reviewsApi
      .getAll()
      .then(setAllReviews)
      .catch(() => setAllReviews([]))
      .finally(() => setReviewsLoading(false));
  }, [isAuthenticated, tab]);

  useEffect(() => {
    if (!profile || tab !== 'reviews') return;

    const myReviews = allReviews.filter((r) => r.userId === profile.id);
    const reviewedProductIds = new Set(myReviews.map((r) => r.productId));

    const purchasedProductIds = new Set<number>();
    orders.forEach((o) => {
      if (o.orderStatus === 'Cancelled') return;
      o.items.forEach((i) => purchasedProductIds.add(i.productId));
    });

    const pendingIds = [...purchasedProductIds].filter((id) => !reviewedProductIds.has(id));

    Promise.all(
      myReviews.map(async (review) => ({
        review,
        product: await productsApi.getById(review.productId).catch(() => null),
      }))
    ).then(setPublishedReviews);

    Promise.all(
      pendingIds.map(async (productId) => {
        const product = await productsApi.getById(productId).catch(() => null);
        return product ? { productId, product } : null;
      })
    ).then((results) => setPendingReviews(results.filter((r): r is PendingReviewItem => !!r)));
  }, [profile, allReviews, orders, tab]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg('');
    setSaveErr('');
    try {
      const name = `${firstName.trim()} ${lastName.trim()}`.trim();
      const updated = await profileApi.updateMe({
        name: name || undefined,
        phone: phone || undefined,
        birthDate: birthDate ? new Date(birthDate).toISOString() : undefined,
      });
      setProfile(updated);
      updateUser({ name: updated.name, phone: updated.phone });
      setSaveMsg('Зміни збережено');
    } catch {
      setSaveErr('Не вдалося зберегти зміни. Спробуйте ще раз.');
    } finally {
      setSaving(false);
    }
  };

  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReturnMsg(
      'Функція оформлення повернень поки не підключена до бекенду — заявку поки неможливо надіслати.'
    );
  };

  const handleSubmitReview = async (productId: number) => {
    const rating = ratingDraft[productId];
    if (!rating) return;
    setSavingReview(productId);
    try {
      await reviewsApi.create({ productId, rating, text: textDraft[productId] || undefined });
      const refreshed = await reviewsApi.getAll();
      setAllReviews(refreshed);
      setRatingDraft((prev) => ({ ...prev, [productId]: 0 }));
      setTextDraft((prev) => ({ ...prev, [productId]: '' }));
    } catch {
      // лишаємо форму відкритою, щоб користувач міг спробувати ще раз
    } finally {
      setSavingReview(null);
    }
  };

  const handleUpdateReview = async (reviewId: number, productId: number) => {
    const rating = ratingDraft[productId];
    setSavingReview(productId);
    try {
      await reviewsApi.update(reviewId, {
        rating: rating || undefined,
        text: textDraft[productId],
      });
      const refreshed = await reviewsApi.getAll();
      setAllReviews(refreshed);
      setEditingReviewId(null);
    } catch {
      // лишаємо форму відкритою для повторної спроби
    } finally {
      setSavingReview(null);
    }
  };

  const handleRemoveCompare = (productId: number) => {
    setCompareIds(removeFromCompare(productId));
  };

  const handleClearCompare = () => {
    clearCompare();
    setCompareIds([]);
  };

  if (!isAuthenticated || !user) {
    return (
      <div className={styles.page}>
        <Header />
        <div style={{ maxWidth: 600, margin: '80px auto', textAlign: 'center' }}>
          <h2>Ви не авторизовані</h2>
          <Link to="/login">Увійти</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const initials = (profile?.name ?? user.name)
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const activeOrdersCount = orders.filter((o) => o.orderStatus !== 'Cancelled').length;

  const paidOrdersThisYear = orders.filter(
    (o) =>
      o.orderStatus === 'Paid' &&
      o.createdDate &&
      new Date(o.createdDate).getFullYear() === new Date().getFullYear()
  );
  const accruedThisYear = paidOrdersThisYear.reduce((sum, o) => sum + Math.floor(o.totalAmount * 0.02), 0);

  const compareRows = compareProducts.length
    ? [
        { label: 'Наявність', get: (p: Product) => ((p.quantity ?? 0) > 0 ? 'В наявності' : 'Під замовлення') },
        { label: 'Категорія', get: (p: Product) => p.categoryName ?? '—' },
        { label: 'Бренд', get: (p: Product) => p.brandName ?? '—' },
        { label: 'Рейтинг', get: (p: Product) => (p.rating ? `${p.rating.toFixed(1)} / 5` : '—') },
        { label: 'Відгуків', get: (p: Product) => String(p.reviewCount ?? 0) },
      ].filter((row) => {
        if (!diffOnly) return true;
        const values = compareProducts.map((p) => row.get(p));
        return new Set(values).size > 1;
      })
    : [];

  return (
    <div className={styles.page}>
      <Header />

      <div className={styles.inner}>
        <div className={styles.crumbs}>
          <Link to="/">Головна</Link>
          <span>/</span>
          <span className={styles.crumbsCurrent}>Особистий кабінет</span>
        </div>

        <div className={styles.panel}>
          <div className={styles.layout}>
            <aside className={styles.sidebar}>
              <h2 className={styles.sidebarTitle}>Особистий кабінет</h2>
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`${styles.navItem} ${tab === item.id ? styles.navActive : ''}`}
                  onClick={() => setTab(item.id)}
                >
                  <item.Icon size={20} />
                  {item.label}
                </button>
              ))}
            </aside>

            <div className={styles.main}>
              {tab === 'profile' && (
                <>
                  <div className={styles.statsRow}>
                    <button type="button" className={styles.statCard} onClick={() => setTab('orders')}>
                      <span className={styles.statIcon}><BoxIcon size={22} /></span>
                      <span className={styles.statText}>
                        <span className={styles.statLabel}>Замовлення</span>
                        <span className={styles.statValue}>{activeOrdersCount} активних</span>
                      </span>
                    </button>
                    <button type="button" className={styles.statCard} onClick={() => setTab('favorites')}>
                      <span className={styles.statIcon}><HeartIcon size={22} /></span>
                      <span className={styles.statText}>
                        <span className={styles.statLabel}>Обране</span>
                        <span className={styles.statValue}>{favoriteProducts.length} товари</span>
                      </span>
                    </button>
                    <button type="button" className={styles.statCard} onClick={() => setTab('coupons')}>
                      <span className={styles.statIcon}><WalletIcon size={22} /></span>
                      <span className={styles.statText}>
                        <span className={styles.statLabel}>Бонуси</span>
                        <span className={styles.statValue}>{profile?.bonuses ?? 0} доступно</span>
                      </span>
                    </button>
                  </div>

                  <div className={styles.topRow}>
                    <div className={styles.leftCol}>
                      <div className={styles.identityRow}>
                        <div className={styles.avatar}>{initials || 'ОК'}</div>
                        <div className={styles.identityInfo}>
                          <h1 className={styles.name}>{profile?.name ?? user.name}</h1>
                          <div className={styles.contactRow}>
                            <span className={styles.contactEmail}>{profile?.email ?? user.email}</span>
                            {phone && <span className={styles.contactPhone}>{phone}</span>}
                          </div>
                        </div>
                      </div>

                      <form onSubmit={handleSave}>
                        <div className={styles.fieldsGrid}>
                          <div className={styles.field}>
                            <label className={styles.fieldLabel}>Ім'я</label>
                            <input
                              className={styles.fieldInput}
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                              placeholder="Ваше ім'я"
                            />
                          </div>
                          <div className={styles.field}>
                            <label className={styles.fieldLabel}>Прізвище</label>
                            <input
                              className={styles.fieldInput}
                              value={lastName}
                              onChange={(e) => setLastName(e.target.value)}
                              placeholder="Ваше прізвище"
                            />
                          </div>
                          <div className={styles.field}>
                            <label className={styles.fieldLabel}>Телефон</label>
                            <input
                              className={styles.fieldInput}
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              placeholder="+380 XX XXX XX XX"
                            />
                          </div>
                          <div className={styles.field}>
                            <label className={styles.fieldLabel}>Дата народження</label>
                            <input
                              className={styles.fieldInput}
                              type="date"
                              value={birthDate}
                              onChange={(e) => setBirthDate(e.target.value)}
                            />
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 24, flexWrap: 'wrap' }}>
                          <button type="submit" className={styles.saveBtn} disabled={saving}>
                            {saving ? 'Збереження...' : 'Зберегти зміни'}
                          </button>
                          <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
                            Вийти
                          </button>
                          {saveMsg && <span className={styles.saveMsg}>{saveMsg}</span>}
                          {saveErr && <span className={styles.saveErr}>{saveErr}</span>}
                        </div>
                      </form>
                    </div>

                    <div className={styles.loyaltyCard}>
                      <h3 className={styles.loyaltyTitle}>{profile?.level ?? 'Бронзовий'} рівень</h3>
                      <p className={styles.loyaltyBonuses}>{profile?.bonuses ?? 0} бонусів</p>
                      <p className={styles.loyaltyCashback}>Кешбек 2% з кожного замовлення</p>
                      <div className={styles.progressTrack}>
                        <div
                          className={styles.progressFill}
                          style={{ width: `${profile?.levelProgressPercent ?? 0}%` }}
                        />
                      </div>
                      <p className={styles.loyaltyHint}>{profile?.nextLevelHint ?? ''}</p>
                      <button type="button" className={styles.spendBtn} onClick={() => setTab('coupons')}>
                        Витратити
                      </button>
                    </div>
                  </div>
                </>
              )}

              {tab === 'orders' && (
                <div className={styles.ordersList}>
                  {ordersLoading ? (
                    <div className={styles.placeholder}>Завантаження...</div>
                  ) : orders.length === 0 ? (
                    <div className={styles.placeholder}>У вас ще немає замовлень.</div>
                  ) : (
                    orders.map((order) => (
                      <div key={order.id} className={styles.orderRow}>
                        <div className={styles.orderRowLeft}>
                          <span className={styles.orderId}>Замовлення #{order.id}</span>
                          <span className={styles.orderMeta}>
                            {order.createdDate ? new Date(order.createdDate).toLocaleDateString('uk-UA') : ''} ·{' '}
                            {order.items.length} товар(и) · {order.deliveryAddress}
                          </span>
                        </div>
                        <span className={styles.orderStatusBadge}>
                          {STATUS_LABEL[order.orderStatus] ?? order.orderStatus}
                        </span>
                        <span className={styles.orderTotal}>{order.totalAmount.toLocaleString('uk-UA')} ₴</span>
                      </div>
                    ))
                  )}
                </div>
              )}

              {tab === 'returns' && (
                <div className={styles.returnsWrap}>
                  <h1 className={styles.sectionH1}>Повернення та обміни</h1>

                  <div className={styles.placeholder} style={{ marginBottom: 24 }}>
                    У вас ще немає заявок на повернення.
                  </div>

                  <h2 className={styles.sectionH1} style={{ fontSize: 24, marginBottom: 16 }}>
                    Створити заявку
                  </h2>

                  <form onSubmit={handleReturnSubmit} className={styles.returnForm}>
                    <div className={styles.returnFormRow}>
                      <div className={styles.field}>
                        <label className={styles.fieldLabel}>Замовлення</label>
                        <select
                          className={styles.fieldInput}
                          value={returnOrderId}
                          onChange={(e) => setReturnOrderId(e.target.value)}
                        >
                          <option value="">Оберіть замовлення</option>
                          {orders.map((o) => (
                            <option key={o.id} value={o.id}>
                              #{o.id} · {o.totalAmount.toLocaleString('uk-UA')} ₴
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className={styles.field}>
                        <label className={styles.fieldLabel}>Причина</label>
                        <select
                          className={styles.fieldInput}
                          value={returnReason}
                          onChange={(e) => setReturnReason(e.target.value)}
                        >
                          {RETURN_REASONS.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className={styles.field}>
                      <label className={styles.fieldLabel}>Коментар</label>
                      <textarea
                        className={styles.returnTextarea}
                        value={returnComment}
                        onChange={(e) => setReturnComment(e.target.value)}
                        placeholder="Опишіть проблему"
                        rows={4}
                      />
                    </div>

                    <button type="submit" className={styles.saveBtn} disabled={!returnOrderId}>
                      Надіслати заявку
                    </button>
                    {returnMsg && <p className={styles.returnMsg}>{returnMsg}</p>}
                  </form>
                </div>
              )}

              {tab === 'compare' && (
                <div className={styles.compareWrap}>
                  <div className={styles.compareHead}>
                    <div>
                      <h1 className={styles.sectionH1}>Порівняння товарів</h1>
                      <p className={styles.compareCount}>{compareProducts.length} товарів</p>
                    </div>
                    {compareProducts.length > 0 && (
                      <div className={styles.compareActions}>
                        <label className={styles.diffToggle}>
                          <input type="checkbox" checked={diffOnly} onChange={(e) => setDiffOnly(e.target.checked)} />
                          Лише відмінності
                        </label>
                        <button type="button" className={styles.clearCompareBtn} onClick={handleClearCompare}>
                          Очистити список
                        </button>
                      </div>
                    )}
                  </div>

                  {compareLoading ? (
                    <div className={styles.placeholder}>Завантаження...</div>
                  ) : compareProducts.length === 0 ? (
                    <div className={styles.compareEmpty}>
                      <span className={styles.compareEmptyIcon}>⚖</span>
                      <p className={styles.compareEmptyCount}>0 товарів</p>
                      <p className={styles.placeholderSub}>
                        Додайте товари до порівняння натиснувши іконку ⚖ на картці товару в каталозі.
                      </p>
                    </div>
                  ) : (
                    <div className={styles.compareTable}>
                      <div className={styles.compareProductsRow}>
                        {compareProducts.map((p) => (
                          <div key={p.id} className={styles.compareProductCell}>
                            <button
                              type="button"
                              className={styles.compareRemoveBtn}
                              onClick={() => handleRemoveCompare(p.id)}
                              aria-label="Прибрати з порівняння"
                            >
                              ×
                            </button>
                            {p.imageUrl && <img src={p.imageUrl} alt={p.name} className={styles.compareProductImg} />}
                            <Link to={`/product/${p.id}`} className={styles.compareProductName}>
                              {p.name}
                            </Link>
                            <p className={styles.compareProductPrice}>{priceFormat.format(p.price)} ₴</p>
                          </div>
                        ))}
                      </div>

                      <div className={styles.compareGroupHead}>Основні характеристики</div>
                      {compareRows.map((row) => (
                      <div key={row.label} className={styles.compareRow}>
                        <span className={styles.compareRowLabel}>{row.label}</span>
                        {compareProducts.map((p) => (
                          <span key={p.id} className={styles.compareRowValue} data-label={p.name}>
                            {row.get(p)}
                          </span>
                        ))}
                      </div>
                    ))}
                    </div>
                  )}
                </div>
              )}

              {tab === 'reviews' && (
                <div className={styles.reviewsWrap}>
                  <h1 className={styles.sectionH1}>Мої відгуки</h1>

                  <div className={styles.reviewsTabs}>
                    <button
                      type="button"
                      className={`${styles.reviewsTabBtn} ${reviewsSubTab === 'published' ? styles.reviewsTabActive : ''}`}
                      onClick={() => setReviewsSubTab('published')}
                    >
                      Опубліковані {publishedReviews.length}
                    </button>
                    <button
                      type="button"
                      className={`${styles.reviewsTabBtn} ${reviewsSubTab === 'pending' ? styles.reviewsTabActive : ''}`}
                      onClick={() => setReviewsSubTab('pending')}
                    >
                      Очікують {pendingReviews.length}
                    </button>
                  </div>

                  {reviewsLoading ? (
                    <div className={styles.placeholder}>Завантаження...</div>
                  ) : reviewsSubTab === 'pending' ? (
                    pendingReviews.length === 0 ? (
                      <div className={styles.placeholder}>Усі куплені товари вже оцінено.</div>
                    ) : (
                      pendingReviews.map(({ productId, product }) => (
                        <div key={productId} className={styles.pendingReviewCard}>
                          <div className={styles.pendingReviewHead}>
                            {product.imageUrl && (
                              <img src={product.imageUrl} alt={product.name} className={styles.reviewProductImg} />
                            )}
                            <Link to={`/product/${productId}`} className={styles.reviewProductName}>
                              {product.name}
                            </Link>
                          </div>
                          <ClickableStars
                            value={ratingDraft[productId] ?? 0}
                            onChange={(v) => setRatingDraft((prev) => ({ ...prev, [productId]: v }))}
                          />
                          <textarea
                            className={styles.returnTextarea}
                            placeholder="Поділіться враженням про товар (необов'язково)"
                            value={textDraft[productId] ?? ''}
                            onChange={(e) => setTextDraft((prev) => ({ ...prev, [productId]: e.target.value }))}
                            rows={2}
                          />
                          <button
                            type="button"
                            className={styles.saveBtn}
                            style={{ width: 'auto', height: 44, fontSize: 16 }}
                            disabled={!ratingDraft[productId] || savingReview === productId}
                            onClick={() => handleSubmitReview(productId)}
                          >
                            {savingReview === productId ? 'Збереження...' : 'Оцінити'}
                          </button>
                        </div>
                      ))
                    )
                  ) : publishedReviews.length === 0 ? (
                    <div className={styles.placeholder}>Ви ще не залишали відгуків.</div>
                  ) : (
                    publishedReviews.map(({ review, product }) => (
                      <div key={review.id} className={styles.publishedReviewCard}>
                        <div className={styles.pendingReviewHead}>
                          {product?.imageUrl && (
                            <img src={product.imageUrl} alt={product.name} className={styles.reviewProductImg} />
                          )}
                          <div>
                            <Link to={`/product/${review.productId}`} className={styles.reviewProductName}>
                              {product?.name ?? `Товар #${review.productId}`}
                            </Link>
                            <p className={styles.reviewDate}>{formatDate(review.createdDate)}</p>
                          </div>
                        </div>

                        {editingReviewId === review.id ? (
                          <>
                            <ClickableStars
                              value={ratingDraft[review.productId] ?? review.rating}
                              onChange={(v) => setRatingDraft((prev) => ({ ...prev, [review.productId]: v }))}
                            />
                            <textarea
                              className={styles.returnTextarea}
                              value={textDraft[review.productId] ?? review.text ?? ''}
                              onChange={(e) =>
                                setTextDraft((prev) => ({ ...prev, [review.productId]: e.target.value }))
                              }
                              rows={2}
                            />
                            <button
                              type="button"
                              className={styles.saveBtn}
                              style={{ width: 'auto', height: 44, fontSize: 16 }}
                              disabled={savingReview === review.productId}
                              onClick={() => handleUpdateReview(review.id, review.productId)}
                            >
                              {savingReview === review.productId ? 'Збереження...' : 'Зберегти'}
                            </button>
                          </>
                        ) : (
                          <>
                            <ClickableStars value={review.rating} onChange={() => undefined} />
                            {review.text && <p className={styles.reviewText}>{review.text}</p>}
                            <button
                              type="button"
                              className={styles.editReviewBtn}
                              onClick={() => {
                                setEditingReviewId(review.id);
                                setRatingDraft((prev) => ({ ...prev, [review.productId]: review.rating }));
                                setTextDraft((prev) => ({ ...prev, [review.productId]: review.text ?? '' }));
                              }}
                            >
                              ✎ Редагувати
                            </button>
                          </>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {tab === 'subscriptions' && (
                <div className={styles.subsWrap}>
                  <h1 className={styles.sectionH1}>Мої підписки</h1>
                  <div className={styles.placeholder}>
                    Підписки на магазини поки не підключені до бекенду — ця функція ще в розробці.
                  </div>
                </div>
              )}

              {tab === 'coupons' && (
                <div className={styles.couponsWrap}>
                  <h1 className={styles.sectionH1}>Мої купони</h1>
                  <div className={styles.placeholder} style={{ marginBottom: 32 }}>
                    У вас ще немає персональних купонів. Генерація купонів поки не підключена до бекенду.
                  </div>

                  <div className={styles.couponsBonusGrid}>
                    <div>
                      <h2 className={styles.sectionH1} style={{ fontSize: 24, marginBottom: 16 }}>
                        Мої бонуси
                      </h2>
                      <div className={styles.bonusStatsRow}>
                        <div className={styles.bonusStatCard}>
                          <span className={styles.bonusStatValue}>{profile?.bonuses ?? 0} бонусів</span>
                          <button type="button" className={styles.spendBtnSmall}>
                            Витратити
                          </button>
                        </div>
                        <div className={styles.bonusStatCard}>
                          <span className={styles.bonusStatLabel}>Нараховано за рік</span>
                          <span className={styles.bonusStatValue}>{priceFormat.format(accruedThisYear)}</span>
                          <span className={styles.bonusStatSub}>≈ {priceFormat.format(accruedThisYear)} ₴</span>
                        </div>
                      </div>

                      <h2 className={styles.sectionH1} style={{ fontSize: 24, margin: '24px 0 16px' }}>
                        Історія нарахувань
                      </h2>
                      {paidOrdersThisYear.length === 0 ? (
                        <div className={styles.placeholder}>Ще немає нарахувань.</div>
                      ) : (
                        <div className={styles.accrualList}>
                          {paidOrdersThisYear.map((o) => (
                            <div key={o.id} className={styles.accrualRow}>
                              <span>Замовлення BM-{o.id}</span>
                              <span>
                                + {Math.floor(o.totalAmount * 0.02)} {formatDate(o.createdDate)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <div className={styles.levelCard}>
                        <span className={styles.bonusStatLabel}>Рівень</span>
                        <span className={styles.levelCardName}>{profile?.level ?? 'Бронзовий'}</span>
                        <span className={styles.levelCashback}>кешбек {LEVELS.find((l) => l.name === profile?.level)?.cashback ?? 2}%</span>
                      </div>
                      <div className={styles.progressTrack} style={{ margin: '16px 0 8px' }}>
                        <div className={styles.progressFill} style={{ width: `${profile?.levelProgressPercent ?? 0}%` }} />
                      </div>
                      <p className={styles.loyaltyHint}>{profile?.nextLevelHint ?? ''}</p>

                      <div className={styles.levelsTable}>
                        <h3 className={styles.sectionH1} style={{ fontSize: 26, marginBottom: 16 }}>
                          Рівні
                        </h3>
                        {LEVELS.map((lvl) => (
                          <div key={lvl.name} className={styles.levelsRow}>
                            <span>{lvl.name}</span>
                            <span>
                              від {priceFormat.format(lvl.from)} ₴ {lvl.cashback}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {tab === 'cards' && (
                <div className={styles.cardsWrap}>
                  <h1 className={styles.sectionH1}>Мої картки</h1>
                  <div className={styles.placeholder} style={{ marginBottom: 20 }}>
                    У вас ще немає збережених карток. Збереження карток поки не підтримується бекендом — дані
                    картки вводяться заново під час кожної оплати.
                  </div>
                  <button
                    type="button"
                    className={styles.addCardTile}
                    onClick={() => setCardAddMsg('Збереження карток поки не підтримується бекендом.')}
                  >
                    + Додати нову картку
                  </button>
                  {cardAddMsg && <p className={styles.returnMsg}>{cardAddMsg}</p>}

                  <div className={styles.securityNote}>
                    <strong>Ваші дані в безпеці</strong>
                    <p>Не зберігаємо повні номери карток і CVV — платежі захищені 3-D Secure.</p>
                  </div>
                </div>
              )}

              {tab === 'notifications' && (
                <div>
                  <h1 className={styles.sectionH1}>Мої сповіщення</h1>
                  <div className={styles.placeholder}>
                    У вас ще немає сповіщень. Система сповіщень поки не підключена до бекенду.
                  </div>
                </div>
              )}

              {tab === 'favorites' && (
                <div className={styles.favGrid}>
                  {favoriteProducts.length === 0 ? (
                    <div className={styles.placeholder}>У вас ще немає обраних товарів.</div>
                  ) : (
                    favoriteProducts.map((p) => (
                      <Link key={p.id} to={`/product/${p.id}`} className={styles.favCard}>
                        {p.imageUrl && <img src={p.imageUrl} alt={p.name} className={styles.favImg} />}
                        <div className={styles.favBody}>
                          <p className={styles.favName}>{p.name}</p>
                          <p className={styles.favPrice}>{p.price.toLocaleString('uk-UA')} ₴</p>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              )}

              {loading && tab === 'profile' && <div className={styles.placeholder}>Завантаження профілю...</div>}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
