import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './AdminSecurityPage.module.css';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import AdminSidebar from '../../components/Adminsidebar/Adminsidebar';

type Tone = 'green' | 'red';
type Level = 'warning' | 'critical' | 'info';

interface Stat {
  title: string;
  value: string;
  note: string;
  tone: Tone;
}

interface AuditEvent {
  id: number;
  time: string;
  event: string;
  user: string;
  ip: string;
  level: Level;
}

const STATS: Stat[] = [
  { title: 'Підозрілі входи', value: '14', note: 'за 24 год.', tone: 'red' },
  { title: 'Заблоковано ботів', value: '1 205', note: 'за тиждень', tone: 'green' },
  { title: 'Фрод-транзакції', value: '6', note: '-2 до тижня', tone: 'green' },
  { title: 'Аптайм', value: '99,97%', note: '30 днів', tone: 'green' },
];

const EVENTS: AuditEvent[] = [
  { id: 1, time: '18.10. 09:45', event: 'Множинні способи входу', user: 'ihor@example.com', ip: '91.203....', level: 'warning' },
  { id: 2, time: '18.10. 08:05', event: 'Зміна реквізитів', user: 'KidsWorld', ip: '188.44....', level: 'critical' },
  { id: 3, time: '17.10. 22:40', event: 'Масове вивантаження каталогу', user: 'API bm_live....', ip: '159.16....', level: 'info' },
];

const LEVEL_LABEL: Record<Level, string> = {
  warning: 'Попередження',
  critical: 'Критично',
  info: 'Інфо',
};

const LEVEL_CLASS: Record<Level, string> = {
  warning: 'badgeWarning',
  critical: 'badgeCritical',
  info: 'badgeInfo',
};

export default function AdminSecurityPage() {
  const { user } = useAuth();

  if (!user || user.role !== 'Admin') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className={styles.page}>
      <div className={styles.siteChrome}>
        <Header />
      </div>

      <div className={styles.container}>
        <nav className={styles.breadcrumbs}>
          <Link to="/">Головна</Link> / <span>Адмінпанель</span> / <span>Безпека</span>
        </nav>

        <div className={styles.greenArea}>
          <AdminSidebar />

          <main className={styles.main}>
            <h1 className={styles.title}>Безпека і аудит</h1>

            <p className={styles.placeholderNote}>
              Журнал аудиту працює в демо-режимі — на бекенді ще немає системи логування входів,
              фрод-перевірок і аналізу підозрілої активності, дані нижче ілюстративні.
            </p>

            <div className={styles.stats}>
              {STATS.map((s) => (
                <div key={s.title} className={styles.statCard}>
                  <span className={styles.statTitle}>{s.title}</span>
                  <span className={styles.statValue}>{s.value}</span>
                  <span className={s.tone === 'green' ? styles.statUp : styles.statDown}>
                    {s.note}
                  </span>
                </div>
              ))}
            </div>

            <div className={styles.tableCard}>
              <div className={styles.tableScroll}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>ЧАС</th>
                      <th>ПОДІЯ</th>
                      <th>КОРИСТУВАЧ</th>
                      <th>IP</th>
                      <th>РІВЕНЬ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {EVENTS.map((e) => (
                      <tr key={e.id}>
                        <td>{e.time}</td>
                        <td>{e.event}</td>
                        <td className={styles.normal}>{e.user}</td>
                        <td className={styles.normal}>{e.ip}</td>
                        <td>
                          <span className={`${styles.badge} ${styles[LEVEL_CLASS[e.level]]}`}>
                            {LEVEL_LABEL[e.level]}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>
      </div>

      <div className={styles.siteChrome}>
        <Footer />
      </div>
    </div>
  );
}