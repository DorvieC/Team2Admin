import { Link } from 'react-router-dom';
import { CATEGORIES } from '../../data/categories';
import styles from './CategoryCatalogPage.module.css';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import Electronics from '../../assets/images/category-fallback.png';
import HomeAndKitchen from '../../assets/images/home-kitchen.png';
import Clothes from '../../assets/images/Clothes.png';
import Beauty from '../../assets/images/Beauty.png';
import Sport from '../../assets/images/Sport.png';
import Children from '../../assets/images/ChildrenItems.png';
import PetsItems from '../../assets/images/PetsItems.png';

const CATEGORY_ICONS: Record<string, string> = {
  electronics: Electronics,
  'home-kitchen': HomeAndKitchen,
  clothing: Clothes,
  beauty: Beauty,
  sport: Sport,
  kids: Children,
  pets: PetsItems,
};

export function CategoryCatalogPage() {
  return (
    <>
      <Header />

      <div className={styles.page}>
        <div className={styles.breadcrumbs}>Головна / Усі категорії</div>

        <h1 className={styles.title}>Каталог категорій</h1>
        <Link to="/all-products" style={{ display: 'inline-block', marginBottom: 16 }}>Показати всі товари →</Link>

        <div className={styles.grid}>
          {CATEGORIES.map((cat) => (
            <div key={cat.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <img
                  src={CATEGORY_ICONS[cat.id]}
                  alt=""
                  className={styles.icon}
                />
                <span className={styles.catName}>{cat.name}</span>
              </div>

              <ul className={styles.subList}>
                {cat.subcategories.map((sub) => (
                  <li key={sub}>
                    <Link to={`/catalog?categoryId=${cat.backendId}`}>
                      {sub}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </>
  );
}