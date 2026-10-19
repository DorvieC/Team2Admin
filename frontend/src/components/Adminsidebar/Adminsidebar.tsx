import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ADMIN_MENU } from './adminMenu';
import type { MenuItem } from './adminMenu';
import styles from './AdminSidebar.module.css';

// TODO: путь к логотипу из папки public, например '/logo.svg'. Пока показывается текстовый логотип
const LOGO_SRC: string | null = null;

/* ── Иконки ── */
const Svg = ({ children, size = 24 }: { children: ReactNode; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

const GridIcon = () => (
  <Svg>
    <rect x="4" y="4" width="6.5" height="6.5" rx="1.5" />
    <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" />
    <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" />
    <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" />
  </Svg>
);
const UsersIcon = () => (
  <Svg>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3 19c.6-3.2 3-5 6-5s5.4 1.8 6 5" />
    <circle cx="17" cy="9" r="2.4" />
    <path d="M16.5 14.2c2.4.2 4 1.7 4.5 4.3" />
  </Svg>
);
const BankIcon = () => (
  <Svg>
    <path d="M3 9.5 12 4l9 5.5" />
    <path d="M5 10v7M9.5 10v7M14.5 10v7M19 10v7" />
    <path d="M3 20h18" />
  </Svg>
);
const WalletIcon = () => (
  <Svg>
    <rect x="3" y="6" width="18" height="13" rx="2.5" />
    <path d="M3 10h18" />
    <path d="M16 14.5h2" />
  </Svg>
);
const MenuIcon = () => (
  <Svg>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Svg>
);
const GlobeIcon = () => (
  <Svg size={22}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18" />
    <path d="M12 3c2.5 2.5 3.8 5.5 3.8 9S14.5 18.5 12 21c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3Z" />
  </Svg>
);
const BellIcon = () => (
  <Svg size={22}>
    <path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15Z" />
    <path d="M10 21h4" />
  </Svg>
);
const CloseIcon = () => (
  <Svg>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
);

/* ── Нижнее меню (телефон) ── */
const TABS: { to: string; label: string; Icon: () => ReactNode }[] = [
  { to: '/admin', label: 'Дашборд', Icon: GridIcon },
  { to: '/admin/users', label: 'Користувачі', Icon: UsersIcon },
  { to: '/admin/disputes', label: 'Спори', Icon: BankIcon },
  { to: '/admin/finance', label: 'Фінанси', Icon: WalletIcon },
];

export default function AdminSidebar() {
  const { pathname } = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // закрываем меню при переходе на другую страницу
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Escape закрывает меню, фон под ним не прокручивается
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [drawerOpen]);

  const renderItem = (item: MenuItem) =>
    item.soon ? (
      <span className={`${styles.item} ${styles.itemSoon}`} aria-disabled="true" title="Скоро буде доступно">
        <item.Icon size={20} />
        {item.label}
      </span>
    ) : (
      <NavLink
        to={item.to}
        end
        className={({ isActive }) => `${styles.item} ${isActive ? styles.itemActive : ''}`}
      >
        <item.Icon size={20} />
        {item.label}
      </NavLink>
    );

  return (
    <>
      {/* ── Десктоп: боковое меню ── */}
      <aside className={styles.sidebar}>
        <h2 className={styles.title}>Адмінпанель</h2>
        <ul className={styles.menu}>
          {ADMIN_MENU.map((item) => (
            <li key={item.to} className={styles.li}>
              {renderItem(item)}
            </li>
          ))}
        </ul>
      </aside>

      {/* ── Телефон: плашка над заголовком страницы ── */}
      <div className={styles.pill}>Кабінет адміністратора</div>

      {/* ── Телефон: верхняя панель ── */}
      <header className={styles.topBar}>
        <div className={styles.topLeft}>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={() => setDrawerOpen(true)}
            aria-label="Відкрити меню"
          >
            <MenuIcon />
          </button>
          {LOGO_SRC ? (
            <img src={LOGO_SRC} alt="BlitzMall" className={styles.logoImg} />
          ) : (
            <span className={styles.logo}>
              <span className={styles.logoName}>BlitzMall</span>
              <span className={styles.logoTag}>You can buy all</span>
            </span>
          )}
        </div>

        <div className={styles.topRight}>
          {/* TODO: переключение языка */}
          <button type="button" className={styles.langBtn} aria-label="Мова: українська">
            <GlobeIcon />
            <span>UA</span>
          </button>
          {/* TODO: уведомления */}
          <button type="button" className={styles.iconBtn} aria-label="Сповіщення">
            <BellIcon />
          </button>
        </div>
      </header>

      {/* ── Телефон: нижнее меню ── */}
      <nav className={styles.tabBar} aria-label="Основна навігація адмінпанелі">
        {TABS.map(({ to, label, Icon }) => {
          const soon = ADMIN_MENU.find((m) => m.to === to)?.soon;
          return soon ? (
            <span key={to} className={`${styles.tab} ${styles.tabSoon}`} aria-disabled="true">
              <Icon />
              <span>{label}</span>
            </span>
          ) : (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) => `${styles.tab} ${isActive ? styles.tabActive : ''}`}
            >
              <Icon />
              <span>{label}</span>
            </NavLink>
          );
        })}
        <button
          type="button"
          className={styles.tab}
          onClick={() => setDrawerOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={drawerOpen}
        >
          <MenuIcon />
          <span>Меню</span>
        </button>
      </nav>

      {/* ── Телефон: полное меню ── */}
      {drawerOpen && (
        <div className={styles.overlay} onMouseDown={() => setDrawerOpen(false)}>
          <div
            className={styles.sheet}
            role="dialog"
            aria-modal="true"
            aria-label="Меню адмінпанелі"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className={styles.sheetHead}>
              <h2 className={styles.sheetTitle}>Адмінпанель</h2>
              <button
                type="button"
                className={styles.iconBtn}
                onClick={() => setDrawerOpen(false)}
                aria-label="Закрити меню"
              >
                <CloseIcon />
              </button>
            </div>
            <ul className={styles.sheetList}>
              {ADMIN_MENU.map((item) => (
                <li key={item.to} className={styles.li}>
                  {renderItem(item)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}