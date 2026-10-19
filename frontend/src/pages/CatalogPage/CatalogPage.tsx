import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import { productsApi } from '../../api/products';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { CATEGORIES } from '../../data/categories';
import type { Product } from '../../types';
import { loadCompareIds, toggleCompare } from '../../utils/compareList';
import styles from './CatalogPage.module.css';

const PAGE_SIZE = 12;

const COLORS = [
  { name: 'чорний', hex: '#000000' },
  { name: 'бежевий', hex: '#ece9d8' },
  { name: 'сірий', hex: '#aaaaaa' },
  { name: 'синій', hex: '#1a1ac8' },
  { name: 'зелений', hex: '#1f6f3a' },
  { name: 'червоний', hex: '#d62828' },
  { name: 'жовтий', hex: '#f5f05a' },
  { name: 'графітовий', hex: '#888888' },
];

const SORTS = [
  { value: 'popular', label: 'За популярністю' },
  { value: 'price-asc', label: 'Від дешевих до дорогих' },
  { value: 'price-desc', label: 'Від дорогих до дешевих' },
  { value: 'rating', label: 'За рейтингом' },
];

const RATINGS = [
  { value: '', label: 'Усі' },
  { value: '4', label: '4+' },
  { value: '4.5', label: '4.5+' },
];

function pluralGoods(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'товар';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'товари';
  return 'товарів';
}

// Колір береться з product.color, якщо бекенд його віддає
const getColor = (p: Product) => ((p as Product & { color?: string }).color ?? '').toLowerCase();

