import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import AdminSidebar from '../../components/Adminsidebar/Adminsidebar';
import styles from './AdminIntegrationsPage.module.css';

const DEV_SKIP_AUTH = false;
const DEV_USER = { name: 'Тест Адмін', role: 'admin' };

type IntegrationStatus = 'active' | 'testing' | 'off';

interface Integration {
  id: string;
  name: string;
  description: string;
  status: IntegrationStatus;
  statusLabel?: string;
}

interface IntegrationGroup {
  title: string;
  items: Integration[];
}

interface WebhookRow {
  event: string;
  url: string;
  lastDelivery: string;
  statusCode: 'ok' | 'error';
  statusLabel: string;
}

const STATUS_LABEL: Record<IntegrationStatus, string> = {
  active: 'Активна',
  testing: 'Тестування',
  off: 'Не підключено',
};

const STORAGE_KEY = 'blitzmall_admin_integrations';

const DEFAULT_GROUPS: IntegrationGroup[] = [
  {
    title: 'Платежі',
    items: [
      { id: 'liqpay', name: 'LiqPay', description: 'Еквайринг, 1,3%', status: 'active' },
      { id: 'wallets', name: 'Apple Pay / Google Pay', description: 'Резервний провайдер', status: 'active' },
      { id: 'banks', name: 'Партнерські банки', description: 'Розстрочка й кредит', status: 'testing' },
    ],
  },
  {
    title: 'Логістика',
    items: [
      { id: 'novaposhta', name: 'Нова Пошта', description: 'ТТН, статуси, поштомати', status: 'active' },
      { id: 'ukrposhta', name: 'Укрпошта API', description: 'ТТН і трекінг', status: 'active' },
      { id: 'blitzexpress', name: 'BlitzExpress', description: 'Власна кур’єрська служба', status: 'active' },
    ],
  },
  {
    title: 'Бізнес-системи',
    items: [
      { id: '1c', name: '1C/BAS', description: 'Синхронізація залишків', status: 'active' },
      { id: 'erp', name: 'ERP партнерів', description: 'Обмін замовленнями', status: 'active', statusLabel: '2 підключення' },
      { id: 'promrozetka', name: 'Prom / Розетка', description: 'Імпорт каталогу', status: 'off' },
    ],
  },
  {
    title: 'Комунікації та соцмережі',
    items: [
      { id: 'analytics', name: 'Google Analytics', description: 'Аналітика поведінки', status: 'active' },
      { id: 'telegram', name: 'Telegram-бот', description: 'Сповіщення про замовлення', status: 'off' },
    ],
  },
];

const WEBHOOKS: WebhookRow[] = [
  { event: 'order.created', url: 'https://api.partner.ua/hooks/orders', lastDelivery: '18.10. 09:45', statusCode: 'ok', statusLabel: '200 OK' },
  { event: 'product.moderated', url: 'https://erp.technoline.ua/hook', lastDelivery: '17.10. 19:27', statusCode: 'error', statusLabel: '500 Error' },
];

function loadGroups(): IntegrationGroup[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as IntegrationGroup[]) : DEFAULT_GROUPS;
  } catch {
    return DEFAULT_GROUPS;
  }
}

function saveGroups(groups: IntegrationGroup[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
}

const ACCESS_KEY = 'bm_live_sr_9f_2b.... a7f';

export default function AdminIntegrationsPage() {
  const { user: authUser } = useAuth();
  const user = DEV_SKIP_AUTH ? DEV_USER : authUser;

  const [groups, setGroups] = useState<IntegrationGroup[]>(loadGroups);
  const [copyMsg, setCopyMsg] = useState('');

  if (!user || user.role !== 'Admin') {
    return <Navigate to="/login" replace />;
  }

  const handleConfigure = (groupTitle: string, id: string) => {
    const next = groups.map((g) =>
      g.title !== groupTitle
        ? g
        : {
            ...g,
            items: g.items.map((item) =>
              item.id !== id
                ? item
                : {
                    ...item,
                    status:
                      item.status === 'off'
                        ? ('testing' as const)
                        : item.status === 'testing'
                          ? ('active' as const)
                          : ('off' as const),
                    statusLabel: undefined,
                  }
            ),
          }
    );
    setGroups(next);
    saveGroups(next);
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(ACCESS_KEY).catch(() => undefined);
    setCopyMsg('Скопійовано');
    setTimeout(() => setCopyMsg(''), 2000);
  };

  return (
    <div className={styles.page}>
      <div className={styles.siteChrome}>
        <Header />
      </div>

      <div className={styles.container}>
        <nav className={styles.breadcrumbs}>
          <Link to="/">Головна</Link> / <span>Адмінпанель</span> / <span>Інтеграції</span>
        </nav>

        <div className={styles.greenArea}>
          <AdminSidebar />

          <main className={styles.main}>
            <h1 className={styles.title}>Інтеграції та зовнішні сервіси</h1>

            <p className={styles.empty}>
              Керування інтеграціями працює в демо-режимі (клік на «Налаштувати» перемикає статус
              локально) — на бекенді ще немає реальних з’єднань із зовнішніми сервісами.
            </p>

            <div className={styles.keyCard}>
              <span className={styles.keyLabel}>Ключ доступу платформи</span>
              <div className={styles.keyRow}>
                <div className={styles.keyValue}>{ACCESS_KEY}</div>
                <button type="button" className={styles.outlineBtn} onClick={handleCopy}>
                  Копіювати
                </button>
              </div>
              {copyMsg && <span className={styles.copyMsg}>{copyMsg}</span>}
            </div>

            {groups.map((group) => (
              <section key={group.title} className={styles.group}>
                <h2 className={styles.sectionTitle}>{group.title}</h2>
                <ul className={styles.list}>
                  {group.items.map((item) => (
                    <li key={item.id} className={styles.card}>
                      <h3 className={styles.cardName}>{item.name}</h3>
                      <p className={styles.desc}>{item.description}</p>
                      <div className={styles.cardFooter}>
                        <span
                          className={`${styles.badge} ${
                            item.status === 'off' ? styles.badgeOff : item.status === 'testing' ? styles.badgeWarn : styles.badgeOk
                          }`}
                        >
                          {item.statusLabel ?? STATUS_LABEL[item.status]}
                        </span>
                        <button
                          type="button"
                          className={styles.outlineBtn}
                          onClick={() => handleConfigure(group.title, item.id)}
                          aria-label={`Налаштувати: ${item.name}`}
                        >
                          Налаштувати
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ))}

            <section className={styles.group}>
              <h2 className={styles.sectionTitle}>Webhooks</h2>
              <div className={styles.webhookTable} role="table" aria-label="Вебхуки">
                <div className={styles.webhookHead} role="row">
                  <span role="columnheader">Подія</span>
                  <span role="columnheader">URL</span>
                  <span role="columnheader">Остання доставка</span>
                  <span role="columnheader">Статус</span>
                </div>
                {WEBHOOKS.map((w) => (
                  <div key={w.event} className={styles.webhookRow} role="row">
                    <span data-label="Подія">{w.event}</span>
                    <span className={styles.webhookUrl} data-label="URL">{w.url}</span>
                    <span data-label="Остання доставка">{w.lastDelivery}</span>
                    <span data-label="Статус">
                      <span className={`${styles.badge} ${w.statusCode === 'ok' ? styles.badgeOk : styles.badgeOff}`}>
                        {w.statusLabel}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </main>
        </div>
      </div>

      <div className={styles.siteChrome}>
        <Footer />
      </div>
    </div>
  );
}
