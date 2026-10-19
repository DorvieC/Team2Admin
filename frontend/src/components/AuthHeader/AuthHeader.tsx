import { Link } from 'react-router-dom';
import logoImg from '../../assets/images/logo-full.png';
import globeIcon from '../../assets/icons/globe.svg';
import styles from './AuthHeader.module.css';

export default function AuthHeader() {
  return (
    <header className={styles.header}>
      <Link to="/" className={styles.logo}>
        <img src={logoImg} alt="BlitzMall" className={styles.logoImg} />
      </Link>
      <div className={styles.right}>
        <img src={globeIcon} alt="" className={styles.globeIcon} />
        <span className={styles.lang}>UA</span>
      </div>
    </header>
  );
}
