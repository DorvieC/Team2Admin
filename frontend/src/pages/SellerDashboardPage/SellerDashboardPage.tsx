import { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './SellerDashboardPage.module.css';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import SellerSidebar from '../../components/Sellersidebar/Sellersidebar';
import { sellersApi } from '../../api/sellers';
import { productsApi } from '../../api/products';
import { reviewsApi } from '../../api/reviews';
import { ordersApi, type OrderDto } from '../../api/orders';
import type { Product, Review } from '../../types';

const LOW_STOCK_THRESHOLD = 10;

const WEEKDAY_LABELS = ['Понеділок', 'Вівторок', 'Середа', 'Четвер', "П'ятниця", 'Субота', 'Неділя'];
const WEEKDAY_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];

export default function SellerDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [orders, setOrders] = useState<OrderDto[]>([]);

  useEffect(() => {
    if (!user || user.role !== 'Seller') return;
    sellersApi.getMine(user.email).then(async (seller) => {
      if (!seller) return;
      const search = await productsApi.search({ sellerId: seller.id, pageSize: 200 }).catch(() => ({ items: [] as Product[] }));
      setProducts(search.items);
      const perProduct = await Promise.all(search.items.map((p) => reviewsApi.getByProduct(p.id).catch(() => [] as Review[])));
      setReviews(perProduct.flat());
    });
    ordersApi.getBySeller().then(setOrders).catch(() => setOrders([]));
  }, [user]);

  if (!user || user.role !== 'Seller') {
    return <Navigate to="/login" replace />;
  }

  const ratings = products.filter((p) => p.rating != null).map((p) => p.rating as number);
  const avgRating = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : '—';
  const lowStockCount = products.filter((p) => (p.quantity ?? 0) > 0 && (p.quantity ?? 0) < LOW_STOCK_THRESHOLD).length;
  const outOfStockCount = products.filter((p) => (p.quantity ?? 0) <= 0).length;

  const STATS = [
    { title: 'Товарів у каталозі', value: String(products.length), note: '', positive: true },
    { title: 'Рейтинг магазину', value: avgRating, note: `${reviews.length} відгуків`, positive: true },
    { title: 'Закінчуються', value: String(lowStockCount), note: `менше ${LOW_STOCK_THRESHOLD} шт`, positive: false },
    { title: 'Немає в наявності', value: String(outOfStockCount), note: '', positive: false },
  ];

  const today = new Date();
  const mondayOffset = (today.getDay() + 6) % 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - mondayOffset);
  monday.setHours(0, 0, 0, 0);

  const WEEK = WEEKDAY_LABELS.map((label, i) => {
    const shortLabel = WEEKDAY_SHORT[i];
    const dayStart = new Date(monday);
    dayStart.setDate(monday.getDate() + i);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayStart.getDate() + 1);
    const value = orders
      .filter((o) => {
        if (o.orderStatus !== 'Paid' || !o.createdDate) return false;
        const d = new Date(o.createdDate);
        return d >= dayStart && d < dayEnd;
      })
      .reduce((sum, o) => sum + o.totalAmount, 0);
    return { day: label, shortLabel, value };
  });
  const maxWeek = Math.max(...WEEK.map((w) => w.value), 1);

  const ATTENTION = [
    ...(lowStockCount > 0 ? [{ title: `${lowStockCount} товарів закінчуються`, sub: `Залишок менше ${LOW_STOCK_THRESHOLD} шт` }] : []),
    ...(outOfStockCount > 0 ? [{ title: `${outOfStockCount} товарів немає в наявності`, sub: 'Поповніть залишки' }] : []),
    ...(reviews.length === 0 ? [{ title: 'Поки немає відгуків', sub: 'Додайте товари, щоб отримати перші відгуки' }] : []),
  ];

  return (
    <div className={styles.page}>
      <Header />

      <div className={styles.container}>
        <nav className={styles.breadcrumbs}>
          <Link to="/">Головна</Link> / <span>Кабінет продавця</span> / <span>Дашборд</span>
        </nav>

        <div className={styles.greenArea}>
          <SellerSidebar />

          {/* ── Основная часть ── */}
          <main className={styles.main}>
            <div className={styles.titleRow}>
              <h1 className={styles.title}>Дашборд - {user.name}</h1>
              <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
                Вийти
              </button>
            </div>

            <div className={styles.stats}>
              {STATS.map((s) => (
                <div key={s.title} className={styles.statCard}>
                  <span className={styles.statTitle}>{s.title}</span>
                  <span className={styles.statValue}>{s.value}</span>
                  <span className={s.positive ? styles.statUp : styles.statDown}>{s.note}</span>
                </div>
              ))}
            </div>

            <div className={styles.bottom}>
              <section className={styles.col}>
                <h3 className={styles.sectionTitle}>Продажі за тиждень</h3>
                <div className={styles.chart}>
                  {WEEK.map((w) => (
                    <div key={w.day} className={styles.barCol}>
                      <div className={styles.barTrack}>
                        <div
                          className={styles.bar}
                          style={{ height: `${(w.value / maxWeek) * 90}%` }}
                          title={`${w.day}: ${w.value.toLocaleString('uk-UA')} ₴`}
                        />
                      </div>
                      <span className={styles.barLabel}>{w.shortLabel}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className={styles.col}>
                <h3 className={styles.sectionTitle}>Потребує уваги</h3>
                <div className={styles.attention}>
                  {ATTENTION.map((a) => (
                    <div key={a.title} className={styles.attentionItem}>
                      <div>
                        <div className={styles.attentionTitle}>{a.title}</div>
                        <div className={styles.attentionSub}>{a.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}