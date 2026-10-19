import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './SellerAnalyticsPage.module.css';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import SellerSidebar from '../../components/Sellersidebar/Sellersidebar';
import { sellersApi } from '../../api/sellers';
import { productsApi } from '../../api/products';
import type { Product } from '../../types';

interface TopProduct {
  id: number;
  name: string;
  rating: number;
  reviewCount: number;
}

const numberFormat = new Intl.NumberFormat('uk-UA');

export default function SellerAnalyticsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!user || user.role !== 'Seller') return;
    sellersApi.getMine(user.email).then((seller) => {
      if (!seller) return;
      productsApi.search({ sellerId: seller.id, pageSize: 200 }).then((res) => setProducts(res.items));
    });
  }, [user]);

  if (!user || user.role !== 'Seller') {
    return <Navigate to="/login" replace />;
  }

  const TOP_PRODUCTS: TopProduct[] = [...products]
    .sort((a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0))
    .slice(0, 5)
    .map((p) => ({ id: p.id, name: p.name, rating: p.rating ?? 0, reviewCount: p.reviewCount ?? 0 }));

  return (
    <div className={styles.page}>
      <Header />

      <div className={styles.container}>
        <nav className={styles.breadcrumbs}>
          <Link to="/">Головна</Link> / <span>Кабінет продавця</span> / <span>Аналітика</span>
        </nav>

        <div className={styles.greenArea}>
          <SellerSidebar />

          <main className={styles.main}>
            <h1 className={styles.title}>Аналітика</h1>

            <p style={{ color: '#666', marginBottom: 20 }}>
              Відстеження переглядів, конверсії та повернень поки недоступне — на бекенді ще немає системи аналітики подій.
            </p>

            <div className={styles.bottom}>
              <section className={styles.col}>
                <h2 className={styles.sectionTitle}>Топ товарів за кількістю відгуків</h2>
                {TOP_PRODUCTS.length === 0 ? (
                  <p>Поки немає даних.</p>
                ) : (
                  <ul className={styles.top}>
                    {TOP_PRODUCTS.map((p) => (
                      <li key={p.id} className={styles.topItem}>
                        <span className={styles.topName}>{p.name}</span>
                        <span className={styles.topRevenue}>
                          {p.rating.toFixed(1)} ★ · {numberFormat.format(p.reviewCount)} відгуків
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}