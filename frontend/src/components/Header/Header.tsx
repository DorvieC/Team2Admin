import { Link, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { CATEGORIES, ALL_CATEGORIES } from '../../data/categories';
import { CategoryDropdown } from '../CategoryDropdown/CategoryDropdown';
import styles from './Header.module.css';

import searchIcon   from '../../assets/icons/search.svg';
import deliveryIcon from '../../assets/icons/delivery-truck.svg';
import globeIcon    from '../../assets/icons/globe.svg';
import accountIcon  from '../../assets/icons/account.svg';
import cartIcon     from '../../assets/icons/cart.svg';
import logoImg      from '../../assets/images/logo-full.png';

interface HeaderProps {
  full?: boolean;
}

export default function Header({ full = true }: HeaderProps) {
  const { isAuthenticated, user } = useAuth();
  const accountPath = user?.role === 'Seller' ? '/seller' : user?.role === 'Admin' ? '/admin' : '/profile';
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setHoveredTab(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // блокируем прокрутку страницы, пока открыто мобильное меню
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) navigate(`/catalog?q=${encodeURIComponent(query)}`);
  };

  const goTo = (path: string) => {
    setMenuOpen(false);
    navigate(path);
  };

  return (
    <header className={styles.header}>
      <div className={styles.topBar}>
        {full && (
          <button
            type="button"
            className={styles.burger}
            onClick={() => setMenuOpen(true)}
            aria-label="Відкрити меню категорій"
            aria-expanded={menuOpen}
          >
            <span className={styles.burgerLine} />
            <span className={styles.burgerLine} />
            <span className={styles.burgerLine} />
          </button>
        )}

        <Link to="/" className={styles.logo}>
          <img src={logoImg} alt="BlitzMall" className={styles.logoImg} />
        </Link>

        {full && (
          <form className={styles.searchWrap} onSubmit={handleSearch}>
            <input
              className={styles.searchInput}
              type="search"
              enterKeyHint="search"
              placeholder="Шукайте що завгодно"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" className={styles.searchBtn} aria-label="Пошук">
              <img src={searchIcon} alt="" />
            </button>
          </form>
        )}

        <div className={styles.actions}>
          <div className={styles.deliveryGroup}>
            <img src={deliveryIcon} alt="" className={styles.deliveryIcon} />
            <span className={styles.deliveryLabel}>Доставка</span>
          </div>

          <div className={styles.langGroup}>
            <img src={globeIcon} alt="" className={styles.langIcon} />
            <span className={styles.langText}>UA</span>
          </div>

          <span className={styles.currency}>₴</span>

          {isAuthenticated ? (
            <Link to={accountPath}>
              <img src={accountIcon} alt="Профіль" className={styles.accountIcon} />
            </Link>
          ) : (
            <Link to="/login">
              <img src={accountIcon} alt="Увійти" className={styles.accountIcon} />
            </Link>
          )}

          <Link to="/cart" className={styles.cartWrap}>
            <img src={cartIcon} alt="Кошик" className={styles.cartIcon} />
            {itemCount > 0 && (
              <span className={styles.cartBadge}>{itemCount > 99 ? '99+' : itemCount}</span>
            )}
          </Link>
        </div>
      </div>

      {full && (
        <nav ref={navRef} className={styles.catNav}>
          <div
            className={styles.catTab}
            onMouseEnter={() => setHoveredTab(ALL_CATEGORIES.id)}
            onMouseLeave={() => setHoveredTab(null)}
          >
            <button
              type="button"
              className={styles.catAllBtn}
              onClick={() => navigate('/categories')}
            >
              {ALL_CATEGORIES.name}
            </button>
            {hoveredTab === ALL_CATEGORIES.id && (
              <CategoryDropdown category={ALL_CATEGORIES} />
            )}
          </div>

          <div className={styles.catLinks}>
            {CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                className={styles.catTab}
                onMouseEnter={() => setHoveredTab(cat.id)}
                onMouseLeave={() => setHoveredTab(null)}
              >
                <span className={styles.catLink} onClick={() => navigate(`/catalog?categoryId=${cat.backendId}`)} style={{cursor:'pointer'}}>{cat.name}</span>
                {hoveredTab === cat.id && <CategoryDropdown category={cat} />}
              </div>
            ))}
          </div>
        </nav>
      )}

      {/* Мобильное меню категорий */}
      {full && menuOpen && (
        <div className={styles.drawerOverlay} onClick={() => setMenuOpen(false)}>
          <aside
            className={styles.drawer}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Категорії"
          >
            <div className={styles.drawerHead}>
              <img src={logoImg} alt="BlitzMall" className={styles.drawerLogo} />
              <button
                type="button"
                className={styles.drawerClose}
                onClick={() => setMenuOpen(false)}
                aria-label="Закрити меню"
              >
                ✕
              </button>
            </div>

            <button
              type="button"
              className={styles.drawerAll}
              onClick={() => goTo('/categories')}
            >
              {ALL_CATEGORIES.name}
            </button>

            <ul className={styles.drawerList}>
              {CATEGORIES.map((cat) => (
                <li key={cat.id}>
                  <button
                    type="button"
                    className={styles.drawerItem}
                    onClick={() => goTo(`/catalog?categoryId=${cat.backendId}`)}
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      )}
    </header>
  );
}