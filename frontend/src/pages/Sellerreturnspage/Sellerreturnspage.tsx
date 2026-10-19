import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './SellerReturnsPage.module.css';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import SellerSidebar from '../../components/Sellersidebar/Sellersidebar';

export default function SellerReturnsPage() {
  const { user } = useAuth();

  if (!user || user.role !== 'Seller') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className={styles.page}>
      <Header />

      <div className={styles.container}>
        <nav className={styles.breadcrumbs}>
          <Link to="/">Головна</Link> / <span>Кабінет продавця</span> / <span>Повернення</span>
        </nav>

        <div className={styles.greenArea}>
          <SellerSidebar />

          <main className={styles.main}>
            <h1 className={styles.title}>Повернення та спори</h1>

            <p className={styles.empty}>
              Облік повернень і спорів поки недоступний — на бекенді ще немає сутності для заявок
              на повернення товару.
            </p>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}