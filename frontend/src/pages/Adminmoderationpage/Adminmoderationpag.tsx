import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import AdminSidebar from '../../components/Adminsidebar/Adminsidebar';
import { productsApi } from '../../api/products';
import type { Product } from '../../types';
import styles from './AdminModerationPage.module.css';

interface ModerationItem {
  id: number;
  name: string;
  image?: string;
  seller: string;
  category: string;
  price: number;
  product: Product;
}

const priceFormat = new Intl.NumberFormat('uk-UA');

const ImageIcon = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="4" width="18" height="16" rx="3" />
    <circle cx="9" cy="10" r="1.6" />
    <path d="m4 18 5-5 4 4 3-3 4 4" />
  </svg>
);

export default function AdminModerationPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<ModerationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'Admin') return;
    productsApi
      .getAll()
      .then((all) => {
        const pending = all
          .filter((p) => !p.isActive)
          .map((p) => ({
            id: p.id,
            name: p.name,
            image: p.imageUrl,
            seller: p.sellerName ?? '—',
            category: p.categoryName ?? '—',
            price: p.price,
            product: p,
          }));
        setItems(pending);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [user]);

  if (!user || user.role !== 'Admin') {
    return <Navigate to="/login" replace />;
  }

  const handleApprove = async (item: ModerationItem) => {
    const p = item.product;
    try {
      await productsApi.update(item.id, {
        name: p.name,
        description: p.description,
        price: p.price,
        quantity: p.quantity ?? 1,
        brandId: p.brandId ?? 1,
        categoryId: p.categoryId ?? 1,
        imgUrls: p.imgUrls,
        isActive: true,
      });
      setItems((list) => list.filter((i) => i.id !== item.id));
    } catch {
      window.alert('Не вдалося схвалити товар');
    }
  };

  const handleReject = async (item: ModerationItem) => {
    if (!window.confirm(`Відхилити та видалити товар "${item.name}"?`)) return;
    try {
      await productsApi.delete(item.id);
      setItems((list) => list.filter((i) => i.id !== item.id));
    } catch {
      window.alert('Не вдалося відхилити товар');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.siteChrome}>
        <Header />
      </div>

      <div className={styles.container}>
        <nav className={styles.breadcrumbs}>
          <Link to="/">Головна</Link> / <span>Адмінпанель</span> / <span>Модернізація товарів</span>
        </nav>

        <div className={styles.greenArea}>
          <AdminSidebar />

          <main className={styles.main}>
            <h1 className={styles.title}>Модернізація товарів</h1>

            {loading ? (
              <p className={styles.empty}>Завантаження...</p>
            ) : items.length === 0 ? (
              <p className={styles.empty}>Усі товари перевірено. Нових заявок поки немає.</p>
            ) : (
              <ul className={styles.list}>
                {items.map((item) => (
                  <li key={item.id} className={styles.card}>
                    <div className={styles.thumb}>
                      {item.image ? <img src={item.image} alt="" loading="lazy" /> : <ImageIcon />}
                    </div>

                    <div className={styles.info}>
                      <h2 className={styles.name}>{item.name}</h2>
                      <p className={styles.details}>
                        {item.seller}, {item.category}, {priceFormat.format(item.price)} ₴
                      </p>
                    </div>

                    <span className={styles.badge}>Неактивний товар</span>

                    <div className={styles.actions}>
                      <button
                        type="button"
                        className={styles.approveBtn}
                        onClick={() => handleApprove(item)}
                        aria-label={`Схвалити: ${item.name}`}
                      >
                        Схвалити
                      </button>
                      <button
                        type="button"
                        className={styles.rejectBtn}
                        onClick={() => handleReject(item)}
                        aria-label={`Відхилити: ${item.name}`}
                      >
                        Відхилити
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
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