import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ADMIN_MENU } from './adminMenu';
import styles from './AdminMobileNav.module.css';

interface Tab {
  label: string;
  to: string;
  prefixes: string[]; // при каких адресах вкладка считается активной
  exact?: boolean;
  icon: JSX.Element;
}

const svgProps = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const TABS: Tab[] = [
  {
    label: 'Дашборд',
    to: '/admin',
    prefixes: ['/admin'],
    exact: true,
    icon: (
      <svg {...svgProps}>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    label: 'Користувачі',
    to: '/admin/users',
    prefixes: ['/admin/users', '/admin/sellers'],
    icon: (
      <svg {...svgProps}>
        <circle cx="9" cy="8" r="3.5" />
        <path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
        <circle cx="17.5" cy="9" r="2.5" />
        <path d="M17 14.2c2.6.2 4.5 2.1 4.5 5.3" />
      </svg>
    ),
  },
  {
    label: 'Спори',
    to: '/admin/disputes',
    prefixes: ['/admin/disputes'],
    icon: (
      <svg {...svgProps}>
        <path d="M3 10l9-6 9 6" />
        <path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8" />
        <path d="M3 20h18" />
      </svg>
    ),
  },
  {
    label: 'Фінанси',
    to: '/admin/finance',
    prefixes: ['/admin/finance'],
    icon: (
      <svg {...svgProps}>
        <rect x="3" y="6" width="18" height="13" rx="2.5" />
        <path d="M3 10.5h18" />
      </svg>
    ),
  },
];

export default function AdminMobileNav() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  // Закрываем выдвижное меню при переходе на другую страницу
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Добавляем отступ снизу странице, чтобы панель не закрывала подвал
  useEffect(() => {
    document.body.classList.add('has-admin-nav');
    return () => document.body.classList.remove('has-admin-nav');
  }, []);

  const isActive = (tab: Tab) =>
    tab.exact
      ? pathname === tab.to
      : tab.prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  return (
    <>
      {open && (
        <>
          <div className={styles.overlay} onClick={() => setOpen(false)} />
          <div className={styles.sheet} role="dialog" aria-label="Меню адмінпанелі">
            <h2 className={styles.sheetTitle}>Адмінпанель</h2>
            <ul className={styles.sheetList}>
              {ADMIN_MENU.map((item) => (
                <li key={item.to}>
                  {item.soon ? (
                    <span className={`${styles.sheetItem} ${styles.sheetItemSoon}`}>
                      {item.label}
                    </span>
                  ) : (
                    <Link
                      to={item.to}
                      className={`${styles.sheetItem} ${
                        pathname === item.to ? styles.sheetItemActive : ''
                      }`}
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      <nav className={styles.bar} aria-label="Навігація адмінпанелі">
        {TABS.map((tab) => (
          <Link
            key={tab.to}
            to={tab.to}
            className={`${styles.tab} ${isActive(tab) ? styles.tabActive : ''}`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </Link>
        ))}

        <button
          type="button"
          className={`${styles.tab} ${open ? styles.tabActive : ''}`}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          <svg {...svgProps}>
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
          <span>Меню</span>
        </button>
      </nav>
    </>
  );
}