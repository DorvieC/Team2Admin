import { Link } from 'react-router-dom';
import AuthHeader from '../../components/AuthHeader/AuthHeader';
import styles from './ConfirmNewPasswordPage.module.css';

export default function ConfirmNewPasswordPage() {
  return (
    <div className={styles.page}>
      <AuthHeader />
      <div className={styles.pageOuter}>
        <div className={styles.greenArea}>
          <div className={styles.iconWrap}>
            <img src="/illus-trophy.png" alt="Трофей" className={styles.trophyIcon} />
          </div>

          <h1 className={styles.title}>Пароль успішно змінено</h1>
          <p className={styles.description}>
            Тепер ви можете увійти в акаунт, використовуючи новий пароль, і продовжити покупки.
          </p>

          <Link to="/login" className={styles.loginBtn}>
            Увійти в акаунт
          </Link>
        </div>
      </div>
    </div>
  );
}
