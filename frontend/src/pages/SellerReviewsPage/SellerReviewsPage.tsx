import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './SellerReviewsPage.module.css';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import SellerSidebar from '../../components/Sellersidebar/Sellersidebar';
import { sellersApi } from '../../api/sellers';
import { productsApi } from '../../api/products';
import { reviewsApi } from '../../api/reviews';

interface SellerReview {
  id: number;
  author: string;
  product: string;
  rating: number;
  text: string;
  reply?: string;
}

function Stars({ value }: { value: number }) {
  return (
    <span className={styles.stars} aria-label={`Оцінка ${value} з 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= value ? styles.starOn : styles.starOff}>
          ★
        </span>
      ))}
    </span>
  );
}

export default function SellerReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<SellerReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState<Record<number, string>>({});

  useEffect(() => {
    if (!user || user.role !== 'Seller') return;
    sellersApi.getMine(user.email).then(async (seller) => {
      if (!seller) {
        setLoading(false);
        return;
      }
      const products = await productsApi.search({ sellerId: seller.id, pageSize: 200 }).catch(() => ({ items: [] }));
      const perProduct = await Promise.all(
        products.items.map((p) => reviewsApi.getByProduct(p.id).then((rs) => rs.map((r) => ({ r, productName: p.name }))).catch(() => [])),
      );
      const flat = perProduct.flat().map(({ r, productName }) => ({
        id: r.id,
        author: `Покупець #${r.userId}`,
        product: productName,
        rating: r.rating,
        text: r.text ?? '',
      }));
      setReviews(flat);
      setLoading(false);
    });
  }, [user]);

  if (!user || user.role !== 'Seller') {
    return <Navigate to="/login" replace />;
  }

  const handleReply = (id: number) => {
    const text = (drafts[id] ?? '').trim();
    if (!text) return;
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, reply: text } : r)));
    setDrafts((prev) => ({ ...prev, [id]: '' }));
  };

  return (
    <div className={styles.page}>
      <Header />

      <div className={styles.container}>
        <nav className={styles.breadcrumbs}>
          <Link to="/">Головна</Link> / <span>Кабінет продавця</span> / <span>Відгуки</span>
        </nav>

        <div className={styles.greenArea}>
          <SellerSidebar />

          <main className={styles.main}>
            <h1 className={styles.title}>Відгуки покупців</h1>

            <div className={styles.list}>
              {loading && <p>Завантаження...</p>}
              {!loading && reviews.length === 0 && <p>Поки немає відгуків на ваші товари.</p>}
              {reviews.map((r) => (
                <article key={r.id} className={styles.card}>
                  <div className={styles.head}>
                    <div className={styles.avatar}>{r.author.charAt(0).toUpperCase()}</div>
                    <div className={styles.headInfo}>
                      <span className={styles.author}>{r.author}</span>
                      <span className={styles.product}>{r.product}</span>
                    </div>
                    <Stars value={r.rating} />
                  </div>

                  <p className={styles.text}>{r.text}</p>

                  {r.reply ? (
                    <span className={styles.badge}>Відповідь надано</span>
                  ) : (
                    <div className={styles.replyRow}>
                      <input
                        className={styles.replyInput}
                        type="text"
                        placeholder="Ваша відповідь"
                        value={drafts[r.id] ?? ''}
                        onChange={(e) => setDrafts((prev) => ({ ...prev, [r.id]: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleReply(r.id);
                        }}
                      />
                      <button
                        type="button"
                        className={styles.replyBtn}
                        onClick={() => handleReply(r.id)}
                        disabled={!(drafts[r.id] ?? '').trim()}
                      >
                        Відповісти
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}