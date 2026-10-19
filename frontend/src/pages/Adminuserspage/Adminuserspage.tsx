import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import AdminSidebar from '../../components/Adminsidebar/Adminsidebar';
import { usersApi, rolesApi, type AdminUser, type Role } from '../../api/users';
import styles from './AdminUsersPage.module.css';

type UserStatus = 'active' | 'blocked';

const STATUS_LABEL: Record<UserStatus, string> = {
  active: 'Активний',
  blocked: 'Заблокований',
};

const STATUS_CLASS: Record<UserStatus, string> = {
  active: styles.statusActive,
  blocked: styles.statusBlocked,
};

const formatDate = (iso: string) => new Date(iso).toLocaleDateString('uk-UA');

/** Инициалы для аватара: две заглавные буквы имени, иначе первая буква */
function getInitials(name: string): string {
  const capitals = name.match(/\p{Lu}/gu) ?? [];
  if (capitals.length >= 2) return capitals.slice(0, 2).join('');
  return name.trim().charAt(0).toUpperCase();
}

export default function AdminUsersPage() {
  const { user } = useAuth();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  useEffect(() => {
    if (!user || user.role !== 'Admin') return;
    Promise.all([usersApi.getAll(), rolesApi.getAll()])
      .then(([u, r]) => {
        setUsers(u);
        setRoles(r);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [user]);

  if (!user || user.role !== 'Admin') {
    return <Navigate to="/login" replace />;
  }

  const roleName = (roleId: number) => roles.find((r) => r.id === roleId)?.name ?? '—';
  const total = users.length;
  const activeCount = users.filter((u) => u.status !== 'Blocked').length;
  const sellerRoleId = roles.find((r) => r.name === 'Seller')?.id;
  const sellerCount = sellerRoleId ? users.filter((u) => u.roleId === sellerRoleId).length : 0;
  const blockedCount = users.filter((u) => u.status === 'Blocked').length;

  const stats = [
    { title: 'Усього', value: String(total), note: '', positive: true },
    { title: 'Активні', value: String(activeCount), note: total ? `${Math.round((activeCount / total) * 100)}%` : '', positive: true },
    { title: 'Продавці', value: String(sellerCount), note: '', positive: true },
    { title: 'Заблоковані', value: String(blockedCount), note: '', positive: false },
  ];

  const handleToggleRole = async (u: AdminUser) => {
    const buyerRole = roles.find((r) => r.name === 'Buyer');
    if (!buyerRole || !sellerRoleId) return;
    const nextRoleId = u.roleId === sellerRoleId ? buyerRole.id : sellerRoleId;
    await usersApi.changeRole(u.id, nextRoleId);
    setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, roleId: nextRoleId } : x)));
    setOpenMenuId(null);
  };

  const handleDelete = async (u: AdminUser) => {
    if (!window.confirm(`Видалити користувача ${u.name ?? u.email}?`)) return;
    await usersApi.delete(u.id);
    setUsers((prev) => prev.filter((x) => x.id !== u.id));
    setOpenMenuId(null);
  };

  return (
    <div className={styles.page}>
      <div className={styles.siteChrome}>
        <Header />
      </div>

      <div className={styles.container}>
        <nav className={styles.breadcrumbs}>
          <Link to="/">Головна</Link> / <span>Адмінпанель</span> / <span>Користувачі</span>
        </nav>

        <div className={styles.greenArea}>
          <AdminSidebar />

          <main className={styles.main}>
            <h1 className={styles.title}>Користувачі</h1>

            <div className={styles.stats}>
              {stats.map((s) => (
                <div key={s.title} className={styles.statCard}>
                  <span className={styles.statTitle}>{s.title}</span>
                  <span className={styles.statValue}>{s.value}</span>
                  <span className={s.positive ? styles.statUp : styles.statDown}>{s.note}</span>
                </div>
              ))}
            </div>

            {loading ? (
              <p className={styles.empty}>Завантаження...</p>
            ) : users.length === 0 ? (
              <p className={styles.empty}>Користувачів поки немає.</p>
            ) : (
              <div className={styles.table} role="table" aria-label="Користувачі">
                <div className={styles.head} role="row">
                  <span className={styles.headCellLeft} role="columnheader">Користувач</span>
                  <span className={styles.headCellLeft} role="columnheader">Роль</span>
                  <span role="columnheader">Реєстрація</span>
                  <span role="columnheader">Статус</span>
                  <span className={styles.srOnly} role="columnheader">Дії</span>
                </div>

                {users.map((u) => {
                  const name = u.name ?? u.email;
                  const status: UserStatus = u.status === 'Blocked' ? 'blocked' : 'active';
                  return (
                    <div key={u.id} className={styles.row} role="row">
                      <div className={styles.cellUser} role="cell">
                        <span className={styles.avatar} aria-hidden="true">
                          <span className={styles.initialsShort}>{name.trim().charAt(0).toUpperCase()}</span>
                        </span>
                        <span className={styles.userInfo}>
                          <span className={styles.userName}>{name}</span>
                          <span className={styles.userEmail}>{u.email}</span>
                        </span>
                      </div>

                      <div className={`${styles.cell} ${styles.cellRole}`} role="cell" data-label="Роль">
                        {roleName(u.roleId)}
                      </div>
                      <div className={`${styles.cell} ${styles.cellDate}`} role="cell" data-label="Реєстрація">
                        {formatDate(u.createdAt)}
                      </div>

                      <div className={`${styles.cell} ${styles.cellStatus}`} role="cell">
                        <span className={`${styles.status} ${STATUS_CLASS[status]}`}>{STATUS_LABEL[status]}</span>
                      </div>

                      <div className={`${styles.cell} ${styles.cellAction}`} role="cell" style={{ position: 'relative' }}>
                        <button
                          type="button"
                          className={styles.actionBtn}
                          onClick={() => setOpenMenuId(openMenuId === u.id ? null : u.id)}
                          aria-label={`Дії для ${name}`}
                        >
                          Дії
                        </button>
                        {openMenuId === u.id && (
                          <div style={{ position: 'absolute', right: 0, top: '100%', background: '#fff', border: '1px solid #ddd', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,.12)', zIndex: 10, minWidth: 180 }}>
                            <button type="button" onClick={() => handleToggleRole(u)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', border: 'none', background: 'none', cursor: 'pointer' }}>
                              {u.roleId === sellerRoleId ? 'Зробити покупцем' : 'Зробити продавцем'}
                            </button>
                            <button type="button" onClick={() => handleDelete(u)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', border: 'none', background: 'none', cursor: 'pointer', color: '#c62828' }}>
                              Видалити
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>

      <div className={styles.siteChrome}>
        <Footer />
      </div>
    </div>
  );
}