import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { ConfirmationResult } from 'firebase/auth';
import AuthHeader from '../../components/AuthHeader/AuthHeader';
import {
  firebaseSendPasswordReset,
  firebaseSendPhoneOtp,
  firebaseUpdatePassword,
  firebaseLogout,
  isEmailFormat,
  isPhoneFormat,
  normalizePhone,
  mapFirebaseError,
} from '../../firebase/auth';
import styles from './PasswordRecoveryPage.module.css';

export default function PasswordRecoveryPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [step, setStep] = useState<'request' | 'verify-phone'>('request');
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!value) return;
    setLoading(true);
    setServerError('');
    try {
      if (isEmailFormat(value)) {
        await firebaseSendPasswordReset(value);
        navigate('/confirmation-code', { state: { email: value } });
      } else if (isPhoneFormat(value)) {
        const result = await firebaseSendPhoneOtp(normalizePhone(value));
        setConfirmation(result);
        setStep('verify-phone');
      } else {
        setServerError('Введіть коректний email або номер телефону у форматі +380XXXXXXXXX');
      }
    } catch (err) {
      setServerError(mapFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmation || code.length < 6 || newPassword.length < 8) return;
    setLoading(true);
    setServerError('');
    try {
      await confirmation.confirm(code);
      await firebaseUpdatePassword(newPassword);
      await firebaseLogout();
      navigate('/confirm-new-password');
    } catch (err) {
      setServerError(mapFirebaseError(err));
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
              <span className={styles.badge}>БЕЗПЕКА АКАУНТА</span>
              <h1 className={styles.leftTitle}>Відновимо доступ до вашого акаунта</h1>
              <div className={styles.subtitleRow}>
                <p className={styles.leftSub}>
                  Оберіть зручний спосіб отримання коду підтвердження, щоб швидко
                  встановити новий пароль і повернутися до покупок.
                </p>
                <img
                  src="/illus-pwd-recovery.png"
                  alt="Відновлення паролю"
                  className={styles.illustration}
                />
              </div>
              <div className={styles.benefits}>
                <div className={styles.benefit}>
                  <svg className={styles.benefitIcon} viewBox="0 0 24 24" fill="none" stroke="#23753f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <polyline points="9 12 11 14 15 10"/>
                  </svg>
                  <span className={styles.benefitText}>Захищені підтвердження через SMS або email</span>
                </div>
                <div className={styles.benefit}>
                  <svg className={styles.benefitIcon} viewBox="0 0 24 24" fill="none" stroke="#23753f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <span className={styles.benefitText}>Код дійсний протягом 10 хвилин</span>
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
              <h2 className={styles.formTitle}>Відновлення паролю</h2>

              {step === 'request' && (
                <form className={styles.form} onSubmit={handleSubmit} noValidate>
                  <div className={styles.field}>
                    <label className={styles.label}>Email або телефон</label>
                    <input
                      className={styles.input}
                      type="text"
                      placeholder="exmple@mail.com або +380XXXXXXXXX"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  {serverError && <div className={styles.serverError}>{serverError}</div>}

                  <button type="submit" className={styles.submitBtn} disabled={loading}>
                    {loading ? 'Надсилання...' : 'Надіслати код'}
                  </button>
                  <div className={styles.accountLink}>
                    <span className={styles.accountLinkText}>
                      Згадали пароль?{' '}
                      <Link to="/login">Увійти</Link>
                    </span>
                  </div>
                </form>
              )}

              {step === 'verify-phone' && (
                <form className={styles.form} onSubmit={handleVerifyPhone} noValidate>
                  <div className={styles.field}>
                    <label className={styles.label}>SMS-код</label>
                    <input
                      className={styles.input}
                      type="text"
                      inputMode="numeric"
                      placeholder="123456"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      required
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Новий пароль</label>
                    <input
                      className={styles.input}
                      type="password"
                      placeholder="Мінімум 8 символів"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>

                  {serverError && <div className={styles.serverError}>{serverError}</div>}

                  <button type="submit" className={styles.submitBtn} disabled={loading}>
                    {loading ? 'Перевірка...' : 'Змінити пароль'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
