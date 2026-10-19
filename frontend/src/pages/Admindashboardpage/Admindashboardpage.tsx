import { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import AdminSidebar from '../../components/Adminsidebar/Adminsidebar';
import { paymentsApi, type Payment } from '../../api/payments';
import { ordersApi } from '../../api/orders';
import { sellersApi } from '../../api/sellers';
import { productsApi } from '../../api/products';
import { categoriesApi } from '../../api/categories';
import type { Product } from '../../types';
import styles from './Admindashboardpage.module.css';

interface MonthGmv {
  month: string;
  gmv: number;
}

interface CategoryShare {
  name: string;
  percent: number;
}

interface Task {
  id: number;
  title: string;
  subtitle: string;
  to: string;
  soon?: boolean;
}

const ChevronIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m9 6 6 6-6 6" />
  </svg>
);

export default function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  const [payments, setPayments] = useState<Payment[]>([]);
  const [ordersCount, setOrdersCount] = useState(0);
  const [sellersCount, setSellersCount] = useState(0);
  const [pendingProducts, setPendingProducts] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryNames, setCategoryNames] = useState<Record<number, string>>({});

  useEffect(() => {
    if (!user || user.role !== 'Admin') return;
    Promise.all([
      paymentsApi.getAll().catch(() => []),
      ordersApi.getAll().catch(() => []),
      sellersApi.getAll().catch(() => []),
      productsApi.getAll().catch(() => []),
      categoriesApi.getAll().catch(() => []),
    ]).then(([pay, orders, sellers, allProducts, cats]) => {
      setPayments(pay);
      setOrdersCount(orders.length);
      setSellersCount(sellers.length);
      setPendingProducts(allProducts.filter((p) => !p.isActive).length);
      setProducts(allProducts);
      setCategoryNames(Object.fromEntries(cats.map((c) => [c.id, c.name])));
    });
  }, [user]);

  if (!user || user.role !== 'Admin') {
    return <Navigate to="/login" replace />;
  }

  const completed = payments.filter((p) => p.status === 'Completed');
  const now = Date.now();
  const gmv30 = completed
    .filter((p) => now - new Date(p.createdAt).getTime() <= 30 * 24 * 60 * 60 * 1000)
    .reduce((s, p) => s + p.amount, 0);

  const stats = [
    { title: 'GMV за 30 днів', value: `${Math.round(gmv30).toLocaleString('uk-UA')} ₴`, note: '', positive: true },
    { title: 'Замовлень', value: String(ordersCount), note: '', positive: true },
    { title: 'Продавців', value: String(sellersCount), note: '', positive: true },
    { title: 'Усього платежів', value: String(payments.length), note: '', positive: true },
  ];

  const byMonth = new Map<string, number>();
  completed.forEach((p) => {
    const d = new Date(p.createdAt);
    const key = d.toLocaleDateString('uk-UA', { month: 'long' });
    byMonth.set(key, (byMonth.get(key) ?? 0) + p.amount / 1000);
  });
  const gmvByMonth: MonthGmv[] = Array.from(byMonth.entries()).map(([month, gmv]) => ({ month, gmv: Math.round(gmv) }));
  const maxGmv = Math.max(...gmvByMonth.map((m) => m.gmv), 1);

  const productsByCategory = new Map<string, number>();
  products.forEach((p) => {
    const name = (p.categoryId != null ? categoryNames[p.categoryId] : p.categoryName) ?? 'Інші';
    productsByCategory.set(name, (productsByCategory.get(name) ?? 0) + 1);
  });
  const totalProducts = products.length || 1;
  const categoryShares: CategoryShare[] = Array.from(productsByCategory.entries())
    .map(([name, count]) => ({ name, percent: Math.round((count / totalProducts) * 100) }))
    .sort((a, b) => b.percent - a.percent)
    .slice(0, 6);

  const tasks: Task[] = [
    { id: 1, title: 'Модерація товарів', subtitle: `${pendingProducts} товарів очікують перевірки`, to: '/admin/moderation' },
    { id: 2, title: 'Спори', subtitle: 'Функціонал в розробці', to: '/admin/disputes', soon: true },
    { id: 3, title: 'Продавці', subtitle: `${sellersCount} магазинів зареєстровано`, to: '/admin/sellers' },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.siteChrome}>
        <Header />
      </div>

      <div className={styles.container}>
        <nav className={styles.breadcrumbs}>
          <Link to="/">Головна</Link> / <span>Адмінпанель</span> / <span>Дашборд</span>
        </nav>

        <div className={styles.greenArea}>
          <AdminSidebar />

          <main className={styles.main}>
            <div className={styles.titleRow}>
              <h1 className={styles.title}>
                <span className={styles.titleFull}>Дашборд платформи</span>
                <span className={styles.titleShort}>Дашборд</span>
              </h1>
              <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
                Вийти
              </button>
            </div>

            <div className={styles.stats}>
              {stats.map((s) => (
                <div key={s.title} className={styles.statCard}>
                  <span className={styles.statTitle}>{s.title}</span>
                  <span className={styles.statValue}>{s.value}</span>
                  <span className={s.positive ? styles.statUp : styles.statDown}>{s.note}</span>
                </div>
              ))}
            </div>

            <div className={styles.middle}>
              <section className={`${styles.col} ${styles.chartCol}`}>
                <h2 className={styles.sectionTitle}>GMV по місяцях, ₴</h2>
                <div className={styles.chart}>
                  {gmvByMonth.map((m) => (
                    <div key={m.month} className={styles.barCol}>
                      <span className={styles.barValue}>{m.gmv}к</span>
                      <div className={styles.barTrack}>
                        <div className={styles.bar} style={{ height: `${(m.gmv / maxGmv) * 100}%` }} />
                      </div>
                      <span className={styles.barLabel}>
                        <span className={styles.labelFull}>{m.month}</span>
                        <span className={styles.labelShort} aria-hidden="true">
                          {m.month.slice(0, 3)}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              <section className={`${styles.col} ${styles.tasksCol}`}>
                <h2 className={styles.sectionTitle}>Черга завдань</h2>
                <div className={styles.tasks}>
                  {tasks.length === 0 ? (
                    <p className={styles.tasksEmpty}>Завдань поки немає.</p>
                  ) : (
                    <ul className={styles.taskList}>
                      {tasks.map((t) => {
                        const content = (
                          <>
                            <span className={styles.taskText}>
                              <span className={styles.taskTitle}>{t.title}</span>
                              <span className={styles.taskSub}>{t.subtitle}</span>
                            </span>
                            <span className={styles.taskChevron}>
                              <ChevronIcon />
                            </span>
                          </>
                        );
                        return (
                          <li key={t.id} className={styles.taskLi}>
                            {t.soon ? (
                              <div className={`${styles.taskItem} ${styles.taskSoon}`} aria-disabled="true">
                                {content}
                              </div>
                            ) : (
                              <Link to={t.to} className={styles.taskItem}>
                                {content}
                              </Link>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </section>
            </div>

            <section className={styles.categories}>
              <h2 className={styles.sectionTitle}>Категорії за кількістю товарів</h2>
              <ul className={styles.catList}>
                {categoryShares.map((c) => (
                  <li key={c.name} className={styles.catRow}>
                    <span className={styles.catName}>{c.name}</span>
                    <div
                      className={styles.catTrack}
                      role="progressbar"
                      aria-label={c.name}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={c.percent}
                    >
                      <div className={styles.catFill} style={{ width: `${Math.min(Math.max(c.percent, 0), 100)}%` }} />
                    </div>
                    <span className={styles.catPercent}>{c.percent}%</span>
                  </li>
                ))}
              </ul>
            </section>
          </main>
        </div>
      </div>

      <div className={styles.siteChrome}>
        <Footer />
      </div>
    </div>
  );
}