import { Link } from 'react-router-dom';
import { CATEGORIES, type Category } from '../../data/categories';
import styles from './CategoryDropdown.module.css';

interface CategoryDropdownProps {
  category: Category;
}

export function CategoryDropdown({ category }: CategoryDropdownProps) {
  const isAllCategories = category.id === 'all';

  const linkFor = (sub: string): string => {
    if (isAllCategories) {
      const match = CATEGORIES.find((c) => c.name === sub);
      return match ? `/catalog?categoryId=${match.backendId}` : `/catalog?q=${encodeURIComponent(sub)}`;
    }
    return category.backendId ? `/catalog?categoryId=${category.backendId}` : `/catalog?q=${encodeURIComponent(sub)}`;
  };

  return (
    <div className={styles.dropdown} role="menu" aria-label={category.name}>
      <div className={styles.dropdownCard}>
        {category.subcategories.map((sub) => (
          <Link
            key={sub}
            to={linkFor(sub)}
            className={styles.dropdownLink}
            role="menuitem"
          >
            {sub}
          </Link>
        ))}
      </div>
    </div>
  );
}
