import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './SellerProductsPage.module.css';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import SellerSidebar from '../../components/Sellersidebar/Sellersidebar';
import { sellersApi } from '../../api/sellers';
import { productsApi } from '../../api/products';
import { categoriesApi, type Category } from '../../api/categories';
import { brandsApi, type Brand } from '../../api/brands';
import type { Product } from '../../types';

const STATUS_LABEL = {
  active: 'Активний',
  hidden: 'Прихований',
  out: 'Закінчився',
};

const STATUS_CLASS: Record<string, string> = {
  active: styles.statusActive,
  hidden: styles.statusHidden,
  out: styles.statusOut,
};

function statusOf(p: Product): keyof typeof STATUS_LABEL {
  if (!p.isActive) return 'hidden';
  if ((p.quantity ?? 0) <= 0) return 'out';
  return 'active';
}

const PAGE_SIZE = 12;

const priceFormat = new Intl.NumberFormat('uk-UA');

/** Какие кнопки показывать: 1 2 3 4 5 … 100 */
function getPageItems(current: number, total: number): (number | 'dots-left' | 'dots-right')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, 'dots-right', total];
  if (current >= total - 3) return [1, 'dots-left', total - 4, total - 3, total - 2, total - 1, total];
  return [1, 'dots-left', current - 1, current, current + 1, 'dots-right', total];
}

const ImageIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="4" width="18" height="16" rx="3" />
    <circle cx="9" cy="10" r="1.6" />
    <path d="m4 18 5-5 4 4 3-3 4 4" />
  </svg>
);

