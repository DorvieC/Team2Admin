import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import AdminSidebar from '../../components/Adminsidebar/Adminsidebar';
import styles from './AdminDisputesPage.module.css';

const DEV_SKIP_AUTH = false;
const DEV_USER = { name: 'Тест Адмін', role: 'admin' };

type DisputeStatus = 'open' | 'closed';
type Resolution = 'refund' | 'seller';

interface Dispute {
  id: string;
  title: string;
  buyer: string;
  seller: string;
  daysOpen: number;
  orderId: string;
  amount: number;
  status: DisputeStatus;
  resolution?: Resolution;
  evidenceRequested?: boolean;
}

const RESOLUTION_LABEL: Record<Resolution, string> = {
  refund: 'повернення коштів',
  seller: 'на користь продавця',
};

const STORAGE_KEY = 'blitzmall_admin_disputes';

const DEFAULT_DISPUTES: Dispute[] = [
  { id: 'D-2211', title: 'Товар не відповідає опису', buyer: 'А. Шевчук', seller: 'SportFactory', daysOpen: 2, orderId: 'BM-104390', amount: 3360, status: 'open' },
  { id: 'D-2411', title: 'Не отримано посилку', buyer: 'Н. Гриненко', seller: 'BeautyRoom', daysOpen: 5, orderId: 'BM-103390', amount: 640, status: 'open' },
  { id: 'D-2011', title: 'Пошкоджено при доставці', buyer: 'А. Шевчук', seller: 'KidsWorld', daysOpen: 12, orderId: 'BM-102490', amount: 1260, status: 'closed', resolution: 'refund' },
];

function loadDisputes(): Dispute[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Dispute[]) : DEFAULT_DISPUTES;
  } catch {
    return DEFAULT_DISPUTES;
  }
}

function saveDisputes(list: Dispute[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

const priceFormat = new Intl.NumberFormat('uk-UA');

function daysLabel(n: number): string {
  const last = n % 10;
  const lastTwo = n % 100;
  if (last === 1 && lastTwo !== 11) return `${n} день`;
  if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) return `${n} дні`;
  return `${n} днів`;
}

export default function AdminDisputesPage() {
  const { user: authUser } = useAuth();
  const user = DEV_SKIP_AUTH ? DEV_USER : authUser;
  const [disputes, setDisputes] = useState<Dispute[]>(loadDisputes);

  if (!user || user.role !== 'Admin') {
    return <Navigate to="/login" replace />;
  }

  const update = (next: Dispute[]) => {
    setDisputes(next);
    saveDisputes(next);
  };

  const resolve = (id: string, resolution: Resolution) => {
    update(disputes.map((d) => (d.id === id ? { ...d, status: 'closed', resolution } : d)));
  };

  const requestEvidence = (id: string) => {
    update(disputes.map((d) => (d.id === id ? { ...d, evidenceRequested: true } : d)));
  };

  return (
    <div className={styles.page}>
      <div className={styles.siteChrome}>
        <Header />
      </div>

      <div className={styles.container}>
        <nav className={styles.breadcrumbs}>
          <Link to="/">Головна</Link> / <span>Адмінпанель</span> / <span>Спори</span>
        </nav>

        <div className={styles.greenArea}>
          <AdminSidebar />

          <main className={styles.main}>
            <h1 className={styles.title}>Спори</h1>

            <p className={styles.note}>
              Розгляд спорів працює локально (демо-режим) — на бекенді ще немає сутності для
              претензій між покупцем і продавцем.
            </p>

            {disputes.length === 0 ? (
              <p className={styles.empty}>Спорів поки немає.</p>
            ) : (
              <ul className={styles.list}>
                {disputes.map((d) => (
                  <li key={d.id} className={styles.card}>
                    <div className={styles.cardHead}>
                      <h2 className={styles.cardName}>{d.id}</h2>
                      <span className={`${styles.badge} ${d.status === 'open' ? styles.badgeWarn : styles.badgeMuted}`}>
                        {d.status === 'open' ? 'Відкрито' : 'Закрито'}
                      </span>
                    </div>

                    <h3 className={styles.disputeTitle}>{d.title}</h3>
                    <p className={styles.desc}>
                      {d.buyer} проти {d.seller}
                    </p>

                    <dl className={styles.facts}>
                      <div className={styles.fact}>
                        <dt className={styles.factLabel}>Відкрито</dt>
                        <dd className={styles.factValue}>
                          {daysLabel(d.daysOpen)}, замовлення {d.orderId}
                        </dd>
                      </div>
                      <div className={styles.fact}>
                        <dt className={styles.factLabel}>Сума</dt>
                        <dd className={styles.factValue}>{priceFormat.format(d.amount)} ₴</dd>
                      </div>
                    </dl>

                    {d.status === 'open' ? (
                      <div className={styles.actions}>
                        <button type="button" className={styles.primaryBtn} onClick={() => resolve(d.id, 'refund')}>
                          Повернути покупцю
                        </button>
                        <button type="button" className={styles.outlineBtn} onClick={() => resolve(d.id, 'seller')}>
                          На користь продавця
                        </button>
                        <button
                          type="button"
                          className={styles.outlineBtn}
                          onClick={() => requestEvidence(d.id)}
                          disabled={d.evidenceRequested}
                        >
                          {d.evidenceRequested ? 'Докази запрошено' : 'Запросити докази'}
                        </button>
                      </div>
                    ) : (
                      d.resolution && (
                        <p className={styles.resolution}>Рішення: {RESOLUTION_LABEL[d.resolution]}</p>
                      )
                    )}
                  </li>
                ))}
              </ul>
            )}
          </main>
        </div>
      </div>

      <div className={styles.siteChrome}>
        <Footer />
      </div>
    </div>
  );
}
