import { useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import type { ReactElement } from 'react';
import styles from './SellerSidebar.module.css';
import {
  GridIcon,
  CheckBadgeIcon,
  BoxIcon,
  BoxIcon as OrdersIcon,
  ReturnIcon,
  LayersIcon,
  CrmIcon,
  ChartIcon,
  WalletIcon,
  MegaphoneIcon,
  ReviewIcon,
  PlugIcon,
} from '../NavIcons/NavIcons';

interface MenuItem {
  label: string;
  to: string;
  Icon: (props: { size?: number }) => ReactElement;
  soon?: boolean; // страницы ещё нет — пункт неактивен
}

// Пути должны совпадать с <Route path=...> в App.tsx.
// Когда сделаете страницу и добавите маршрут — удалите у пункта soon: true
const MENU: MenuItem[] = [
  { label: 'Дашборд', to: '/seller', Icon: GridIcon },
  { label: 'Верифікація', to: '/seller/verification', Icon: CheckBadgeIcon },
  { label: 'Товари', to: '/seller/products', Icon: BoxIcon },
  { label: 'Замовлення', to: '/seller/orders', Icon: OrdersIcon },
  { label: 'Повернення', to: '/seller/returns', Icon: ReturnIcon },
  { label: 'Залишки', to: '/seller/stock', Icon: LayersIcon },
  { label: 'CRM клієнти', to: '/seller/crm', Icon: CrmIcon },
  { label: 'Аналітика', to: '/seller/analytics', Icon: ChartIcon },
  { label: 'Фінанси', to: '/seller/finance', Icon: WalletIcon },
  { label: 'Реклама', to: '/seller/ads', Icon: MegaphoneIcon },
  { label: 'Відгуки', to: '/seller/reviews', Icon: ReviewIcon },
  { label: 'API та інтеграції', to: '/seller/api', Icon: PlugIcon },
];

export default function SellerSidebar() {
  const menuRef = useRef<HTMLUListElement>(null);
  const { pathname } = useLocation();

  // На телефоне меню — горизонтальная лента: центрируем активный пункт
  useEffect(() => {
    const menu = menuRef.current;
    const active = menu?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!menu || !active) return;
    menu.scrollTo({ left: active.offsetLeft - (menu.clientWidth - active.clientWidth) / 2 });
  }, [pathname]);

  return (
    <aside className={styles.sidebar}>
      <h2 className={styles.title}>Кабінет продавця</h2>
      <ul className={styles.menu} ref={menuRef}>
        {MENU.map((item) => (
          <li key={item.to} className={styles.li}>
            {item.soon ? (
              <span
                className={`${styles.item} ${styles.itemSoon}`}
                aria-disabled="true"
                title="Скоро буде доступно"
              >
                <item.Icon size={20} />
                {item.label}
              </span>
            ) : (
              <NavLink
                to={item.to}
                end
                className={({ isActive }) =>
                  `${styles.item} ${isActive ? styles.itemActive : ''}`
                }
              >
                <item.Icon size={20} />
                {item.label}
              </NavLink>
            )}
          </li>
        ))}
      </ul>
    </aside>
  );
}