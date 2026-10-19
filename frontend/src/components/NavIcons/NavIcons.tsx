interface IconProps {
  size?: number;
}

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true as const,
});

export const UserIcon = ({ size = 20 }: IconProps) => (
  <svg {...base(size)}>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 20c.8-3.6 3.4-5.5 7-5.5s6.2 1.9 7 5.5" />
  </svg>
);

export const BoxIcon = ({ size = 20 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M3.5 7.5 12 3l8.5 4.5M3.5 7.5 12 12l8.5-4.5M3.5 7.5v9L12 21l8.5-4.5v-9M12 12v9" />
  </svg>
);

export const ReturnIcon = ({ size = 20 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M9 10 4 10 4 5" />
    <path d="M4 10c1.6-3.4 5-5.5 9-5.5 5 0 9 4 9 9s-4 9-9 9c-3.6 0-6.8-2.1-8.3-5.2" />
  </svg>
);

export const ScaleIcon = ({ size = 20 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M12 3v14" />
    <path d="M6 7h12" />
    <path d="M4 7l-2 5a3 3 0 0 0 6 0Z" />
    <path d="M20 7l-2 5a3 3 0 0 0 6 0Z" />
    <path d="M9 21h6" />
  </svg>
);

export const StarIcon = ({ size = 20 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M12 3.5 14.4 9l6 .7-4.5 4 1.3 5.8L12 16.6 6.8 19.5l1.3-5.8-4.5-4 6-.7Z" />
  </svg>
);

export const HeartIcon = ({ size = 20 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M12 20.5c-.3 0-.6-.1-.8-.3C7.5 17.4 4 14.2 4 10.6 4 7.9 6.1 6 8.6 6c1.4 0 2.6.6 3.4 1.6C12.8 6.6 14 6 15.4 6 17.9 6 20 7.9 20 10.6c0 3.6-3.5 6.8-7.2 9.6-.2.2-.5.3-.8.3Z" />
  </svg>
);

export const BellIcon = ({ size = 20 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M6 16v-5a6 6 0 0 1 12 0v5l1.5 2.5h-15Z" />
    <path d="M10 21h4" />
  </svg>
);

export const ListCheckIcon = ({ size = 20 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M9 6h11M9 12h11M9 18h11" />
    <path d="m4 5 1.2 1.2L7 4.5" />
    <path d="m4 11 1.2 1.2L7 10.5" />
    <path d="m4 17 1.2 1.2L7 16.5" />
  </svg>
);

export const TagIcon = ({ size = 20 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M3 12 12 3h6a3 3 0 0 1 3 3v6l-9 9Z" />
    <circle cx="16" cy="8" r="1.4" fill="currentColor" stroke="none" />
  </svg>
);

export const CardIcon = ({ size = 20 }: IconProps) => (
  <svg {...base(size)}>
    <rect x="3" y="5" width="18" height="14" rx="2.5" />
    <path d="M3 10h18" />
    <path d="M7 15h3" />
  </svg>
);

export const GridIcon = ({ size = 20 }: IconProps) => (
  <svg {...base(size)}>
    <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.5" />
    <rect x="13" y="3.5" width="7.5" height="7.5" rx="1.5" />
    <rect x="3.5" y="13" width="7.5" height="7.5" rx="1.5" />
    <rect x="13" y="13" width="7.5" height="7.5" rx="1.5" />
  </svg>
);

export const UsersIcon = ({ size = 20 }: IconProps) => (
  <svg {...base(size)}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3 19c.6-3.2 3-5 6-5s5.4 1.8 6 5" />
    <circle cx="17" cy="9" r="2.4" />
    <path d="M16.5 14.2c2.4.2 4 1.7 4.5 4.3" />
  </svg>
);

export const ShieldIcon = ({ size = 20 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M12 3 20 6.5v5.5c0 5-3.6 7.8-8 9-4.4-1.2-8-4-8-9V6.5Z" />
    <path d="m9 12 2.2 2.2L15.5 10" />
  </svg>
);

export const WalletIcon = ({ size = 20 }: IconProps) => (
  <svg {...base(size)}>
    <rect x="3" y="6" width="18" height="13" rx="2.5" />
    <path d="M3 10h18" />
    <path d="M16 14.5h2" />
  </svg>
);

export const MegaphoneIcon = ({ size = 20 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M3 10v4h3l9 5V5L6 10Z" />
    <path d="M18 9.5a4 4 0 0 1 0 5" />
  </svg>
);

export const GavelIcon = ({ size = 20 }: IconProps) => (
  <svg {...base(size)}>
    <path d="m8 6 5 5" />
    <path d="M5 9l4-4 6 6-4 4Z" />
    <path d="M3 21h8" />
    <path d="M14 13l7 7" />
  </svg>
);

export const PlugIcon = ({ size = 20 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M9 3v4M15 3v4" />
    <path d="M7 7h10v4a5 5 0 0 1-10 0Z" />
    <path d="M12 16v5" />
  </svg>
);

export const LayersIcon = ({ size = 20 }: IconProps) => (
  <svg {...base(size)}>
    <path d="m12 3 8 4.5-8 4.5-8-4.5Z" />
    <path d="m4 12 8 4.5 8-4.5" />
    <path d="m4 16.5 8 4.5 8-4.5" />
  </svg>
);

export const CheckBadgeIcon = ({ size = 20 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M12 3.5 14.4 5l2.8-.4 1 2.6 2.6 1-.4 2.8L22 13l-1.6 2 .4 2.8-2.6 1-1 2.6-2.8-.4L12 22.5l-2.4-1.5-2.8.4-1-2.6-2.6-1 .4-2.8L2 13l1.6-2-.4-2.8 2.6-1 1-2.6 2.8.4Z" />
    <path d="m9 12.5 2 2 4-4.5" />
  </svg>
);

export const CrmIcon = ({ size = 20 }: IconProps) => (
  <svg {...base(size)}>
    <circle cx="8" cy="9" r="3" />
    <path d="M2.5 19c.6-3 2.8-4.6 5.5-4.6s4.9 1.6 5.5 4.6" />
    <circle cx="17" cy="8" r="2.2" />
    <path d="M16.5 14.5c2.2.3 3.6 1.7 4 4" />
  </svg>
);

export const ChartIcon = ({ size = 20 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M5 19V11M10.5 19V5M16 19v-6M20.5 19v3.5" />
    <path d="M3 20.5h18" />
  </svg>
);

export const ReviewIcon = ({ size = 20 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M21 11.5a8.5 8.5 0 1 1-4-7.2" />
    <path d="M12 3.5 14.4 9l6 .7-4.5 4 1.3 5.8" />
  </svg>
);
