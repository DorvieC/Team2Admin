import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './SellerStockPage.module.css';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import SellerSidebar from '../../components/Sellersidebar/Sellersidebar';
import { sellersApi } from '../../api/sellers';
import { productsApi } from '../../api/products';
import type { Product } from '../../types';

const LOW_STOCK_THRESHOLD = 10;

export default function SellerStockPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'Seller') return;
    sellersApi.getMine(user.email).then((seller) => {
      if (!seller) {
        setLoading(false);
        return;
      }
      productsApi
        .search({ sellerId: seller.id, pageSize: 200 })
        .then((res) => setProducts(res.items))
        .catch(() => undefined)
        .finally(() => setLoading(false));
    });
  }, [user]);

  if (!user || user.role !== 'Seller') {
    return <Navigate to="/login" replace />;
  }

  const inStock = products.filter((p) => (p.quantity ?? 0) > 0);
  const lowStock = products.filter((p) => (p.quantity ?? 0) > 0 && (p.quantity ?? 0) < LOW_STOCK_THRESHOLD);

  const stats = [
    { title: 'Позицій в наявності', value: String(inStock.length), note: `з ${products.length}`, positive: true },
    { title: 'Закінчуються', value: String(lowStock.length), note: `менше ${LOW_STOCK_THRESHOLD} шт`, positive: false },
    { title: 'Немає в наявності', value: String(products.length - inStock.length), note: 'шт', positive: false },
    { title: 'Усього товарів', value: String(products.length), note: '', positive: true },
  ];

  const handleReorder = async (item: Product) => {
    try {
      await productsApi.update(item.id, {
        name: item.name,
        description: item.description,
        price: item.price,
        quantity: (item.quantity ?? 0) + 10,
        brandId: item.brandId ?? 1,
        categoryId: item.categoryId ?? 1,
        imgUrls: item.imgUrls,
        isActive: item.isActive ?? true,
      });
      setProducts((prev) => prev.map((p) => (p.id === item.id ? { ...p, quantity: (p.quantity ?? 0) + 10 } : p)));
    } catch {
      window.alert('Не вдалося поповнити залишок');
    }
  };

  return (
    <div className={styles.page}>
      <Header />

      <div className={styles.container}>
        <nav className={styles.breadcrumbs}>
          <Link to="/">Головна</Link> / <span>Кабінет продавця</span> / <span>Залишки</span>
        </nav>

        <div className={styles.greenArea}>
          <SellerSidebar />

          <main className={styles.main}>
            <h1 className={styles.title}>Управління залишками</h1>

            <div className={styles.stats}>
              {stats.map((s) => (
                <div key={s.title} className={styles.statCard}>
                  <span className={styles.statTitle}>{s.title}</span>
                  <span className={styles.statValue}>{s.value}</span>
                  <span className={s.positive ? styles.statUp : styles.statDown}>{s.note}</span>
                </div>
              ))}
            </div>

            <section>
              <h2 className={styles.sectionTitle}>Потребують поповнення</h2>

              {loading ? (
                <p className={styles.empty}>Завантаження...</p>
              ) : lowStock.length === 0 ? (
                <p className={styles.empty}>Усі товари в достатній кількості.</p>
              ) : (
                <ul className={styles.list}>
                  {lowStock.map((item) => (
                    <li key={item.id} className={styles.row}>
                      <span className={styles.name}>{item.name}</span>
                      <span className={styles.qty}>{item.quantity} шт</span>
                      <button
                        type="button"
                        className={styles.orderBtn}
                        onClick={() => handleReorder(item)}
                        aria-label={`Замовити: ${item.name}`}
                      >
                        Замовити
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}