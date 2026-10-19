import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './SellerFinancePage.module.css';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import SellerSidebar from '../../components/Sellersidebar/Sellersidebar';
import { ordersApi, type OrderDto } from '../../api/orders';

const STATUS_LABEL: Record<string, string> = {
  Pending: 'Очікує',
  Paid: 'Виплачено',
};

const numberFormat = new Intl.NumberFormat('uk-UA');
const money = (n: number) => `${numberFormat.format(n)} ₴`;

export default function SellerFinancePage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'Seller') return;
    ordersApi
      .getBySeller()
      .then(setOrders)
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [user]);

  if (!user || user.role !== 'Seller') {
    return <Navigate to="/login" replace />;
  }

  const paid = orders.filter((o) => o.orderStatus === 'Paid');
  const totalTurnover = paid.reduce((s, o) => s + o.totalAmount, 0);
  const now = new Date();
  const thisMonthTurnover = paid
    .filter((o) => o.createdDate && new Date(o.createdDate).getMonth() === now.getMonth())
    .reduce((s, o) => s + o.totalAmount, 0);

  const STATS = [
    { title: 'Загальний оборот', value: money(totalTurnover), note: `${paid.length} замовлень`, tone: 'green' as const },
    { title: 'Оборот за цей місяць', value: money(thisMonthTurnover), note: '', tone: 'green' as const },
    { title: 'Усього замовлень', value: String(orders.length), note: '', tone: 'green' as const },
    { title: 'В очікуванні оплати', value: String(orders.length - paid.length), note: '', tone: 'red' as const },
  ];

  return (
    <div className={styles.page}>
      <Header />

      <div className={styles.container}>
        <nav className={styles.breadcrumbs}>
          <Link to="/">Головна</Link> / <span>Кабінет продавця</span> / <span>Фінанси</span>
        </nav>

        <div className={styles.greenArea}>
          <SellerSidebar />

          <main className={styles.main}>
            <h1 className={styles.title}>Фінанси</h1>

            <div className={styles.stats}>
              {STATS.map((s) => (
                <div key={s.title} className={styles.statCard}>
                  <span className={styles.statTitle}>{s.title}</span>
                  <span className={styles.statValue}>{s.value}</span>
                  <span className={s.tone === 'green' ? styles.statUp : styles.statDown}>
                    {s.note}
                  </span>
                </div>
              ))}
            </div>

            <div className={styles.tableWrap}>
              <div className={styles.table}>
                <div className={`${styles.row} ${styles.head}`}>
                  <span>ЗАМОВЛЕННЯ</span>
                  <span>ДАТА</span>
                  <span>СУМА</span>
                  <span>СТАТУС</span>
                </div>

                <div className={styles.body}>
                  {loading ? (
                    <p style={{ padding: 16 }}>Завантаження...</p>
                  ) : orders.length === 0 ? (
                    <p style={{ padding: 16 }}>Поки немає замовлень з вашими товарами.</p>
                  ) : (
                    orders.map((o) => (
                      <div key={o.id} className={styles.row}>
                        <span className={styles.cellBold} data-label="Замовлення">#{o.id}</span>
                        <span className={styles.cellBold} data-label="Дата">
                          {o.createdDate ? new Date(o.createdDate).toLocaleDateString('uk-UA') : '—'}
                        </span>
                        <span className={styles.cellBold} data-label="Сума">{money(o.totalAmount)}</span>
                        <span data-label="Статус">
                          <span
                            className={`${styles.badge} ${
                              o.orderStatus === 'Paid' ? styles.badgePaid : styles.badgeProcessing
                            }`}
                          >
                            {STATUS_LABEL[o.orderStatus] ?? o.orderStatus}
                          </span>
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}