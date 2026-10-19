import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent, ReactNode } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './SellerVerificationPage.module.css';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import SellerSidebar from '../../components/Sellersidebar/Sellersidebar';

type StepId = 'company' | 'documents' | 'contract' | 'bank';
type ModalType = 'company' | 'documents' | 'bank' | null;

interface Step {
  id: StepId;
  title: string;
  description: string;
  done: boolean;
  badge: string;
}

interface CompanyData {
  companyName: string;
  edrpou: string;
  firstName: string;
  lastName: string;
  phone: string;
}

interface BankData {
  recipient: string;
  bankName: string;
  iban: string;
}

interface DocItem {
  id: number;
  name: string;
  file?: File | null; // выбранный файл (ещё не отправлен на сервер)
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 МБ
const ACCEPTED_TYPES = '.pdf,.jpg,.jpeg,.png';

// TODO(бэк): заменить моки на данные с сервера
const INITIAL_STEPS: Step[] = [
  {
    id: 'company',
    title: 'Дані компанії',
    description: 'ФОП/ТОВ, ЄДРПОУ, контактна особа',
    done: true,
    badge: 'Заповнено',
  },
  {
    id: 'documents',
    title: 'Документи',
    description: 'Виписка з ЄДР, свідоцтво платника ПДВ',
    done: true,
    badge: 'Заповнено',
  },
  {
    id: 'contract',
    title: 'Договір оферти',
    description: 'Підписано електронним підписом 05.10.2026',
    done: true,
    badge: 'Підписано',
  },
  {
    id: 'bank',
    title: 'Банківські реквізити',
    description: 'IBAN для виплат і графік розрахунків',
    done: false,
    badge: 'Потрібно заповнити',
  },
];

const INITIAL_COMPANY: CompanyData = {
  companyName: 'ТОВ “BlitzMall”',
  edrpou: '00010566',
  firstName: 'Олег',
  lastName: 'Ковальський',
  phone: '+380 67 222 12 12',
};

const INITIAL_BANK: BankData = { recipient: '', bankName: '', iban: '' };

const INITIAL_DOCS: DocItem[] = [
  { id: 1, name: 'Виписка з ЄДР' },
  { id: 2, name: 'Свідоцтво платника ПДВ' },
];

/* ── Иконки ── */
const Icon = ({ children }: { children: ReactNode }) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

const EditIcon = () => (
  <Icon>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </Icon>
);
const DownloadIcon = () => (
  <Icon>
    <path d="M12 3v12" />
    <path d="m7 11 5 5 5-5" />
    <path d="M4 21h16" />
  </Icon>
);
const UploadIcon = () => (
  <Icon>
    <path d="M12 16V4" />
    <path d="m7 8 5-5 5 5" />
    <path d="M4 21h16" />
  </Icon>
);
const TrashIcon = () => (
  <Icon>
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6" />
  </Icon>
);
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
    <path
      d="m3.5 8.5 3 3 6-7"
      fill="none"
      stroke="#fff"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/* ── Модалка ── */
interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

function Modal({ title, onClose, children }: ModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className={styles.overlay} onMouseDown={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button type="button" className={styles.modalClose} onClick={onClose} aria-label="Закрити">
          ×
        </button>
        <h2 className={styles.modalTitle}>{title}</h2>
        {children}
      </div>
    </div>
  );
}

/* ── Модалка «Дані компанії» ── */
interface CompanyModalProps {
  initial: CompanyData;
  onClose: () => void;
  onSave: (data: CompanyData) => void;
}

function CompanyModal({ initial, onClose, onSave }: CompanyModalProps) {
  const [form, setForm] = useState<CompanyData>(initial);
  const set = (field: keyof CompanyData) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <Modal title="Дані компанії" onClose={onClose}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={`${styles.field} ${styles.full}`}>
          <span className={styles.label}>Назва компанії</span>
          <input className={styles.input} value={form.companyName} onChange={set('companyName')} required />
        </label>

        <label className={`${styles.field} ${styles.full}`}>
          <span className={styles.label}>Код ЄДРПОУ</span>
          <input
            className={styles.input}
            value={form.edrpou}
            onChange={set('edrpou')}
            inputMode="numeric"
            pattern="\d{8}"
            title="8 цифр"
            required
          />
        </label>

        <h3 className={`${styles.subTitle} ${styles.full}`}>Інформація про засновника</h3>

        <label className={styles.field}>
          <span className={styles.label}>Ім’я</span>
          <input className={styles.input} value={form.firstName} onChange={set('firstName')} required />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Прізвище</span>
          <input className={styles.input} value={form.lastName} onChange={set('lastName')} required />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Телефон</span>
          <input className={styles.input} type="tel" value={form.phone} onChange={set('phone')} required />
        </label>

        <div className={`${styles.field} ${styles.submitCell}`}>
          <button type="submit" className={styles.primaryBtn}>
            Внести зміни
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ── Модалка «Банківські реквізити» ── */
interface BankModalProps {
  initial: BankData;
  onClose: () => void;
  onSave: (data: BankData) => void;
}

function BankModal({ initial, onClose, onSave }: BankModalProps) {
  const [form, setForm] = useState<BankData>(initial);

  const setText = (field: 'recipient' | 'bankName') => (e: ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  // IBAN: без пробелов, заглавными буквами
  const setIban = (e: ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, iban: e.target.value.replace(/\s/g, '').toUpperCase() }));

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <Modal title="Банківські реквізити" onClose={onClose}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={`${styles.field} ${styles.full}`}>
          <span className={styles.label}>Отримувач (ФОП/ТОВ)</span>
          <input className={styles.input} value={form.recipient} onChange={setText('recipient')} required />
        </label>

        <label className={`${styles.field} ${styles.full}`}>
          <span className={styles.label}>Назва банку</span>
          <input className={styles.input} value={form.bankName} onChange={setText('bankName')} required />
        </label>

        <label className={`${styles.field} ${styles.full}`}>
          <span className={styles.label}>IBAN</span>
          <input
            className={styles.input}
            value={form.iban}
            onChange={setIban}
            placeholder="UA000000000000000000000000000"
            maxLength={29}
            pattern="UA\d{27}"
            title="UA і 27 цифр"
            required
          />
        </label>

        <div className={`${styles.docFooter} ${styles.full}`}>
          <button type="submit" className={styles.primaryBtn}>
            Зберегти
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ── Модалка «Документи» ── */
interface DocumentsModalProps {
  initial: DocItem[];
  onClose: () => void;
  onSave: (docs: DocItem[]) => void;
}

function DocumentsModal({ initial, onClose, onSave }: DocumentsModalProps) {
  const [docs, setDocs] = useState<DocItem[]>(initial);

  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const targetIdRef = useRef<number | null>(null);

  const rename = (id: number, name: string) =>
    setDocs((d) => d.map((x) => (x.id === id ? { ...x, name } : x)));
  const remove = (id: number) => setDocs((d) => d.filter((x) => x.id !== id));

  // «Додати новий»: создаём строку и сразу открываем выбор файла
  const add = () => {
    const id = Date.now();
    setDocs((d) => [...d, { id, name: '', file: null }]);
    targetIdRef.current = id;
    fileInputRef.current?.click();
  };

  // Открыть окно выбора файла для конкретного документа
  const pickFile = (id: number) => {
    targetIdRef.current = id;
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const id = targetIdRef.current;
    e.target.value = ''; // чтобы можно было выбрать тот же файл повторно
    if (!file || id === null) return;

    if (file.size > MAX_FILE_SIZE) {
      setError(`Файл “${file.name}” більший за 10 МБ`);
      return;
    }
    setError('');
    setDocs((d) =>
      d.map((x) => (x.id === id ? { ...x, file, name: x.name || file.name } : x))
    );
    // TODO(бэк): отправить file на сервер (FormData)
  };

  // Скачать выбранный файл (для файлов с сервера бэк подставит ссылку)
  const download = (doc: DocItem) => {
    if (!doc.file) return;
    const url = URL.createObjectURL(doc.file);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.file.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const focusInput = (id: number) => document.getElementById(`doc-name-${id}`)?.focus();

  return (
    <Modal title="Документи" onClose={onClose}>
      <span className={styles.label}>Назва документу</span>

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        className={styles.hiddenInput}
        onChange={handleFileChange}
        tabIndex={-1}
      />

      <ul className={styles.docList}>
        {docs.map((doc) => (
          <li key={doc.id} className={styles.docItem}>
            <input
              id={`doc-name-${doc.id}`}
              className={styles.input}
              value={doc.name}
              placeholder="Введіть назву документа"
              onChange={(e) => rename(doc.id, e.target.value)}
            />
            <div className={styles.docActions}>
              <span className={styles.fileName}>
                {doc.file ? doc.file.name : 'Файл не завантажено'}
              </span>
              <button type="button" className={styles.iconBtn} aria-label="Редагувати назву" onClick={() => focusInput(doc.id)}>
                <EditIcon />
              </button>
              <button
                type="button"
                className={styles.iconBtn}
                aria-label="Завантажити файл на комп’ютер"
                disabled={!doc.file}
                onClick={() => download(doc)}
              >
                <DownloadIcon />
              </button>
              <button type="button" className={styles.iconBtn} aria-label="Вибрати файл" onClick={() => pickFile(doc.id)}>
                <UploadIcon />
              </button>
              <button type="button" className={styles.iconBtn} aria-label="Видалити документ" onClick={() => remove(doc.id)}>
                <TrashIcon />
              </button>
            </div>
          </li>
        ))}
      </ul>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <div className={styles.docFooter}>
        <button type="button" className={styles.primaryBtn} onClick={add}>
          Додати новий
        </button>
        <button type="button" className={styles.secondaryBtn} onClick={() => onSave(docs)}>
          Зберегти
        </button>
      </div>
    </Modal>
  );
}

/* ── Страница ── */
export default function SellerVerificationPage() {
  const { user } = useAuth();
  const [steps, setSteps] = useState<Step[]>(INITIAL_STEPS);
  const [company, setCompany] = useState<CompanyData>(INITIAL_COMPANY);
  const [docs, setDocs] = useState<DocItem[]>(INITIAL_DOCS);
  const [bank, setBank] = useState<BankData>(INITIAL_BANK);
  const [modal, setModal] = useState<ModalType>(null);

  if (!user || user.role !== 'Seller') {
    return <Navigate to="/login" replace />;
  }

  const doneCount = steps.filter((s) => s.done).length;
  const percent = (doneCount / steps.length) * 100;
  const remaining = steps.find((s) => !s.done);
  const progressText = remaining
    ? `Пройдено ${doneCount} з ${steps.length} кроків - залишилось підключити виплати`
    : 'Усі кроки пройдено - очікуйте підтвердження';

  const closeModal = () => setModal(null);

  const markDone = (id: StepId, done = true) =>
    setSteps((list) =>
      list.map((st) =>
        st.id === id ? { ...st, done, badge: done ? 'Заповнено' : 'Потрібно заповнити' } : st
      )
    );

  const saveCompany = (data: CompanyData) => {
    // TODO(бэк): отправить на сервер
    setCompany(data);
    markDone('company');
    closeModal();
  };

  const saveDocs = (data: DocItem[]) => {
    // TODO(бэк): отправить на сервер
    setDocs(data);
    markDone('documents', data.length > 0);
    closeModal();
  };

  const saveBank = (data: BankData) => {
    // TODO(бэк): отправить на сервер
    setBank(data);
    markDone('bank');
    closeModal();
  };

  const openStep = (id: StepId) => {
    if (id === 'company' || id === 'documents' || id === 'bank') setModal(id);
    // TODO: договір оферти (перегляд) — макету поки немає
  };

  return (
    <div className={styles.page}>
      <Header />

      <div className={styles.container}>
        <nav className={styles.breadcrumbs}>
          <Link to="/">Головна</Link> / <span>Кабінет продавця</span> / <span>Верифікація</span>
        </nav>

        <div className={styles.greenArea}>
          <SellerSidebar />

          <main className={styles.main}>
            <h1 className={styles.title}>Реєстрація та верифікація</h1>
            <p className={styles.subtitle}>{progressText}</p>

            <div
              className={styles.progress}
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={steps.length}
              aria-valuenow={doneCount}
              aria-label="Прогрес верифікації"
            >
              <div className={styles.progressFill} style={{ width: `${percent}%` }} />
            </div>

            <ul className={styles.steps}>
              {steps.map((step, i) => (
                <li key={step.id} className={styles.step}>
                  <span
                    className={`${styles.marker} ${step.done ? styles.markerDone : styles.markerTodo}`}
                    aria-hidden="true"
                  >
                    {step.done ? <CheckIcon /> : i + 1}
                  </span>

                  <div className={styles.stepText}>
                    <h3 className={styles.stepTitle}>{step.title}</h3>
                    <p className={styles.stepDesc}>{step.description}</p>
                  </div>

                  <div className={styles.stepActions}>
                    <span className={step.done ? styles.badgeDone : styles.badgeTodo}>{step.badge}</span>
                    {step.done ? (
                      <button type="button" className={styles.outlineBtn} onClick={() => openStep(step.id)}>
                        Переглянути
                      </button>
                    ) : (
                      <button type="button" className={styles.primaryBtn} onClick={() => openStep(step.id)}>
                        Заповнити
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            <div className={styles.note}>
              Після підтвердження магазин отримає статус “Верифікований”, товари підуть на модернізацію, а виплати
              надходитимуть двічі на місяць
            </div>
          </main>
        </div>
      </div>

      <Footer />

      {modal === 'company' && <CompanyModal initial={company} onClose={closeModal} onSave={saveCompany} />}
      {modal === 'documents' && <DocumentsModal initial={docs} onClose={closeModal} onSave={saveDocs} />}
      {modal === 'bank' && <BankModal initial={bank} onClose={closeModal} onSave={saveBank} />}
    </div>
  );
}