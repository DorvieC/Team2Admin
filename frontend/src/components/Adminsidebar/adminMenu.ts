import type { ReactElement } from 'react';
import {
  GridIcon,
  UsersIcon,
  CrmIcon,
  CheckBadgeIcon,
  LayersIcon,
  MegaphoneIcon,
  WalletIcon,
  GavelIcon,
  PlugIcon,
  ShieldIcon,
} from '../NavIcons/NavIcons';

export interface MenuItem {
  label: string;
  to: string;
  Icon: (props: { size?: number }) => ReactElement;
  soon?: boolean; // страницы ещё нет — пункт неактивен
}

// Пути должны совпадать с <Route path=...> в App.tsx.
// Когда сделаете страницу и добавите маршрут — удалите у пункта soon: true
export const ADMIN_MENU: MenuItem[] = [
  { label: 'Дашборд', to: '/admin', Icon: GridIcon },
  { label: 'Користувачі', to: '/admin/users', Icon: UsersIcon },
  { label: 'Продавці', to: '/admin/sellers', Icon: CrmIcon },
  { label: 'Модернізація товарів', to: '/admin/moderation', Icon: CheckBadgeIcon },
  { label: 'Категорії', to: '/admin/categories', Icon: LayersIcon },
  { label: 'Реклама і банери', to: '/admin/ads', Icon: MegaphoneIcon },
  { label: 'Комісії та фінанси', to: '/admin/finance', Icon: WalletIcon },
  { label: 'Спори', to: '/admin/disputes', Icon: GavelIcon },
  { label: 'Інтеграції', to: '/admin/integrations', Icon: PlugIcon },
  { label: 'Безпека', to: '/admin/security', Icon: ShieldIcon },
];