export default function SellerProductsPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [sellerId, setSellerId] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    categoryId: '',
    brandId: '',
    imgUrls: [] as string[],
    isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'Seller') return;
    sellersApi.getMine(user.email).then((seller) => {
      if (!seller) {
        setLoading(false);
        return;
      }
      setSellerId(seller.id);
    });
    categoriesApi.getAll().then(setCategories).catch(() => setCategories([]));
    brandsApi.getAll().then(setBrands).catch(() => setBrands([]));
  }, [user]);

  useEffect(() => {
    if (sellerId == null) return;
    setLoading(true);
    productsApi
      .search({ sellerId, page, pageSize: PAGE_SIZE })
      .then((res) => {
        setProducts(res.items);
        setTotalPages(res.totalPages || 1);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [sellerId, page]);

  if (!user || user.role !== 'Seller') {
    return <Navigate to="/login" replace />;
  }

  const handleEdit = (p: Product) => {
    setSaveError('');
    setEditingProduct(p);
    setForm({
      name: p.name,
      description: p.description ?? '',
      price: String(p.price),
      quantity: String(p.quantity ?? 0),
      categoryId: p.categoryId != null ? String(p.categoryId) : '',
      brandId: p.brandId != null ? String(p.brandId) : '',
      imgUrls: p.imgUrls && p.imgUrls.length > 0 ? p.imgUrls : p.imageUrl ? [p.imageUrl] : [],
      isActive: p.isActive ?? true,
    });
  };

  const closeEdit = () => {
    setEditingProduct(null);
  };

  const handleImgUrlChange = (index: number, value: string) => {
    setForm((prev) => {
      const next = [...prev.imgUrls];
      next[index] = value;
      return { ...prev, imgUrls: next };
    });
  };

  const addImgUrl = () => {
    setForm((prev) => ({ ...prev, imgUrls: [...prev.imgUrls, ''] }));
  };

  const removeImgUrl = (index: number) => {
    setForm((prev) => ({ ...prev, imgUrls: prev.imgUrls.filter((_, i) => i !== index) }));
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setSaving(true);
    setSaveError('');
    try {
      await productsApi.update(editingProduct.id, {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        price: Number(form.price),
        quantity: Number(form.quantity),
        categoryId: Number(form.categoryId),
        brandId: Number(form.brandId),
        imgUrls: form.imgUrls.filter((u) => u.trim() !== ''),
        isActive: form.isActive,
      });
      if (sellerId != null) {
        const res = await productsApi.search({ sellerId, page, pageSize: PAGE_SIZE });
        setProducts(res.items);
        setTotalPages(res.totalPages || 1);
      }
      closeEdit();
    } catch {
      setSaveError('Не вдалося зберегти зміни. Перевірте поля і спробуйте ще раз.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.page}>
      <Header />

      <div className={styles.container}>
        <nav className={styles.breadcrumbs}>
          <Link to="/">Головна</Link> / <span>Кабінет продавця</span> / <span>Товари</span>
        </nav>

        <div className={styles.greenArea}>
          <SellerSidebar />

          <main className={styles.main}>
            <h1 className={styles.title}>Каталог товарів</h1>

            <div className={styles.table} role="table" aria-label="Каталог товарів">
              {/* ── Заголовки (на телефоне скрыты) ── */}
              <div className={styles.head} role="row">
                <span className={styles.headCellLeft} role="columnheader">Товар</span>
                <span role="columnheader">Категорія</span>
                <span role="columnheader">Ціна</span>
                <span role="columnheader">Залишок</span>
                <span role="columnheader">Рейтинг</span>
                <span role="columnheader">Статус</span>
                <span className={styles.srOnly} role="columnheader">Дії</span>
              </div>

              {loading ? (
                <p style={{ padding: 20 }}>Завантаження...</p>
              ) : products.length === 0 ? (
                <p style={{ padding: 20 }}>У вас ще немає товарів.</p>
              ) : (
                products.map((p) => (
                  <div key={p.id} className={styles.row} role="row">
                    <div className={styles.cellProduct} role="cell">
                      <div className={styles.thumb}>
                        {p.imageUrl ? <img src={p.imageUrl} alt="" loading="lazy" /> : <ImageIcon />}
                      </div>
                      <span className={styles.name}>{p.name}</span>
                    </div>

                    <div className={`${styles.cell} ${styles.cellCategory}`} role="cell" data-label="Категорія">
                      {p.categoryName ?? '—'}
                    </div>
                    <div className={`${styles.cell} ${styles.cellStrong}`} role="cell" data-label="Ціна">
                      {priceFormat.format(p.price)} ₴
                    </div>
                    <div className={`${styles.cell} ${styles.cellStrong}`} role="cell" data-label="Залишок">
                      {p.quantity ?? 0}
                    </div>
                    <div className={`${styles.cell} ${styles.cellRating}`} role="cell" data-label="Рейтинг">
                      {p.rating != null ? p.rating.toFixed(1) : '—'} <span aria-hidden="true">★</span>
                    </div>

                    <div className={`${styles.cell} ${styles.cellStatus}`} role="cell">
                      <span className={`${styles.status} ${STATUS_CLASS[statusOf(p)]}`}>{STATUS_LABEL[statusOf(p)]}</span>
                    </div>

                    <div className={`${styles.cell} ${styles.cellEdit}`} role="cell">
                      <button type="button" className={styles.editBtn} onClick={() => handleEdit(p)}>
                        Редагувати
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* ── Пагинация ── */}
            <nav className={styles.pagination} aria-label="Сторінки каталогу">
              {getPageItems(page, totalPages).map((item) =>
                typeof item === 'number' ? (
                  <button
                    key={item}
                    type="button"
                    className={`${styles.pageBtn} ${item === page ? styles.pageBtnActive : ''}`}
                    aria-current={item === page ? 'page' : undefined}
                    aria-label={`Сторінка ${item}`}
                    onClick={() => setPage(item)}
                  >
                    {item}
                  </button>
                ) : (
                  <span key={item} className={styles.dots} aria-hidden="true">
                    …
                  </span>
                )
              )}
            </nav>
          </main>
        </div>
      </div>

      {editingProduct && (
        <div className={styles.modalOverlay} onMouseDown={closeEdit}>
          <div className={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h2 className={styles.modalTitle}>Редагувати товар</h2>
              <button type="button" className={styles.modalClose} onClick={closeEdit} aria-label="Закрити">
                ×
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className={styles.modalForm}>
              <div className={styles.modalField}>
                <label>Назва</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div className={styles.modalField}>
                <label>Опис</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className={styles.modalRow}>
                <div className={styles.modalField}>
                  <label>Ціна, ₴</label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                    required
                  />
                </div>
                <div className={styles.modalField}>
                  <label>Кількість</label>
                  <input
                    type="number"
                    min="1"
                    value={form.quantity}
                    onChange={(e) => setForm((prev) => ({ ...prev, quantity: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className={styles.modalRow}>
                <div className={styles.modalField}>
                  <label>Категорія</label>
                  <select
                    value={form.categoryId}
                    onChange={(e) => setForm((prev) => ({ ...prev, categoryId: e.target.value }))}
                    required
                  >
                    <option value="" disabled>
                      Оберіть категорію
                    </option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.modalField}>
                  <label>Бренд</label>
                  <select
                    value={form.brandId}
                    onChange={(e) => setForm((prev) => ({ ...prev, brandId: e.target.value }))}
                    required
                  >
                    <option value="" disabled>
                      Оберіть бренд
                    </option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.modalField}>
                <label>Фото (посилання на зображення)</label>
                {form.imgUrls.length === 0 && (
                  <p className={styles.modalHint}>Фото ще не додано.</p>
                )}
                {form.imgUrls.map((url, i) => (
                  <div key={i} className={styles.imgUrlRow}>
                    <input
                      value={url}
                      onChange={(e) => handleImgUrlChange(i, e.target.value)}
                      placeholder="https://..."
                    />
                    <button type="button" className={styles.imgUrlRemove} onClick={() => removeImgUrl(i)}>
                      ×
                    </button>
                  </div>
                ))}
                <button type="button" className={styles.addImgBtn} onClick={addImgUrl}>
                  + Додати фото
                </button>
              </div>

              <label className={styles.modalCheckbox}>
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                />
                Товар активний (видимий покупцям)
              </label>

              {saveError && <p className={styles.saveError}>{saveError}</p>}

              <div className={styles.modalActions}>
                <button type="button" className={styles.modalCancelBtn} onClick={closeEdit}>
                  Скасувати
                </button>
                <button type="submit" className={styles.modalSaveBtn} disabled={saving}>
                  {saving ? 'Збереження...' : 'Зберегти зміни'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}