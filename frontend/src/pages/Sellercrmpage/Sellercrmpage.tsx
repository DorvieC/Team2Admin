import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './SellerCrmPage.module.css';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import SellerSidebar from '../../components/Sellersidebar/Sellersidebar';
import { ordersApi } from '../../api/orders';

type Segment = 'new' | 'active' | 'vip' | 'churn';

interface Customer {
  userId: number;
  ordersCount: number;
  totalSpent: number;
  lastOrder?: string;
  segment: Segment;
}

const SEGMENT_LABEL: Record<Segment, string> = {
  active: 'Активний',
  new: 'Новий',
  vip: 'VIP',
  churn: 'Ризик відтоку',
};

const SEGMENT_CLASS: Record<Segment, string> = {
  active: styles.segActive,
  new: styles.segNew,
  vip: styles.segVip,
  churn: styles.segChurn,
};

function computeSegment(ordersCount: number, lastOrder?: string): Segment {
  if (lastOrder) {
    const daysSince = (Date.now() - new Date(lastOrder).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince > 60) return 'churn';
  }
  if (ordersCount >= 5) return 'vip';
  if (ordersCount === 1) return 'new';
  return 'active';
}

const priceFormat = new Intl.NumberFormat('uk-UA');
const formatDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' }) : '—';

export default function SellerCrmPage() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'Seller') return;
    ordersApi
      .getBySeller()
      .then((orders) => {
        const byBuyer = new Map<number, { ordersCount: number; totalSpent: number; lastOrder?: string }>();
        for (const o of orders) {
          if (!o.userId) continue;
          const entry = byBuyer.get(o.userId) ?? { ordersCount: 0, totalSpent: 0, lastOrder: undefined };
          entry.ordersCount += 1;
          entry.totalSpent += o.totalAmount;
          if (!entry.lastOrder || (o.createdDate && o.createdDate > entry.lastOrder)) {
            entry.lastOrder = o.createdDate;
          }
          byBuyer.set(o.userId, entry);
        }
        const list: Customer[] = Array.from(byBuyer.entries())
          .map(([userId, v]) => ({
            userId,
            ordersCount: v.ordersCount,
            totalSpent: v.totalSpent,
            lastOrder: v.lastOrder,
            segment: computeSegment(v.ordersCount, v.lastOrder),
          }))
          .sort((a, b) => b.totalSpent - a.totalSpent);
        setCustomers(list);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [user]);

  if (!user || user.role !== 'Seller') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className={styles.page}>
      <Header />

      <div className={styles.container}>
        <nav className={styles.breadcrumbs}>
          <Link to="/">Головна</Link> / <span>Кабінет продавця</span> / <span>CRM</span>
        </nav>

        <div className={styles.greenArea}>
          <SellerSidebar />

          <main className={styles.main}>
            <h1 className={styles.title}>CRM: клієнти</h1>
            <p className={styles.note}>
              Список розраховано з реальних замовлень. Ім'я покупця недоступне (бекенд не дає
              продавцю доступ до профілів користувачів), тому клієнти показані за номером.
              Розсилка промокодів поки не підтримується бекендом.
            </p>

            {loading ? (
              <p className={styles.empty}>Завантаження...</p>
            ) : customers.length === 0 ? (
              <p className={styles.empty}>Клієнтів поки немає. Вони з’являться після перших замовлень.</p>
            ) : (
              <div className={styles.table} role="table" aria-label="Клієнти">
                {/* ── Заголовки (на планшете и телефоне скрыты) ── */}
                <div className={styles.head} role="row">
                  <span className={styles.headCellLeft} role="columnheader">Клієнт</span>
                  <span role="columnheader">Замовлень</span>
                  <span role="columnheader">Сума</span>
                  <span role="columnheader">Останнє</span>
                  <span role="columnheader">Сегмент</span>
                </div>

                {customers.map((c) => (
                  <div key={c.userId} className={styles.row} role="row">
                    <div className={styles.cellClient} role="cell">
                      <span className={styles.avatar} aria-hidden="true">
                        #{c.userId}
                      </span>
                      <span className={styles.clientName}>Покупець #{c.userId}</span>
                    </div>

                    <div className={`${styles.cell} ${styles.cellOrders}`} role="cell" data-label="Замовлень">
                      {c.ordersCount}
                    </div>
                    <div className={`${styles.cell} ${styles.cellSum}`} role="cell" data-label="Сума">
                      {priceFormat.format(c.totalSpent)} ₴
                    </div>
                    <div className={`${styles.cell} ${styles.cellLast}`} role="cell" data-label="Останнє">
                      {formatDate(c.lastOrder)}
                    </div>

                    <div className={`${styles.cell} ${styles.cellSegment}`} role="cell">
                      <span className={`${styles.segment} ${SEGMENT_CLASS[c.segment]}`}>
                        {SEGMENT_LABEL[c.segment]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}