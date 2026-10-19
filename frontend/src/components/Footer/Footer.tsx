import styles from './Footer.module.css';
import logoImg from '../../assets/images/logo-full.png';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerTop}>
        <div className={styles.footerLogo}>
          <img src={logoImg} alt="BlitzMall" className={styles.footerLogoImg} />
        </div>

        <div className={styles.footerLinks}>
          <div className={styles.footerLinkGroup}>
            <span className={styles.footerLinkTitle}>Покупцям</span>
            <div className={styles.footerLinkList}>
              <span className={styles.footerLink}>Доставка і оплата</span>
              <span className={styles.footerLink}>Гарантія та повернення</span>
              <span className={styles.footerLink}>Питання та відповіді</span>
            </div>
          </div>
          <div className={styles.footerLinkGroup}>
            <span className={styles.footerLinkTitle}>Про нас</span>
            <div className={styles.footerLinkList}>
              <span className={styles.footerLink}>Про компанію</span>
              <span className={styles.footerLink}>Контакти</span>
              <span className={styles.footerLink}>Блог</span>
            </div>
          </div>
          <div className={styles.footerLinkGroup}>
            <span className={styles.footerLinkTitle}>Допомога</span>
            <div className={styles.footerLinkList}>
              <span className={styles.footerLink}>Підтримка 24/7</span>
              <span className={styles.footerLink}>Умови користування</span>
              <span className={styles.footerLink}>Політика конфіденційності</span>
            </div>
          </div>
        </div>

        <div className={styles.footerSocial}>
          <span className={styles.socialTitle}>Ми в соцмережах</span>
          <div className={styles.socialIcons}>
            <button className={styles.socialBtn} aria-label="Instagram">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="2" width="20" height="20" rx="5" stroke="#323f37" strokeWidth="2"/>
                <circle cx="12" cy="12" r="4" stroke="#323f37" strokeWidth="2"/>
                <circle cx="17.5" cy="6.5" r="1.2" fill="#323f37"/>
              </svg>
            </button>
            <button className={styles.socialBtn} aria-label="Facebook">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" stroke="#323f37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className={styles.socialBtn} aria-label="Telegram">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="#323f37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="#323f37" strokeWidth="1.5"/>
          <path d="M15 9.5A4 4 0 1 0 15 14.5" stroke="#323f37" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <span className={styles.copyright}>2026 BlitzMall</span>
      </div>
    </footer>
  );
}