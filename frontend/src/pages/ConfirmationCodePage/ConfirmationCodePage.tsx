import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import AuthHeader from '../../components/AuthHeader/AuthHeader';
import { firebaseSendPasswordReset, mapFirebaseError } from '../../firebase/auth';
import styles from './ConfirmationCodePage.module.css';

export default function ConfirmationCodePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as { email?: string } | null)?.email ?? '';
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState('');

  const handleResend = async () => {
    if (!email) return;
    setLoading(true);
    setError('');
    setResent(false);
    try {
      await firebaseSendPasswordReset(email);
      setResent(true);
    } catch (err) {
      setError(mapFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <AuthHeader />

      <div className={styles.pageOuter}>
        <div className={styles.backRow}>
          <button className={styles.backArrow} onClick={() => navigate(-1)} aria-label="Назад">
            <svg width="24" height="16" viewBox="0 0 24 16" fill="none">
              <path d="M23 8H1M1 8L8 1M1 8L8 15" stroke="#323f37" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className={styles.greenArea}>
          <div className={styles.content}>
            <div className={styles.left}>
              <span className={styles.badge}>ЛИСТ НАДІСЛАНО</span>
              <div className={styles.titleRow}>
                <h1 className={styles.leftTitle}>Перевірте пошту</h1>
                <img
                  src="/illus-confirm-code.png"
                  alt="Перевірте повідомлення"
                  className={styles.illustration}
                />
              </div>

              <p className={styles.leftSub}>
                Ми надіслали посилання для відновлення паролю на {email || 'вашу поштову скриньку'}.
                Перейдіть за посиланням у листі, щоб встановити новий пароль.
              </p>

              <div className={styles.benefits}>
                <div className={styles.benefit}>
                  <svg className={styles.benefitIcon} viewBox="0 0 24 24" fill="none" stroke="#23753f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <span className={styles.benefitText}>Посилання дійсне протягом обмеженого часу</span>
                </div>
                <div className={styles.benefit}>
                  <svg className={styles.benefitIcon} viewBox="0 0 24 24" fill="none" stroke="#23753f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <polyline points="9 12 11 14 15 10"/>
                  </svg>
                  <span className={styles.benefitText}>Нікому не передавайте це посилання</span>
                </div>
                <div className={styles.benefit}>
                  <svg className={styles.benefitIcon} viewBox="0 0 24 24" fill="none" stroke="#23753f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
                    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
                  </svg>
                  <span className={styles.benefitText}>Підтримка 24/7 — ми завжди поруч</span>
                </div>
              </div>
            </div>
            <div className={styles.right}>
              <h2 className={styles.formTitle}>Лист надіслано</h2>
              <p className={styles.leftSub}>
                Не бачите листа? Перевірте папку "Спам" або надішліть його повторно.
              </p>

              {resent && <div className={styles.successMsg}>Лист надіслано повторно.</div>}
              {error && <div className={styles.errorMsg}>{error}</div>}

              <button
                type="button"
                className={styles.submitBtn}
                onClick={handleResend}
                disabled={loading || !email}
              >
                {loading ? 'Надсилання...' : 'Надіслати повторно'}
              </button>

              <div className={styles.accountLink}>
                <span className={styles.accountLinkText}>
                  Згадали пароль?{' '}
                  <Link to="/login">Увійти</Link>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
