import { useState, type FormEvent } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import AdminSidebar from '../../components/Adminsidebar/Adminsidebar';
import styles from './AdminAdsPage.module.css';

const DEV_SKIP_AUTH = false;
const DEV_USER = { name: 'Тест Адмін', role: 'admin' };

const STORAGE_KEY = 'blitzmall_admin_banners';

type BannerStatus = 'active' | 'paused';

interface Banner {
  id: number;
  name: string;
  description: string;
  status: BannerStatus;
}

const DEFAULT_BANNERS: Banner[] = [
  { id: 1, name: 'Головний баннер', status: 'active', description: 'Доставка день у день · 01-30.10' },
  { id: 2, name: 'Промо-блок «Акції»', status: 'active', description: 'Знижки до 30% · 15.09-15.10' },
  { id: 3, name: 'Баннер продавця', status: 'paused', description: 'TechnoLine · Очікує оплати' },
];

function loadBanners(): Banner[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Banner[]) : DEFAULT_BANNERS;
  } catch {
    return DEFAULT_BANNERS;
  }
}

function saveBanners(list: Banner[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

const STATUS_LABEL: Record<BannerStatus, string> = {
  active: 'Активна',
  paused: 'На паузі',
};

export default function AdminAdsPage() {
  const { user: authUser } = useAuth();
  const user = DEV_SKIP_AUTH ? DEV_USER : authUser;

  const [banners, setBanners] = useState<Banner[]>(loadBanners);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draftName, setDraftName] = useState('');
  const [draftDesc, setDraftDesc] = useState('');
  const [newName, setNewName] = useState('');

  if (!user || user.role !== 'Admin') {
    return <Navigate to="/login" replace />;
  }

  const update = (next: Banner[]) => {
    setBanners(next);
    saveBanners(next);
  };

  const handleToggleStatus = (id: number) => {
    update(
      banners.map((b) => (b.id === id ? { ...b, status: b.status === 'active' ? 'paused' : 'active' } : b))
    );
  };

  const startEdit = (b: Banner) => {
    setEditingId(b.id);
    setDraftName(b.name);
    setDraftDesc(b.description);
  };

  const cancelEdit = () => setEditingId(null);

  const handleSaveEdit = (e: FormEvent) => {
    e.preventDefault();
    if (editingId == null) return;
    update(
      banners.map((b) => (b.id === editingId ? { ...b, name: draftName.trim() || b.name, description: draftDesc } : b))
    );
    setEditingId(null);
  };

  const handleDelete = (id: number) => {
    if (!window.confirm('Видалити банер?')) return;
    update(banners.filter((b) => b.id !== id));
  };

  const handleAdd = (e: FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    const nextId = Math.max(0, ...banners.map((b) => b.id)) + 1;
    update([...banners, { id: nextId, name, description: '', status: 'paused' }]);
    setNewName('');
  };

  return (
    <div className={styles.page}>
      <div className={styles.siteChrome}>
        <Header />
      </div>

      <div className={styles.container}>
        <nav className={styles.breadcrumbs}>
          <Link to="/">Головна</Link> / <span>Адмінпанель</span> / <span>Реклама і банери</span>
        </nav>

        <div className={styles.greenArea}>
          <AdminSidebar />

          <main className={styles.main}>
            <h1 className={styles.title}>Реклама і банери</h1>

            <p className={styles.note}>
              Керування банерами працює локально (демо-режим) — на бекенді ще немає сутності для
              їх зберігання, зміни зберігаються лише у вашому браузері.
            </p>

            <ul className={styles.list}>
              {banners.map((b) => (
                <li key={b.id} className={styles.card}>
                  {editingId === b.id ? (
                    <form className={styles.editForm} onSubmit={handleSaveEdit}>
                      <input
                        className={styles.textInput}
                        value={draftName}
                        onChange={(e) => setDraftName(e.target.value)}
                        placeholder="Назва банера"
                        autoFocus
                      />
                      <input
                        className={styles.textInput}
                        value={draftDesc}
                        onChange={(e) => setDraftDesc(e.target.value)}
                        placeholder="Опис"
                      />
                      <div className={styles.editActions}>
                        <button type="submit" className={styles.outlineBtn}>
                          Зберегти
                        </button>
                        <button type="button" className={styles.outlineBtn} onClick={cancelEdit}>
                          Скасувати
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className={styles.cardHead}>
                        <h2 className={styles.cardName}>{b.name}</h2>
                        <button
                          type="button"
                          className={`${styles.badge} ${b.status === 'active' ? styles.badgeOk : styles.badgeWarn}`}
                          onClick={() => handleToggleStatus(b.id)}
                          title="Натисніть, щоб змінити статус"
                        >
                          {STATUS_LABEL[b.status]}
                        </button>
                      </div>
                      <p className={styles.desc}>{b.description || '—'}</p>
                      <div className={styles.cardActions}>
                        <button
                          type="button"
                          className={styles.outlineBtn}
                          onClick={() => startEdit(b)}
                          aria-label={`Редагувати: ${b.name}`}
                        >
                          Редагувати
                        </button>
                        <button type="button" className={styles.deleteBtn} onClick={() => handleDelete(b.id)}>
                          Видалити
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>

            <form className={styles.addForm} onSubmit={handleAdd}>
              <input
                className={styles.textInput}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Назва нового банера"
              />
              <button type="submit" className={styles.outlineBtn} disabled={!newName.trim()}>
                + Додати банер
              </button>
            </form>
          </main>
        </div>
      </div>

      <div className={styles.siteChrome}>
        <Footer />
      </div>
    </div>
  );
}
