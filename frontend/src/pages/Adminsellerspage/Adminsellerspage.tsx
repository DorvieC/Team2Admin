import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import AdminSidebar from '../../components/Adminsidebar/Adminsidebar';
import { sellersApi, type SellerDetail } from '../../api/sellers';
import { productsApi } from '../../api/products';
import { ordersApi } from '../../api/orders';
import styles from './AdminSellersPage.module.css';

interface SellerRow extends SellerDetail {
  productsCount: number;
  avgRating: number | null;
  turnover: number;
}

const priceFormat = new Intl.NumberFormat('uk-UA');

const formatDate = (iso: string) => new Date(iso).toLocaleDateString('uk-UA');

const ArrowIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 12h16" />
    <path d="m14 6 6 6-6 6" />
  </svg>
);

export default function AdminSellersPage() {
  const { user } = useAuth();
  const [sellers, setSellers] = useState<SellerRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'Admin') return;
    Promise.all([sellersApi.getAll(), ordersApi.getAll().catch(() => [])])
      .then(async ([list, allOrders]) => {
        const rows = await Promise.all(
          list.map(async (s) => {
            const details = await sellersApi.getDetails(s.id).catch(() => ({ ...s, phone: undefined, email: undefined }));
            const search = await productsApi.search({ sellerId: s.id, pageSize: 100 }).catch(() => null);
            const items = search?.items ?? [];
            const ratings = items.filter((p) => p.rating != null).map((p) => p.rating as number);
            const avgRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;
            const productIds = new Set(items.map((p) => p.id));
            const turnover = allOrders
              .filter((o) => o.orderStatus === 'Paid')
              .reduce(
                (sum, o) => sum + o.items.filter((i) => productIds.has(i.productId)).reduce((s, i) => s + i.total, 0),
                0,
              );
            return {
              ...details,
              productsCount: search?.totalCount ?? 0,
              avgRating,
              turnover,
            };
          }),
        );
        setSellers(rows);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [user]);

  const handleDelete = async (s: SellerRow) => {
    if (!window.confirm(`Видалити продавця "${s.name}"?`)) return;
    await sellersApi.delete(s.id);
    setSellers((prev) => prev.filter((x) => x.id !== s.id));
  };

  if (!user || user.role !== 'Admin') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className={styles.page}>
      <div className={styles.siteChrome}>
        <Header />
      </div>

      <div className={styles.container}>
        <nav className={styles.breadcrumbs}>
          <Link to="/">Головна</Link> / <span>Адмінпанель</span> / <span>Продавці</span>
        </nav>

        <div className={styles.greenArea}>
          <AdminSidebar />

          <main className={styles.main}>
            <h1 className={styles.title}>Продавці</h1>

            {loading ? (
              <p className={styles.empty}>Завантаження...</p>
            ) : sellers.length === 0 ? (
              <p className={styles.empty}>Продавців поки немає.</p>
            ) : (
              <div className={styles.table} role="table" aria-label="Продавці">
                <div className={styles.head} role="row">
                  <span className={styles.headCellLeft} role="columnheader">Магазин</span>
                  <span className={styles.headCellLeft} role="columnheader">Контакти</span>
                  <span role="columnheader">Товарів</span>
                  <span role="columnheader">Оборот</span>
                  <span role="columnheader">Рейтинг</span>
                  <span className={styles.srOnly} role="columnheader">Дії</span>
                </div>

                {sellers.map((s) => (
                  <div key={s.id} className={styles.row} role="row">
                    <div className={styles.cellStore} role="cell">
                      <span className={styles.avatar} aria-hidden="true">
                        {(s.name ?? '??').slice(0, 2)}
                      </span>
                      <span className={styles.storeInfo}>
                        <span className={styles.storeName}>{s.name}</span>
                        <span className={styles.storeSince}>з {formatDate(s.createdAt)}</span>
                      </span>
                    </div>

                    <div className={`${styles.cell} ${styles.cellCity}`} role="cell" data-label="Контакти">
                      {s.email ?? s.phone ?? '—'}
                    </div>
                    <div className={`${styles.cell} ${styles.cellProducts}`} role="cell" data-label="Товарів">
                      {s.productsCount}
                    </div>
                    <div className={`${styles.cell} ${styles.cellRevenue}`} role="cell" data-label="Оборот">
                      {priceFormat.format(s.turnover)} ₴
                    </div>
                    <div className={`${styles.cell} ${styles.cellRating}`} role="cell" data-label="Рейтинг">
                      {s.avgRating != null ? s.avgRating.toFixed(1) : '—'} <span className={styles.star} aria-hidden="true">★</span>
                    </div>

                    <div className={`${styles.cell} ${styles.cellAction}`} role="cell">
                      <button
                        type="button"
                        className={styles.openBtn}
                        onClick={() => handleDelete(s)}
                        aria-label={`Видалити: ${s.name}`}
                      >
                        Видалити <span className={styles.arrow}><ArrowIcon /></span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      <div className={styles.siteChrome}>
        <Footer />
      </div>
    </div>
  );
}