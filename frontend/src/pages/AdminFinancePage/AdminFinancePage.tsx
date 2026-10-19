import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import AdminSidebar from '../../components/Adminsidebar/Adminsidebar';
import { paymentsApi, type Payment } from '../../api/payments';
import styles from './AdminFinancePage.module.css';

interface MonthReport {
  id: string;
  period: string;
  gmv: number;
  count: number;
  commission: number;
  payout: number;
}

const numberFormat = new Intl.NumberFormat('uk-UA');
const money = (n: number) => `${numberFormat.format(n)} ₴`;
const PAGE_SIZE = 5;

// Орієнтовна ставка комісії платформи — бекенд поки не зберігає реальний % за транзакцію.
const ILLUSTRATIVE_COMMISSION_RATE = 0.1;

function downloadReport(report: MonthReport) {
  const rows = [
    ['Місяць', 'GMV, ₴', 'Комісія, ₴', 'Виплати, ₴', 'Кількість оплат'],
    [report.period, report.gmv, report.commission, report.payout, report.count],
  ];
  const csv = '\uFEFF' + rows.map((r) => r.join(';')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `report-${report.period.replace(/\s+/g, '-')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminFinancePage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!user || user.role !== 'Admin') return;
    paymentsApi
      .getAll()
      .then(setPayments)
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [user]);

  if (!user || user.role !== 'Admin') {
    return <Navigate to="/login" replace />;
  }

  const completed = payments.filter((p) => p.status === 'Completed');
  const gmv = completed.reduce((s, p) => s + p.amount, 0);
  const totalCommission = gmv * ILLUSTRATIVE_COMMISSION_RATE;
  const totalPayout = gmv - totalCommission;

  const stats = [
    { title: 'Дохід з комісій', value: money(totalCommission), note: `орієнтовно, ${(ILLUSTRATIVE_COMMISSION_RATE * 100).toFixed(0)}%`, positive: true },
    { title: 'Виплати продавцям', value: money(totalPayout), note: `${completed.length} оплат`, positive: true },
    { title: 'Загальний GMV', value: money(gmv), note: '', positive: true },
    { title: 'Середня комісія', value: `${(ILLUSTRATIVE_COMMISSION_RATE * 100).toFixed(1)}%`, note: 'орієнтовна ставка', positive: true },
  ];

  const byMonth = new Map<string, { gmv: number; count: number }>();
  completed.forEach((p) => {
    const d = new Date(p.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const entry = byMonth.get(key) ?? { gmv: 0, count: 0 };
    entry.gmv += p.amount;
    entry.count += 1;
    byMonth.set(key, entry);
  });
  const monthLabel = (key: string) => {
    const [y, m] = key.split('-');
    return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('uk-UA', { month: 'long', year: 'numeric' });
  };
  const reports: MonthReport[] = Array.from(byMonth.entries())
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([key, v]) => ({
      id: key,
      period: monthLabel(key),
      gmv: v.gmv,
      count: v.count,
      commission: v.gmv * ILLUSTRATIVE_COMMISSION_RATE,
      payout: v.gmv * (1 - ILLUSTRATIVE_COMMISSION_RATE),
    }));

  const totalPages = Math.max(1, Math.ceil(reports.length / PAGE_SIZE));
  const pageReports = reports.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className={styles.page}>
      <div className={styles.siteChrome}>
        <Header />
      </div>

      <div className={styles.container}>
        <nav className={styles.breadcrumbs}>
          <Link to="/">Головна</Link> / <span>Адмінпанель</span> / <span>Комісії та фінанси</span>
        </nav>

        <div className={styles.greenArea}>
          <AdminSidebar />

          <main className={styles.main}>
            <h1 className={styles.title}>Комісії та фінанси</h1>

            <div className={styles.stats}>
              {stats.map((s) => (
                <div key={s.title} className={styles.statCard}>
                  <span className={styles.statTitle}>{s.title}</span>
                  <span className={styles.statValue}>{s.value}</span>
                  <span className={s.positive ? styles.statUp : styles.statDown}>{s.note}</span>
                </div>
              ))}
            </div>

            <h2 className={styles.sectionTitle}>Звіти</h2>

            <p className={styles.commissionNote}>
              Комісія і виплати розраховані за орієнтовною ставкою {(ILLUSTRATIVE_COMMISSION_RATE * 100).toFixed(0)}%
              — бекенд поки не зберігає реальний % комісії за транзакцію.
            </p>

            {loading ? (
              <p className={styles.empty}>Завантаження...</p>
            ) : reports.length === 0 ? (
              <p className={styles.empty}>Звітів поки немає.</p>
            ) : (
              <>
                <div className={styles.reportTable} role="table" aria-label="Фінансові звіти">
                  <div className={styles.reportHead} role="row">
                    <span role="columnheader">Місяць</span>
                    <span role="columnheader">GMV</span>
                    <span role="columnheader">Комісія</span>
                    <span role="columnheader">Виплати</span>
                    <span role="columnheader">Звіт</span>
                  </div>
                  {pageReports.map((r) => (
                    <div key={r.id} className={styles.reportRow} role="row">
                      <span className={styles.reportMonth} data-label="Місяць">{r.period}</span>
                      <span data-label="GMV">{money(r.gmv)}</span>
                      <span data-label="Комісія">{money(r.commission)}</span>
                      <span data-label="Виплати">{money(r.payout)}</span>
                      <span data-label="Звіт">
                        <button
                          type="button"
                          className={styles.outlineBtn}
                          onClick={() => downloadReport(r)}
                          aria-label={`Вивантажити звіт: ${r.period}`}
                        >
                          Вивантажити
                        </button>
                      </span>
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <nav className={styles.pagination} aria-label="Сторінки звітів">
                    <button
                      type="button"
                      className={styles.pageBtn}
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      ← Назад
                    </button>
                    <span className={styles.pageInfo}>
                      Сторінка {page} з {totalPages}
                    </span>
                    <button
                      type="button"
                      className={styles.pageBtn}
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    >
                      Далі →
                    </button>
                  </nav>
                )}
              </>
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