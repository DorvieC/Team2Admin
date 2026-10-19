import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StarRating from '../StarRating/StarRating';
import styles from './ProductCard.module.css';
import type { Product } from '../../types';
import { isInCompare, toggleCompare } from '../../utils/compareList';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [compared, setCompared] = useState(() => isInCompare(product.id));

  useEffect(() => {
    const sync = () => setCompared(isInCompare(product.id));
    window.addEventListener('blitzmall_compare_change', sync);
    return () => window.removeEventListener('blitzmall_compare_change', sync);
  }, [product.id]);

  const handleToggleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = toggleCompare(product.id);
    setCompared(next.includes(product.id));
  };

  return (
    <Link to={`/product/${product.id}`} className={styles.cardLink}>
      <div className={styles.card}>
        <div className={styles.imageWrap}>
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className={styles.image} />
          ) : (
            <div className={styles.image} style={{ background: '#e5e7eb' }} />
          )}
          {product.badge && <span className={styles.badge}>{product.badge}</span>}
          <button
            type="button"
            className={`${styles.compareBtn} ${compared ? styles.compareBtnActive : ''}`}
            onClick={handleToggleCompare}
            aria-label={compared ? 'Прибрати з порівняння' : 'Додати до порівняння'}
            title={compared ? 'Прибрати з порівняння' : 'Додати до порівняння'}
          >
            ⚖
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.name}>{product.name}</div>

          {product.rating !== undefined && (
            <div className={styles.ratingRow}>
              <StarRating value={product.rating} size={20} />
            </div>
          )}

          <div className={styles.priceRow}>
            <div>
              <span className={styles.price}>{product.price.toLocaleString('uk-UA')} ₴</span>
              {product.oldPrice && (
                <span className={styles.oldPrice}>{product.oldPrice.toLocaleString('uk-UA')} ₴</span>
              )}
            </div>
            <button
              className={styles.addToCart}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToCart?.(product); }}
              aria-label="Додати в кошик"
            >
              🛒
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
