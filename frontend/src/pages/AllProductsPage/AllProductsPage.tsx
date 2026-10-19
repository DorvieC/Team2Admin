import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { CATEGORIES } from '../../data/categories';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import { productsApi } from '../../api/products';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import type { Product } from '../../types';
import styles from './AllProductsPage.module.css';

const PAGE_SIZE = 12;

const SORT_OPTIONS = [
  { id: 'default', label: 'За популярністю' },
  { id: 'price-asc', label: 'Спочатку дешевші' },
  { id: 'price-desc', label: 'Спочатку дорожчі' },
  { id: 'rating', label: 'За рейтингом' },
];

export function AllProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set());

  const categoryId = searchParams.get('categoryId') || 'all';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const sortBy = searchParams.get('sort') || 'default';
  const page = Number(searchParams.get('page') || '1');

  const [localMin, setLocalMin] = useState(minPrice);
  const [localMax, setLocalMax] = useState(maxPrice);

  useEffect(() => {
    setLocalMin(minPrice);
    setLocalMax(maxPrice);
  }, [minPrice, maxPrice]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await productsApi.search({
        categoryId: categoryId !== 'all' ? Number(categoryId) : undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        page,
        pageSize: PAGE_SIZE,
      });
      let items = result.items;
      if (sortBy === 'price-asc') items = [...items].sort((a, b) => a.price - b.price);
      if (sortBy === 'price-desc') items = [...items].sort((a, b) => b.price - a.price);
      if (sortBy === 'rating') items = [...items].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      setProducts(items);
      setTotalPages(result.totalPages);
      setTotalCount(result.totalCount);
    } catch {
      setError('Не вдалося завантажити товари');
    } finally {
      setLoading(false);
    }
  }, [categoryId, minPrice, maxPrice, sortBy, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value && value !== 'all') next.set(key, value); else next.delete(key);
    next.set('page', '1');
    setSearchParams(next);
  };

  const handleApplyPrice = (e: React.FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (localMin) next.set('minPrice', localMin); else next.delete('minPrice');
    if (localMax) next.set('maxPrice', localMax); else next.delete('maxPrice');
    next.set('page', '1');
    setSearchParams(next);
  };

  const handleClearFilters = () => {
    setLocalMin('');
    setLocalMax('');
    setSearchParams({});
  };

  const handlePageChange = (newPage: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(newPage));
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = async (e: React.MouseEvent, productId: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { navigate('/login'); return; }
    try {
      await addItem(productId);
      setAddedIds(prev => new Set(prev).add(productId));
      setTimeout(() => {
        setAddedIds(prev => { const next = new Set(prev); next.delete(productId); return next; });
      }, 2000);
    } catch {
      /* ignore */
    }
  };

  const hasFilters = categoryId !== 'all' || minPrice || maxPrice;
  const activeCategory = CATEGORIES.find((c) => String(c.backendId) === categoryId);

  return (
    <>
      <Header />

      <div className={styles.page}>
        <div className={styles.breadcrumbs}>Головна / Каталог / Усі товари</div>

        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            <h2 className={styles.sidebarTitle}>Фільтри</h2>

            <div className={styles.filterBlock}>
              <label className={styles.filterLabel}>Категорія</label>
              <select
                className={styles.select}
                value={categoryId}
                onChange={(e) => updateParam('categoryId', e.target.value)}
              >
                <option value="all">Усі категорії</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.backendId}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <form className={styles.filterBlock} onSubmit={handleApplyPrice}>
              <label className={styles.filterLabel}>Ціна, ₴</label>
              <div className={styles.priceInputs}>
                <input
                  type="number"
                  placeholder="Від"
                  className={styles.priceInput}
                  value={localMin}
                  onChange={(e) => setLocalMin(e.target.value)}
                />
                <input
                  type="number"
                  placeholder="До"
                  className={styles.priceInput}
                  value={localMax}
                  onChange={(e) => setLocalMax(e.target.value)}
                />
              </div>
              <button type="submit" className={styles.filterBtn}>Застосувати</button>
            </form>

            {hasFilters && (
              <button type="button" className={styles.filterClearBtn} onClick={handleClearFilters}>
                Скинути фільтри
              </button>
            )}
          </aside>

          <main className={styles.content}>
            <div className={styles.contentHeader}>
              <div>
                <h1 className={styles.title}>{activeCategory ? activeCategory.name : 'Усі товари'}</h1>
                {!loading && (
                  <span className={styles.count}>{totalCount} товарів</span>
                )}
              </div>

              <div className={styles.sortBlock}>
                <span className={styles.sortLabel}>Сортувати</span>
                <select
                  className={styles.select}
                  value={sortBy}
                  onChange={(e) => updateParam('sort', e.target.value)}
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {loading && (
              <div className={styles.grid}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className={styles.skeletonCard} />
                ))}
              </div>
            )}

            {!loading && error && <div className={styles.errorMsg}>{error}</div>}

            {!loading && !error && products.length === 0 && (
              <div className={styles.empty}>
                <div className={styles.emptyIcon}>🔍</div>
                <p>Нічого не знайдено</p>
                {hasFilters && (
                  <button className={styles.filterClearBtn} onClick={handleClearFilters}>
                    Скинути фільтри
                  </button>
                )}
              </div>
            )}

            {!loading && !error && products.length > 0 && (
              <div className={styles.grid}>
                {products.map((product) => (
                  <Link key={product.id} to={`/product/${product.id}`} className={styles.card}>
                    <div className={styles.imgWrap}>
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className={styles.img} />
                      ) : (
                        <div className={styles.imgPlaceholder}>📦</div>
                      )}
                    </div>
                    <div className={styles.info}>
                      <span className={styles.category}>{product.categoryName}</span>
                      <p className={styles.name}>{product.name}</p>
                      <div className={styles.priceRow2}>
                        <span className={styles.price}>{product.price.toLocaleString('uk-UA')} ₴</span>
                        {product.oldPrice && (
                          <span className={styles.oldPrice}>{product.oldPrice.toLocaleString('uk-UA')} ₴</span>
                        )}
                      </div>
                    </div>
                    <button
                      className={`${styles.cartBtn} ${addedIds.has(product.id) ? styles.cartBtnAdded : ''}`}
                      onClick={(e) => handleAddToCart(e, product.id)}
                    >
                      {addedIds.has(product.id) ? '✓ Додано' : 'В кошик'}
                    </button>
                  </Link>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  className={styles.pageBtn}
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                >←</button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                  .reduce<(number | '...')[]>((acc, p, i, arr) => {
                    if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('...');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === '...' ? (
                      <span key={`ellipsis-${i}`} className={styles.pageDots}>…</span>
                    ) : (
                      <button
                        key={p}
                        className={`${styles.pageBtn} ${p === page ? styles.pageBtnActive : ''}`}
                        onClick={() => handlePageChange(p as number)}
                      >
                        {p}
                      </button>
                    )
                  )}

                <button
                  className={styles.pageBtn}
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages}
                >→</button>
              </div>
            )}
          </main>
        </div>
      </div>

      <Footer />
    </>
  );
}
