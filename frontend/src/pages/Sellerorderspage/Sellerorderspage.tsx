import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './SellerOrdersPage.module.css';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import SellerSidebar from '../../components/Sellersidebar/Sellersidebar';
import { ordersApi, type OrderDto } from '../../api/orders';

const STATUS_LABEL: Record<string, string> = {
  Pending: 'Новий',
  Paid: 'Оплачено',
};

const STATUS_CLASS: Record<string, string> = {
  Pending: styles.statusNew,
  Paid: styles.statusDelivered,
};

const priceFormat = new Intl.NumberFormat('uk-UA');
const formatDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' }) : '—';

export default function SellerOrdersPage() {
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

  return (
    <div className={styles.page}>
      <Header />

      <div className={styles.container}>
        <nav className={styles.breadcrumbs}>
          <Link to="/">Головна</Link> / <span>Кабінет продавця</span> / <span>Замовлення</span>
        </nav>

        <div className={styles.greenArea}>
          <SellerSidebar />

          <main className={styles.main}>
            <h1 className={styles.title}>Замовлення</h1>

            {loading ? (
              <p className={styles.empty}>Завантаження...</p>
            ) : orders.length === 0 ? (
              <p className={styles.empty}>Замовлень поки немає. Нові замовлення з’являться тут.</p>
            ) : (
              <div className={styles.table} role="table" aria-label="Замовлення">
                <div className={styles.head} role="row">
                  <span className={styles.headCellLeft} role="columnheader">Номер</span>
                  <span role="columnheader">Дата</span>
                  <span role="columnheader">Телефон</span>
                  <span role="columnheader">Адреса</span>
                  <span role="columnheader">Сума</span>
                  <span role="columnheader">Статус</span>
                </div>

                {orders.map((o) => (
                  <div key={o.id} className={styles.row} role="row">
                    <div className={styles.cellNumber} role="cell">
                      #{o.id}
                    </div>
                    <div className={styles.cell} role="cell" data-label="Дата">
                      {formatDate(o.createdDate)}
                    </div>
                    <div className={styles.cell} role="cell" data-label="Телефон">
                      {o.phone}
                    </div>
                    <div className={styles.cell} role="cell" data-label="Адреса">
                      {o.deliveryAddress}
                    </div>
                    <div className={`${styles.cell} ${styles.cellStrong}`} role="cell" data-label="Сума">
                      {priceFormat.format(o.totalAmount)} ₴
                    </div>

                    <div className={`${styles.cell} ${styles.cellStatus}`} role="cell">
                      <span className={`${styles.status} ${STATUS_CLASS[o.orderStatus] ?? ''}`}>
                        {STATUS_LABEL[o.orderStatus] ?? o.orderStatus}
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