import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import AdminSidebar from '../../components/Adminsidebar/Adminsidebar';
import { categoriesApi } from '../../api/categories';
import { productsApi } from '../../api/products';
import styles from './AdminCategoriesPage.module.css';

const DEFAULT_COMMISSION = 10; // комісія для нової категорії, % (локальне поле, бекенд цього не зберігає)

interface Category {
  id: number;
  name: string;
  productsCount: number;
}

/** 1 товар, 2–4 товари, 5+ товарів */
function productsLabel(n: number): string {
  const last = n % 10;
  const lastTwo = n % 100;
  if (last === 1 && lastTwo !== 11) return `${n} товар`;
  if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) return `${n} товари`;
  return `${n} товарів`;
}

const sameName = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

export default function AdminCategoriesPage() {
  const { user } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [commissions, setCommissions] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);

  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draftName, setDraftName] = useState('');
  const [treeError, setTreeError] = useState('');

  const [commMsg, setCommMsg] = useState('');
  const [commErr, setCommErr] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'Admin') return;
    categoriesApi
      .getAll()
      .then(async (list) => {
        const withCounts = await Promise.all(
          list.map(async (c) => {
            const search = await productsApi.search({ categoryId: c.id, pageSize: 1 }).catch(() => null);
            return { id: c.id, name: c.name, productsCount: search?.totalCount ?? 0 };
          }),
        );
        setCategories(withCounts);
        setCommissions(Object.fromEntries(withCounts.map((c) => [c.id, String(DEFAULT_COMMISSION)])));
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [user]);

  if (!user || user.role !== 'Admin') {
    return <Navigate to="/login" replace />;
  }

  /* ── Дерево категорий ── */
  const handleAdd = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    if (categories.some((c) => sameName(c.name, name))) {
      setTreeError('Категорія з такою назвою вже існує');
      return;
    }
    try {
      const created = await categoriesApi.create({ name });
      setCategories((list) => [...list, { id: created.id, name: created.name, productsCount: 0 }]);
      setCommissions((c) => ({ ...c, [created.id]: String(DEFAULT_COMMISSION) }));
      setNewName('');
      setTreeError('');
    } catch {
      setTreeError('Не вдалося створити категорію');
    }
  };

  const startEdit = (c: Category) => {
    setEditingId(c.id);
    setDraftName(c.name);
    setTreeError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTreeError('');
  };

  const handleRename = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editingId == null) return;
    const name = draftName.trim();

    if (!name) {
      const category = categories.find((c) => c.id === editingId);
      if (!category) return;
      if (!window.confirm(`Видалити категорію «${category.name}»? Назва порожня — це видалить категорію.`)) {
        return;
      }
      try {
        await categoriesApi.delete(editingId);
        setCategories((list) => list.filter((c) => c.id !== editingId));
        setEditingId(null);
        setTreeError('');
      } catch {
        setTreeError('Не вдалося видалити категорію (можливо, в ній ще є товари)');
      }
      return;
    }

    if (categories.some((c) => c.id !== editingId && sameName(c.name, name))) {
      setTreeError('Категорія з такою назвою вже існує');
      return;
    }
    try {
      await categoriesApi.update(editingId, { name });
      setCategories((list) => list.map((c) => (c.id === editingId ? { ...c, name } : c)));
      setEditingId(null);
      setTreeError('');
    } catch {
      setTreeError('Не вдалося оновити категорію');
    }
  };

  /* ── Комиссии ── */
  const handleCommissionChange = (id: number, value: string) => {
    setCommissions((c) => ({ ...c, [id]: value }));
    setCommMsg('');
    setCommErr('');
  };

  const handleSaveCommissions = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const invalid = categories.some((c) => {
      const raw = commissions[c.id];
      const n = Number(raw);
      return raw === undefined || raw.trim() === '' || Number.isNaN(n) || n < 0 || n > 100;
    });
    if (invalid) {
      setCommMsg('');
      setCommErr('Комісія має бути числом від 0 до 100%');
      return;
    }
    // TODO(бэк): отправить commissions на сервер
    setCommErr('');
    setCommMsg('Зміни збережено');
  };

  return (
    <div className={styles.page}>
      <div className={styles.siteChrome}>
        <Header />
      </div>

      <div className={styles.container}>
        <nav className={styles.breadcrumbs}>
          <Link to="/">Головна</Link> / <span>Адмінпанель</span> / <span>Категорії</span>
        </nav>

        <div className={styles.greenArea}>
          <AdminSidebar />

          <main className={styles.main}>
            <h1 className={styles.title}>Категорії каталогу</h1>

            <div className={styles.grid}>
              {/* ── Дерево категорій ── */}
              <section className={styles.col}>
                <h2 className={styles.sectionTitle}>Дерево категорій</h2>
                <div className={styles.card}>
                  <ul className={styles.list}>
                    {categories.map((c) => (
                      <li key={c.id} className={styles.row}>
                        {editingId === c.id ? (
                          <form className={styles.editForm} onSubmit={handleRename}>
                            <input
                              className={styles.textInput}
                              value={draftName}
                              onChange={(e) => setDraftName(e.target.value)}
                              onKeyDown={(e) => e.key === 'Escape' && cancelEdit()}
                              aria-label="Нова назва категорії (очистіть поле, щоб видалити категорію)"
                              placeholder="Залиште порожнім, щоб видалити"
                              autoFocus
                            />
                            <button type="submit" className={draftName.trim() ? styles.primaryBtn : styles.dangerBtn}>
                              {draftName.trim() ? 'ОК' : 'Видалити'}
                            </button>
                            <button type="button" className={styles.ghostBtn} onClick={cancelEdit}>
                              Скасувати
                            </button>
                          </form>
                        ) : (
                          <>
                            <span className={styles.name}>{c.name}</span>
                            <span className={styles.count}>{productsLabel(c.productsCount)}</span>
                            <button
                              type="button"
                              className={styles.linkBtn}
                              onClick={() => startEdit(c)}
                              aria-label={`Змінити категорію ${c.name}`}
                            >
                              Змінити
                            </button>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>

                  <form className={styles.addForm} onSubmit={handleAdd}>
                    <input
                      className={styles.textInput}
                      value={newName}
                      onChange={(e) => {
                        setNewName(e.target.value);
                        setTreeError('');
                      }}
                      placeholder="Нова категорія"
                      aria-label="Нова категорія"
                    />
                    <button type="submit" className={styles.primaryBtn} disabled={!newName.trim()}>
                      Додати
                    </button>
                  </form>

                  {treeError && (
                    <p className={styles.msgErr} role="alert">
                      {treeError}
                    </p>
                  )}
                </div>
              </section>

              {/* ── Комісії за категоріями ── */}
              <section className={styles.col}>
                <h2 className={styles.sectionTitle}>Комісії за категоріями</h2>
                <form className={styles.card} onSubmit={handleSaveCommissions}>
                  <ul className={styles.list}>
                    {categories.map((c) => (
                      <li key={c.id} className={styles.row}>
                        <span className={styles.name}>{c.name}</span>
                        <span className={styles.percentWrap}>
                          <input
                            className={styles.percentInput}
                            type="number"
                            inputMode="decimal"
                            min={0}
                            max={100}
                            step="any"
                            value={commissions[c.id] ?? ''}
                            onChange={(e) => handleCommissionChange(c.id, e.target.value)}
                            aria-label={`Комісія для ${c.name}, %`}
                          />
                          <span className={styles.percentSign} aria-hidden="true">
                            %
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className={styles.saveRow}>
                    <button type="submit" className={styles.primaryBtn}>
                      Зберегти
                    </button>
                    {commMsg && (
                      <span className={styles.msgOk} role="status">
                        {commMsg}
                      </span>
                    )}
                    {commErr && (
                      <span className={styles.msgErr} role="alert">
                        {commErr}
                      </span>
                    )}
                  </div>
                </form>
              </section>
            </div>
          </main>
        </div>
      </div>

      <div className={styles.siteChrome}>
        <Footer />
      </div>
    </div>
  );
}