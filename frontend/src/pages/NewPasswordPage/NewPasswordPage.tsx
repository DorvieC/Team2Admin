import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AuthHeader from '../../components/AuthHeader/AuthHeader';
import { firebaseVerifyResetCode, firebaseConfirmPasswordReset, mapFirebaseError } from '../../firebase/auth';
import styles from './NewPasswordPage.module.css';

interface Errors { password?: string; confirmPassword?: string; }

export default function NewPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const oobCode = searchParams.get('oobCode') ?? '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [linkValid, setLinkValid] = useState<boolean | null>(null);

  useEffect(() => {
    if (!oobCode) {
      setLinkValid(false);
      return;
    }
    firebaseVerifyResetCode(oobCode)
      .then(() => setLinkValid(true))
      .catch(() => setLinkValid(false));
  }, [oobCode]);

  const validate = (): boolean => {
    const errs: Errors = {};
    if (!password) errs.password = 'Вкажіть пароль';
    else if (password.length < 8) errs.password = 'Мінімум 8 символів';
    if (!confirmPassword) errs.confirmPassword = 'Підтвердіть пароль';
    else if (password !== confirmPassword) errs.confirmPassword = 'Паролі не співпадають';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setServerError('');
    try {
      await firebaseConfirmPasswordReset(oobCode, password);
      navigate('/confirm-new-password');
    } catch (err) {
      setServerError(mapFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  const EyeIcon = ({ visible }: { visible: boolean }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {visible ? (
        <>
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
          <line x1="1" y1="1" x2="23" y2="23"/>
        </>
      ) : (
        <>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </>
      )}
    </svg>
  );

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
              <span className={styles.badge}>ОСТАННІЙ КРОК</span>
              <div className={styles.titleIllustrationRow}>
                <h1 className={styles.leftTitle}>Створіть новий пароль</h1>
                <div className={styles.illustrationStack}>
                  <img src="/illus-shield.png" alt="" className={styles.shieldImg} />
                  <img src="/illus-person-key.png" alt="" className={styles.personKeyImg} />
                </div>
              </div>
              <p className={styles.leftSub}>
                Обирайте надійний пароль, який ви ще не використовували,
                щоб захистити свій акаунт
              </p>
              <div className={styles.benefits}>
                <div className={styles.benefit}>
                  <svg className={styles.checkIcon} viewBox="0 0 24 24" fill="none" stroke="#23753f" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span className={styles.benefitText}>Щонайменше 8 символів</span>
                </div>
                <div className={styles.benefit}>
                  <svg className={styles.checkIcon} viewBox="0 0 24 24" fill="none" stroke="#23753f" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span className={styles.benefitText}>Літери, цифри та символи</span>
                </div>
                <div className={styles.benefit}>
                  <svg className={styles.benefitIcon} viewBox="0 0 24 24" fill="none" stroke="#23753f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                  <span className={styles.benefitText}>Не використовуйте старий пароль</span>
                </div>
              </div>
            </div>
            <div className={styles.right}>
              <h2 className={styles.formTitle}>Новий пароль</h2>

              {linkValid === false && (
                <div className={styles.errorMsg}>
                  Посилання недійсне або застаріле. Запросіть нове відновлення паролю.
                </div>
              )}

              <form className={styles.form} onSubmit={handleSubmit} noValidate>
                <div className={styles.field}>
                  <label className={styles.label}>Новий пароль</label>
                  <div className={styles.inputWrap}>
                    <input
                      className={`${styles.input} ${errors.password ? styles.error : ''}`}
                      type={showPass ? 'text' : 'password'}
                      placeholder="Введіть новий пароль"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined })); }}
                    />
                    <button type="button" className={styles.eyeBtn} onClick={() => setShowPass(v => !v)} tabIndex={-1}>
                      <EyeIcon visible={showPass} />
                    </button>
                  </div>
                  {errors.password && <span className={styles.errorMsg}>{errors.password}</span>}
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Пароль</label>
                  <div className={styles.inputWrap}>
                    <input
                      className={`${styles.input} ${errors.confirmPassword ? styles.error : ''}`}
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Повторіть новий пароль"
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setErrors(p => ({ ...p, confirmPassword: undefined })); }}
                    />
                    <button type="button" className={styles.eyeBtn} onClick={() => setShowConfirm(v => !v)} tabIndex={-1}>
                      <EyeIcon visible={showConfirm} />
                    </button>
                  </div>
                  {errors.confirmPassword && <span className={styles.errorMsg}>{errors.confirmPassword}</span>}
                </div>

                {serverError && <div className={styles.errorMsg}>{serverError}</div>}

                <button type="submit" className={styles.submitBtn} disabled={loading || linkValid !== true}>
                  {loading ? 'Збереження...' : 'Зберегти пароль'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
