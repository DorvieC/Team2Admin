import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import AuthHeader from '../../components/AuthHeader/AuthHeader';
import {
  firebaseRegister,
  getFirebaseIdToken,
  isPhoneFormat,
  mapFirebaseError,
} from '../../firebase/auth';
import styles from '../RegisterPage/RegisterPage.module.css';

interface FormState {
  shopName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
}

type Errors = Partial<Record<keyof FormState, string>>;

export default function SellerRegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState<FormState>({
    shopName: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const errs: Errors = {};
    if (!form.shopName.trim()) errs.shopName = 'Вкажіть назву магазину';
    if (!form.firstName.trim()) errs.firstName = "Вкажіть ім'я";
    if (!form.lastName.trim()) errs.lastName = 'Вкажіть прізвище';
    if (!form.email.trim()) {
      errs.email = 'Вкажіть email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Невірний формат email';
    }
    if (!form.phone.trim()) {
      errs.phone = 'Вкажіть номер телефону';
    } else if (!isPhoneFormat(form.phone)) {
      errs.phone = 'Невірний формат номера';
    }
    if (!form.password) {
      errs.password = 'Вкажіть пароль';
    } else if (form.password.length < 8) {
      errs.password = 'Мінімум 8 символів';
    }
    if (!form.confirmPassword) {
      errs.confirmPassword = 'Підтвердіть пароль';
    } else if (form.password !== form.confirmPassword) {
      errs.confirmPassword = 'Паролі не співпадають';
    }
    if (!form.agreeTerms) errs.agreeTerms = 'Прийміть умови використання';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setServerError('');
    try {
      const name = `${form.firstName} ${form.lastName}`.trim();
      const credential = await firebaseRegister(form.email, form.password, name);
      const idToken = await getFirebaseIdToken(credential);
      const response = await authApi.registerSeller(idToken, {
        shopName: form.shopName.trim(),
        phone: form.phone.trim(),
      });
      login(response.token, response.user);
      navigate('/seller');
    } catch (err: unknown) {
      if ((err as { code?: string })?.code) {
        setServerError(mapFirebaseError(err));
      } else {
        const e = err as { response?: { data?: { message?: string } } };
        setServerError(e.response?.data?.message || 'Помилка реєстрації. Спробуйте ще раз.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Помощник, чтобы не дублировать разметку полей
  const renderField = (
    key: keyof FormState,
    label: string,
    placeholder: string,
    type = 'text',
  ) => (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      <input
        className={`${styles.input} ${errors[key] ? styles.error : ''}`}
        type={type}
        placeholder={placeholder}
        value={form[key] as string}
        onChange={set(key)}
      />
      {errors[key] && <span className={styles.errorMsg}>{errors[key]}</span>}
    </div>
  );

  return (
    <div className={styles.page}>
      <AuthHeader />

      <div className={styles.pageOuter}>
        <div className={styles.backRow}>
          <button className={styles.backArrow} onClick={() => navigate(-1)} aria-label="Назад">
            <svg width="24" height="16" viewBox="0 0 24 16" fill="none">
              <path
                d="M23 8H1M1 8L8 1M1 8L8 15"
                stroke="#323f37"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div className={styles.greenArea}>
          <div className={styles.content}>
            <div className={styles.left}>
              <div className={styles.leftTop}>
                <h1 className={styles.leftTitle}>Продавайте на BlitzMall</h1>
                <p className={styles.leftSub}>
                  Створіть акаунт продавця, додайте свої товари та отримуйте замовлення онлайн
                </p>
              </div>

              <div className={styles.shoppingWrap}>
                <img
                  src="/shopping-illustration.png"
                  alt="Shopping online"
                  className={styles.shoppingImg}
                />
                <div className={styles.shoppingRibbon}>
                  <span>blitzmall.pp.ua</span>
                </div>
              </div>
            </div>

            <div className={styles.right}>
              <h2 className={styles.formTitle}>Акаунт продавця</h2>

              <form className={styles.form} onSubmit={handleSubmit} noValidate>
                {renderField('shopName', 'Назва магазину', 'Наприклад, TechStore')}

                <div className={styles.row2}>
                  {renderField('firstName', "Ім'я", "Ваше ім'я")}
                  {renderField('lastName', 'Прізвище', 'Ваше прізвище')}
                </div>

                {renderField('email', 'Email', 'exmple@mail.com', 'email')}
                {renderField('phone', 'Номер телефону', '+380 XX XXX XX XX', 'tel')}
                {renderField('password', 'Пароль', 'Мінімум 8 символів', 'password')}
                {renderField('confirmPassword', 'Підтвердіть пароль', 'Повторіть пароль', 'password')}

                <div className={styles.termsRow}>
                  <label className={styles.checkbox}>
                    <input type="checkbox" checked={form.agreeTerms} onChange={set('agreeTerms')} />
                    <span className={styles.checkboxBox} />
                  </label>
                  <div className={styles.termsInner}>
                    <span className={styles.termsNormal}>Я погоджуюсь з</span>
                    <button type="button" className={styles.termsLink}>
                      умовами<br />користування
                    </button>
                  </div>
                </div>
                {errors.agreeTerms && <span className={styles.errorMsg}>{errors.agreeTerms}</span>}

                {serverError && <div className={styles.serverError}>{serverError}</div>}

                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading ? 'Реєстрація...' : 'Стати продавцем'}
                </button>
              </form>

              <div className={styles.accountLink}>
                <span className={styles.accountLinkText}>
                  Вже маєте акаунт? <Link to="/login">Увійти</Link>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}