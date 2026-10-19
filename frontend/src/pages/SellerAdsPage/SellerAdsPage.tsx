import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './SellerAdsPage.module.css';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import SellerSidebar from '../../components/Sellersidebar/Sellersidebar';

export default function SellerAdsPage() {
  const { user } = useAuth();

  if (!user || user.role !== 'Seller') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className={styles.page}>
      <Header />

      <div className={styles.container}>
        <nav className={styles.breadcrumbs}>
          <Link to="/">Головна</Link> / <span>Кабінет продавця</span> / <span>Реклама</span>
        </nav>

        <div className={styles.greenArea}>
          <SellerSidebar />

          <main className={styles.main}>
            <h1 className={styles.title}>Рекламні компанії</h1>

            <p className={styles.placeholderNote}>
              Запуск і керування рекламними кампаніями поки недоступні — на бекенді ще немає
              системи для їх створення й відстеження.
            </p>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}