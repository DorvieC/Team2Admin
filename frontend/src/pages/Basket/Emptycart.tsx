import { useState } from 'react';
import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';

/** 0 товарів, 1 товар, 2 товари, 5 товарів, 11 товарів, 21 товар */
export function pluralGoods(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'товар';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'товари';
  return 'товарів';
}

// Стили прямо здесь, поэтому отдельный CSS-файл не нужен
const wrapStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 28,
  padding: '56px 24px 72px',
  background: '#f3f8f2',
  borderRadius: 28,
  fontFamily: '"Montserrat", system-ui, sans-serif',
  color: '#1a1a1a',
  textAlign: 'center',
  boxSizing: 'border-box',
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: 24,
  fontWeight: 700,
  letterSpacing: '0.04em',
};

const btnStyle: CSSProperties = {
  display: 'inline-block',
  padding: '14px 32px',
  borderRadius: 12,
  color: '#fff',
  fontSize: 16,
  fontWeight: 700,
  textDecoration: 'none',
  transition: 'background 0.2s',
};

export default function EmptyCart() {
  const [hover, setHover] = useState(false);

  return (
    <div style={wrapStyle}>
      <h2 style={titleStyle}>Ваш кошик порожній</h2>

      <svg width="96" height="88" viewBox="0 0 96 88" fill="none" aria-hidden="true" style={{ display: 'block' }}>
        <path d="M6 12h10l8 40h44l8-32" stroke="#8a938a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="76" cy="8" r="5" fill="#2b2f2c" />
        <path d="M76 13L70 20" stroke="#8a938a" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M18 24h52M21 36h47M24 52l-2 12h42" stroke="#8a938a" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M30 24l3 28M44 24l1 28M58 24l-1 28M70 24l-3 28" stroke="#8a938a" strokeWidth="1" strokeLinecap="round" />
        <path d="M38 56l4 8M58 56l4 8" stroke="#2f6b3f" strokeWidth="3" strokeLinecap="round" />
        <circle cx="30" cy="76" r="6" fill="#2b2f2c" />
        <circle cx="62" cy="76" r="6" fill="#2b2f2c" />
      </svg>

      <Link
        to="/"
        style={{ ...btnStyle, background: hover ? '#1f5e3b' : '#2f6b3f' }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        На головну
      </Link>
    </div>
  );
}