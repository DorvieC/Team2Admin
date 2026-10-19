import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './SellerApiIntegrationsPage.module.css';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import SellerSidebar from '../../components/Sellersidebar/Sellersidebar';

interface Integration {
  name: string;
  description: string;
  status: 'connected' | 'disconnected' | 'webhooks';
  statusLabel: string;
}

const INTEGRATIONS: Integration[] = [
  { name: '1C/BAS', description: 'Синхронізація залишків', status: 'connected', statusLabel: 'Підключено' },
  { name: 'Нова Пошта', description: 'Автостворення ТТН', status: 'connected', statusLabel: 'Підключено' },
  { name: 'Prom / Розетка', description: 'Імпорт каталогу', status: 'disconnected', statusLabel: 'Не підключено' },
  { name: 'Google Analytics', description: 'Аналітика поведінки', status: 'connected', statusLabel: 'Підключено' },
  { name: 'Telegram-бот', description: 'Сповіщення про замовлення', status: 'disconnected', statusLabel: 'Не підключено' },
  { name: 'Webhook', description: 'order.created, order.paid', status: 'webhooks', statusLabel: '2 активні' },
];

const ACCESS_KEY = 'bm_live_sr_9f_2b.... a7f';

export default function SellerApiIntegrationsPage() {
  const { user } = useAuth();
  const [copyMsg, setCopyMsg] = useState('');

  if (!user || user.role !== 'Seller') {
    return <Navigate to="/login" replace />;
  }

  const handleCopy = () => {
    navigator.clipboard?.writeText(ACCESS_KEY).catch(() => undefined);
    setCopyMsg('Скопійовано');
    setTimeout(() => setCopyMsg(''), 2000);
  };

  return (
    <div className={styles.page}>
      <Header />

      <div className={styles.container}>
        <nav className={styles.breadcrumbs}>
          <Link to="/">Головна</Link> / <span>Кабінет продавця</span> / <span>API</span>
        </nav>

        <div className={styles.greenArea}>
          <SellerSidebar />

          <main className={styles.main}>
            <h1 className={styles.title}>API та інтеграції</h1>

            <div className={styles.keyCard}>
              <span className={styles.keyLabel}>Ключ доступу</span>
              <div className={styles.keyRow}>
                <div className={styles.keyValue}>{ACCESS_KEY}</div>
                <button type="button" className={styles.keyBtn} onClick={handleCopy}>
                  Копіювати
                </button>
                <button type="button" className={styles.keyBtn}>
                  Перезапустити
                </button>
              </div>
              {copyMsg && <span className={styles.copyMsg}>{copyMsg}</span>}
            </div>

            <div className={styles.grid}>
              {INTEGRATIONS.map((item) => (
                <div key={item.name} className={styles.card}>
                  <div className={styles.cardText}>
                    <span className={styles.cardName}>{item.name}</span>
                    <span className={styles.cardDesc}>{item.description}</span>
                  </div>
                  <span
                    className={`${styles.badge} ${
                      item.status === 'disconnected' ? styles.badgeOff : styles.badgeOn
                    }`}
                  >
                    {item.statusLabel}
                  </span>
                </div>
              ))}
            </div>

            <p className={styles.note}>
              Це демонстраційний екран керування інтеграціями. Реального підключення до 1С, Нової Пошти,
              Prom/Розетки, Google Analytics, Telegram і вебхуків на бекенді ще немає — статуси вище не
              відображають справжній стан зовнішніх сервісів.
            </p>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
