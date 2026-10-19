import styles from './StarRating.module.css';

interface StarRatingProps {
  value: number;
  size?: number;
}

export default function StarRating({ value, size = 23 }: StarRatingProps) {
  return (
    <div className={styles.stars} style={{ gap: `${size * 0.13}px` }}>
      {[1, 2, 3, 4, 5].map((star) => {
        const fill = Math.min(1, Math.max(0, value - (star - 1)));
        return (
          <span
            key={star}
            className={styles.star}
            style={{
              fontSize: size,
              background: `linear-gradient(to right, #f5a623 ${fill * 100}%, #d1d5db ${fill * 100}%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            ★
          </span>
        );
      })}
    </div>
  );
}
