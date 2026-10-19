import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productsApi } from '../../api/products';
import { reviewsApi } from '../../api/reviews';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { PRODUCT_LOCAL_IMAGES } from '../../data/productImages';
import type { Product, Review, CreateReviewDto } from '../../types';
import Header from '../../components/Header/Header';
import styles from './ProductPage.module.css';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=470&h=420&fit=crop';

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewForm, setReviewForm] = useState<CreateReviewDto>({ productId: 0, rating: 5, text: '' });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    if (!id) { setError('Товар не знайдено'); setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    setError(null);
    const productId = Number(id);
    productsApi.getById(productId)
      .then((data) => {
        if (!cancelled) {
          setProduct(data);
          setQty(1);
          setReviewForm(prev => ({ ...prev, productId: data.id }));
        }
      })
      .catch(() => { if (!cancelled) setError('Не вдалося завантажити товар'); })
      .finally(() => { if (!cancelled) setLoading(false); });

    reviewsApi.getByProduct(productId)
      .then(list => { if (!cancelled) setReviews(list); })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    if (!isAuthenticated) { window.location.href = '/login'; return; }
    await addItem(product.id, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) { window.location.href = '/login'; return; }
    setReviewSubmitting(true);
    try {
      const created = await reviewsApi.create(reviewForm);
      setReviews(prev => [created, ...prev]);
      setReviewForm(prev => ({ ...prev, text: '', rating: 5 }));
      setReviewSubmitted(true);
      setTimeout(() => setReviewSubmitted(false), 3000);
    } catch {}
    finally { setReviewSubmitting(false); }
  };

  if (loading) {
    return (
      <div className={styles.page}><Header />
        <div className={styles.stateMsg}>Завантаження...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className={styles.page}><Header />
        <div className={styles.stateMsg}>
          {error ?? 'Товар не знайдено'}
          <div><Link to="/" className={styles.backLink}>← Повернутися на головну</Link></div>
        </div>
      </div>
    );
  }

  const savedAmount    = product.oldPrice ? product.oldPrice - product.price : 0;
  const discountPct    = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;
  const maxQty         = product.quantity ?? 99;
  const displayImage   = PRODUCT_LOCAL_IMAGES[product.id] || product.imageUrl || FALLBACK_IMAGE;

  const characteristics = [
    product.brandName    && { label: 'Бренд',        value: product.brandName },
    product.categoryName && { label: 'Категорія',    value: product.categoryName },
    product.rating    != null && { label: 'Рейтинг', value: `${product.rating} / 5` },
    product.reviewCount != null && { label: 'Відгуки', value: `${product.reviewCount}` },
    product.quantity  != null && { label: 'В наявності', value: `${product.quantity} шт.` },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className={styles.page}>
      <Header />

      <div className={styles.inner}>
        <div className={styles.breadcrumbs}>
          <Link to="/" className={styles.backLink}>← Головна</Link>
          {product.categoryName && <span> / {product.categoryName}</span>}
          <span> / {product.name}</span>
        </div>

        <div className={styles.card}>
          <div className={styles.left}>
            <h1 className={styles.title}>{product.name}</h1>

            <div className={styles.imageWrap}>
              {discountPct > 0 && <span className={styles.discountBadge}>-{discountPct}%</span>}
              <img
                src={displayImage}
                alt={product.name}
                className={styles.image}
              />
            </div>

            {savedAmount > 0 && (
              <div className={styles.savedBadge}>Економія {savedAmount.toLocaleString('uk-UA')} ₴</div>
            )}

            {characteristics.length > 0 && (
              <div className={styles.specs}>
                <h3>ХАРАКТЕРИСТИКИ</h3>
                {characteristics.map((c) => (
                  <div key={c.label} className={styles.specRow}>
                    <span className={styles.specLabel}>{c.label}</span>
                    <span className={styles.specValue}>{c.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.right}>
            {product.description && <p className={styles.description}>{product.description}</p>}

            <div className={styles.priceRow}>
              <span className={styles.price}>{product.price.toLocaleString('uk-UA')} ₴</span>
              {product.oldPrice && (
                <span className={styles.oldPrice}>{product.oldPrice.toLocaleString('uk-UA')} ₴</span>
              )}
            </div>

            {product.badge && (
              <div className={styles.badges}>
                <span className={styles.badge}>{product.badge}</span>
              </div>
            )}

            <div className={styles.actions}>
              <div className={styles.qtyControl}>
                <button onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                <span>{qty}</span>
                <button onClick={() => setQty((q) => Math.min(maxQty, q + 1))}>+</button>
              </div>
              <button
                className={`${styles.addToCart} ${added ? styles.addedToCart : ''}`}
                disabled={maxQty === 0}
                onClick={handleAddToCart}
              >
                {maxQty === 0 ? 'Немає в наявності' : added ? '✓ Додано!' : 'Додати в кошик'}
              </button>
              <button className={styles.favBtn}>♡</button>
            </div>

            <div className={styles.delivery}>
              <div className={styles.deliveryItem}>🚚 Доставка 1–3 дні по всій Україні</div>
              <div className={styles.deliveryItem}>↩️ Повернення товару протягом 14 днів</div>
              <div className={styles.deliveryItem}>🛡️ Гарантія 12 місяців</div>
            </div>
          </div>
        </div>

        <div className={styles.reviewsSection}>
          <h2 className={styles.reviewsTitle}>Відгуки {reviews.length > 0 && `(${reviews.length})`}</h2>

          {isAuthenticated && (
            <form className={styles.reviewForm} onSubmit={handleReviewSubmit}>
              <div className={styles.ratingSelect}>
                <span className={styles.reviewLabel}>Ваша оцінка:</span>
                {[1,2,3,4,5].map(star => (
                  <button
                    key={star}
                    type="button"
                    className={`${styles.starBtn} ${star <= reviewForm.rating ? styles.starActive : ''}`}
                    onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                  >★</button>
                ))}
              </div>
              <textarea
                className={styles.reviewTextarea}
                placeholder="Поділіться враженнями про товар..."
                value={reviewForm.text || ''}
                onChange={e => setReviewForm(prev => ({ ...prev, text: e.target.value }))}
                rows={3}
              />
              {reviewSubmitted && <div className={styles.reviewSuccess}>✓ Відгук надіслано!</div>}
              <button type="submit" className={styles.reviewSubmitBtn} disabled={reviewSubmitting}>
                {reviewSubmitting ? 'Надсилання...' : 'Надіслати відгук'}
              </button>
            </form>
          )}

          {reviews.length === 0 ? (
            <div className={styles.noReviews}>Відгуків поки що немає. Будьте першим!</div>
          ) : (
            <div className={styles.reviewsList}>
              {reviews.map(review => (
                <div key={review.id} className={styles.reviewItem}>
                  <div className={styles.reviewHeader}>
                    <div className={styles.reviewStars}>
                      {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                    </div>
                    {review.createdDate && (
                      <span className={styles.reviewDate}>
                        {new Date(review.createdDate).toLocaleDateString('uk-UA')}
                      </span>
                    )}
                  </div>
                  {review.text && <p className={styles.reviewText}>{review.text}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