export default function CatalogPage() {
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
  const [compared, setCompared] = useState<Set<number>>(() => new Set(loadCompareIds()));

  const handleToggleCompare = (e: React.MouseEvent, productId: number) => {
    e.preventDefault();
    e.stopPropagation();
    setCompared(new Set(toggleCompare(productId)));
  };
  const [filtersOpen, setFiltersOpen] = useState(false);

  const q = searchParams.get('q') || '';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const categoryIdParam = searchParams.get('categoryId') || '';
  const page = Number(searchParams.get('page') || '1');
  const brands = (searchParams.get('brands') || '').split(',').filter(Boolean);
  const colors = (searchParams.get('colors') || '').split(',').filter(Boolean);
  const minRating = searchParams.get('minRating') || '';
  const inStock = searchParams.get('inStock') === '1';
  const onlyDiscount = searchParams.get('discount') === '1';
  const sort = searchParams.get('sort') || 'popular';
  const activeCategory = CATEGORIES.find((c) => String(c.backendId) === categoryIdParam);

  const [localMin, setLocalMin] = useState(minPriceParam);
  const [localMax, setLocalMax] = useState(maxPriceParam);

  useEffect(() => {
    setLocalMin(minPriceParam);
    setLocalMax(maxPriceParam);
  }, [minPriceParam, maxPriceParam]);

  // Блокируем прокрутку страницы, пока открыта панель фильтров (мобильная версия)
  useEffect(() => {
    document.body.style.overflow = filtersOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [filtersOpen]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await productsApi.search({
        q: q || undefined,
        categoryId: categoryIdParam ? Number(categoryIdParam) : undefined,
        minPrice: minPriceParam ? Number(minPriceParam) : undefined,
        maxPrice: maxPriceParam ? Number(maxPriceParam) : undefined,
        page,
        pageSize: PAGE_SIZE,
      });
      setProducts(result.items);
      setTotalPages(result.totalPages);
      setTotalCount(result.totalCount);
    } catch {
      setError('Не вдалося завантажити товари');
    } finally {
      setLoading(false);
    }
  }, [q, categoryIdParam, minPriceParam, maxPriceParam, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  /* ---------- робота з параметрами URL ---------- */
  const update = (fn: (next: URLSearchParams) => void) => {
    const next = new URLSearchParams(searchParams);
    fn(next);
    next.set('page', '1');
    setSearchParams(next);
  };

  const setValue = (key: string, value: string) =>
    update((n) => { if (value) n.set(key, value); else n.delete(key); });

  const setFlag = (key: string, on: boolean) =>
    update((n) => { if (on) n.set(key, '1'); else n.delete(key); });

  const toggleInList = (key: string, value: string) =>
    update((n) => {
      const list = (n.get(key) || '').split(',').filter(Boolean);
      const i = list.indexOf(value);
      if (i >= 0) list.splice(i, 1); else list.push(value);
      if (list.length) n.set(key, list.join(',')); else n.delete(key);
    });

  const applyPrice = () => {
    if (localMin === minPriceParam && localMax === maxPriceParam) return;
    update((n) => {
      if (localMin) n.set('minPrice', localMin); else n.delete('minPrice');
      if (localMax) n.set('maxPrice', localMax); else n.delete('maxPrice');
    });
  };

  const handlePageChange = (newPage: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(newPage));
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearFilters = () => {
    setLocalMin('');
    setLocalMax('');
    setSearchParams({});
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
    } catch {}
  };

  /* ---------- фільтри та сортування (по завантаженій сторінці) ---------- */
  const hasColorData = products.some((p) => getColor(p));
  const hasClientFilters = brands.length > 0 || colors.length > 0 || !!minRating || inStock || onlyDiscount;

  const visible = products
    .filter((p) => {
      if (brands.length && !brands.includes(p.brandName ?? '')) return false;
      if (colors.length && hasColorData && !colors.includes(getColor(p))) return false;
      if (minRating && (p.rating ?? 0) < Number(minRating)) return false;
      if (inStock && (p.quantity ?? 0) <= 0) return false;
      if (onlyDiscount && !(p.oldPrice && p.oldPrice > p.price)) return false;
      return true;
    })
    .sort((a, b) => {
      if (sort === 'price-asc') return a.price - b.price;
      if (sort === 'price-desc') return b.price - a.price;
      if (sort === 'rating') return (b.rating ?? 0) - (a.rating ?? 0);
      return (b.reviewCount ?? 0) - (a.reviewCount ?? 0);
    });

  const shownCount = hasClientFilters ? visible.length : totalCount;

  const brandCounts = products.reduce<Record<string, number>>((acc, p) => {
    if (p.brandName) acc[p.brandName] = (acc[p.brandName] || 0) + 1;
    return acc;
  }, {});
  const brandOptions = Object.entries(brandCounts).sort(([a], [b]) => a.localeCompare(b, 'uk'));

  const hasFilters = !!(q || minPriceParam || maxPriceParam || categoryIdParam || hasClientFilters);

  /* ---------- чіпси активних фільтрів ---------- */
  const chips: { key: string; label: string; onRemove: () => void }[] = [];
  if (q) chips.push({ key: 'q', label: `Пошук ${q}`, onRemove: () => setValue('q', '') });
  if (activeCategory) chips.push({ key: 'cat', label: activeCategory.name, onRemove: () => setValue('categoryId', '') });
  if (minPriceParam || maxPriceParam) {
    chips.push({
      key: 'price',
      label: `Ціна ${minPriceParam || 0} – ${maxPriceParam || '∞'} ₴`,
      onRemove: () => update((n) => { n.delete('minPrice'); n.delete('maxPrice'); }),
    });
  }
  brands.forEach((b) => chips.push({ key: `b-${b}`, label: b, onRemove: () => toggleInList('brands', b) }));
  colors.forEach((c) => chips.push({ key: `c-${c}`, label: c, onRemove: () => toggleInList('colors', c) }));
  if (minRating) chips.push({ key: 'rating', label: `Рейтинг ${minRating}+`, onRemove: () => setValue('minRating', '') });
  if (inStock) chips.push({ key: 'stock', label: 'В наявності', onRemove: () => setFlag('inStock', false) });
  if (onlyDiscount) chips.push({ key: 'disc', label: 'Зі знижкою', onRemove: () => setFlag('discount', false) });

  const pageTitle = q ? 'Результати пошуку' : activeCategory ? activeCategory.name : 'Каталог товарів';

  return (
    <div className={styles.page}>
      <Header />
      <div className={styles.inner}>
        <div className={styles.breadcrumbs}>
          <Link to="/" className={styles.breadcrumb}>Головна</Link>
          <span className={styles.breadcrumbSep}>/</span>
          <Link to="/catalog" className={styles.breadcrumb}>Каталог</Link>
          {activeCategory && (
            <>
              <span className={styles.breadcrumbSep}>/</span>
              <span>{activeCategory.name}</span>
            </>
          )}
        </div>

        <div className={styles.layout}>
          {filtersOpen && <div className={styles.overlay} onClick={() => setFiltersOpen(false)} />}

          <aside className={`${styles.sidebar} ${filtersOpen ? styles.sidebarOpen : ''}`}>
            <div className={styles.sidebarHead}>
              <h3 className={styles.filterTitle}>Фільтри</h3>
              <button
                type="button"
                className={styles.sidebarClose}
                aria-label="Закрити фільтри"
                onClick={() => setFiltersOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>Категорія</span>
              <select
                className={styles.select}
                value={categoryIdParam}
                onChange={(e) => setValue('categoryId', e.target.value)}
              >
                <option value="">Усі категорії</option>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={String(c.backendId)}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>Ціна, ₴</span>
              <div className={styles.priceRow}>
                <input
                  className={styles.filterInput}
                  type="number"
                  inputMode="numeric"
                  placeholder="від"
                  min={0}
                  value={localMin}
                  onChange={(e) => setLocalMin(e.target.value)}
                  onBlur={applyPrice}
                  onKeyDown={(e) => e.key === 'Enter' && applyPrice()}
                />
                <input
                  className={styles.filterInput}
                  type="number"
                  inputMode="numeric"
                  placeholder="до"
                  min={0}
                  value={localMax}
                  onChange={(e) => setLocalMax(e.target.value)}
                  onBlur={applyPrice}
                  onKeyDown={(e) => e.key === 'Enter' && applyPrice()}
                />
              </div>
            </div>

            {brandOptions.length > 0 && (
              <div className={styles.filterGroup}>
                <span className={styles.filterLabel}>Бренд</span>
                <div className={styles.brandList}>
                  {brandOptions.map(([name, count]) => (
                    <label key={name} className={styles.checkRow}>
                      <input
                        type="checkbox"
                        checked={brands.includes(name)}
                        onChange={() => toggleInList('brands', name)}
                      />
                      <span className={styles.checkName}>{name}</span>
                      <span className={styles.checkCount}>{count}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>Колір</span>
              <div className={styles.swatches}>
                {COLORS.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    title={c.name}
                    aria-label={c.name}
                    aria-pressed={colors.includes(c.name)}
                    className={`${styles.swatch} ${colors.includes(c.name) ? styles.swatchActive : ''}`}
                    style={{ background: c.hex }}
                    onClick={() => toggleInList('colors', c.name)}
                  />
                ))}
              </div>
            </div>

            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>Рейтинг від</span>
              <div className={styles.ratingRow}>
                {RATINGS.map((r) => (
                  <button
                    key={r.label}
                    type="button"
                    className={`${styles.ratingBtn} ${minRating === r.value ? styles.ratingBtnActive : ''}`}
                    onClick={() => setValue('minRating', r.value)}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <label className={styles.checkRow}>
              <input type="checkbox" checked={inStock} onChange={(e) => setFlag('inStock', e.target.checked)} />
              <span className={styles.checkName}>Лише в наявності</span>
            </label>
            <label className={styles.checkRow}>
              <input type="checkbox" checked={onlyDiscount} onChange={(e) => setFlag('discount', e.target.checked)} />
              <span className={styles.checkName}>Лише зі знижкою</span>
            </label>

            <button type="button" className={styles.filterClearBtn} onClick={handleClearFilters}>
              Скинути фільтри
            </button>

            <button type="button" className={styles.applyBtn} onClick={() => setFiltersOpen(false)}>
              Показати {shownCount} {pluralGoods(shownCount)}
            </button>
          </aside>

          <main className={styles.main}>
            <div className={styles.topBar}>
              <div className={styles.titleWrap}>
                <h1 className={styles.pageTitle}>{pageTitle}</h1>
                {!loading && !error && (
                  <span className={styles.count}>
                    {shownCount} {pluralGoods(shownCount)}
                  </span>
                )}
              </div>

              <button type="button" className={styles.filterToggle} onClick={() => setFiltersOpen(true)}>
                Фільтри{chips.length > 0 ? ` (${chips.length})` : ''}
              </button>

              <div className={styles.sortWrap}>
                <label htmlFor="sort" className={styles.sortLabel}>Сортувати</label>
                <select
                  id="sort"
                  className={styles.sortSelect}
                  value={sort}
                  onChange={(e) => setValue('sort', e.target.value === 'popular' ? '' : e.target.value)}
                >
                  {SORTS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {chips.length > 0 && (
              <div className={styles.chips}>
                {chips.map((c) => (
                  <span key={c.key} className={styles.chip}>
                    {c.label}
                    <button type="button" className={styles.chipX} aria-label={`Прибрати: ${c.label}`} onClick={c.onRemove}>
                      ✕
                    </button>
                  </span>
                ))}
                <button type="button" className={styles.chipsClear} onClick={handleClearFilters}>
                  Скинути все
                </button>
              </div>
            )}

            <div className={styles.results}>
              {loading && (
                <div className={styles.grid}>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className={styles.skeletonCard} />
                  ))}
                </div>
              )}

              {!loading && error && (
                <div className={styles.empty}>
                  <p className={styles.errorMsg}>{error}</p>
                  <button type="button" className={styles.emptyBtn} onClick={fetchProducts}>
                    Спробувати ще раз
                  </button>
                </div>
              )}

              {!loading && !error && visible.length === 0 && (
                <div className={styles.empty}>
                  <svg width="96" height="96" viewBox="0 0 96 96" fill="none" aria-hidden="true">
                    <circle cx="40" cy="40" r="30" stroke="#1f6f3a" strokeWidth="8" />
                    <path d="M62 62l22 22" stroke="#1f6f3a" strokeWidth="9" strokeLinecap="round" />
                    <circle cx="31" cy="34" r="3.5" fill="#1f6f3a" />
                    <circle cx="49" cy="34" r="3.5" fill="#1f6f3a" />
                    <path d="M30 52c5-6 15-6 20 0" stroke="#1f6f3a" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                  <h2 className={styles.emptyTitle}>Нічого не знайшли</h2>
                  <p className={styles.emptyText}>Спробуйте прибрати частину фільтрів або змінити запит</p>
                  <button type="button" className={styles.emptyBtn} onClick={handleClearFilters}>
                    Скинути фільтри
                  </button>
                </div>
              )}

              {!loading && !error && visible.length > 0 && (
                <div className={styles.grid}>
                  {visible.map(product => (
                    <Link
                      key={product.id}
                      to={`/product/${product.id}`}
                      className={styles.card}
                    >
                      <div className={styles.imgWrap}>
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className={styles.img} />
                        ) : (
                          <div className={styles.imgPlaceholder}>📦</div>
                        )}
                        <button
                          type="button"
                          className={`${styles.compareBtn} ${compared.has(product.id) ? styles.compareBtnActive : ''}`}
                          onClick={(e) => handleToggleCompare(e, product.id)}
                          aria-label={compared.has(product.id) ? 'Прибрати з порівняння' : 'Додати до порівняння'}
                          title={compared.has(product.id) ? 'Прибрати з порівняння' : 'Додати до порівняння'}
                        >
                          ⚖
                        </button>
                      </div>
                      <div className={styles.info}>
                        <span className={styles.category}>{product.categoryName}</span>
                        <p className={styles.name}>{product.name}</p>
                        {product.rating != null && (
                          <div className={styles.ratingRowCard}>
                            <span className={styles.stars}>{'★'.repeat(Math.round(product.rating))}{'☆'.repeat(5 - Math.round(product.rating))}</span>
                            <span className={styles.reviewCount}>({product.reviewCount ?? 0})</span>
                          </div>
                        )}
                        <div className={styles.cardPriceRow}>
                          <span className={styles.price}>{product.price.toLocaleString('uk-UA')} ₴</span>
                          {product.oldPrice && (
                            <span className={styles.oldPrice}>{product.oldPrice.toLocaleString('uk-UA')} ₴</span>
                          )}
                        </div>
                      </div>
                      <button
                        className={`${styles.cartBtn} ${addedIds.has(product.id) ? styles.cartBtnAdded : ''}`}
                        onClick={e => handleAddToCart(e, product.id)}
                      >
                        {addedIds.has(product.id) ? '✓ Додано' : 'В кошик'}
                      </button>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  className={styles.pageBtn}
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                >←</button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
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
    </div>
  );
}