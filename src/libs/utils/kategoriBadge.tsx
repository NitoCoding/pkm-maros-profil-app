// pkm-maros-profil-app\src\libs\utils\kategoriBadge.ts
/**
 * Helper functions untuk kategori badges
 * Memberikan style yang konsisten untuk kategori di seluruh aplikasi
 */

export type KategoriStyle = 'solid' | 'glass' | 'outline';

/**
 * Mengembalikan class names untuk badge kategori inovasi
 * @param kategori - Nama kategori
 * @param style - Style badge: 'solid' (default), 'glass' (transparan dengan blur), 'outline'
 * @returns Class names untuk badge
 */
export function getInovasiKategoriBadge(kategori: string, style: KategoriStyle = 'solid'): string {
  const kategoriLower = kategori.toLowerCase().trim();

  // Warna untuk setiap kategori
  const colorMap: { [key: string]: { bg: string; text: string; border: string; glass: string } } = {
    teknologi: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      border: 'border-blue-200',
      glass: 'bg-blue-500/20 text-blue-100 border-blue-400/30'
    },
    pertanian: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-200',
      glass: 'bg-green-500/20 text-green-100 border-green-400/30'
    },
    kesehatan: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-200',
      glass: 'bg-red-500/20 text-red-100 border-red-400/30'
    },
    pendidikan: {
      bg: 'bg-purple-100',
      text: 'text-purple-800',
      border: 'border-purple-200',
      glass: 'bg-purple-500/20 text-purple-100 border-purple-400/30'
    },
    ekonomi: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-200',
      glass: 'bg-yellow-500/20 text-yellow-100 border-yellow-400/30'
    },
    lingkungan: {
      bg: 'bg-emerald-100',
      text: 'text-emerald-800',
      border: 'border-emerald-200',
      glass: 'bg-emerald-500/20 text-emerald-100 border-emerald-400/30'
    },
    infrastruktur: {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      border: 'border-gray-200',
      glass: 'bg-gray-500/20 text-gray-100 border-gray-400/30'
    },
    sosial: {
      bg: 'bg-pink-100',
      text: 'text-pink-800',
      border: 'border-pink-200',
      glass: 'bg-pink-500/20 text-pink-100 border-pink-400/30'
    },
  };

  const colors = colorMap[kategoriLower] || {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-200',
    glass: 'bg-gray-500/20 text-gray-100 border-gray-400/30'
  };

  const base = 'px-2.5 py-1 rounded-full text-xs font-medium';

  switch (style) {
    case 'glass':
      return `${base} ${colors.glass} backdrop-blur-sm border`;
    case 'outline':
      return `${base} bg-transparent ${colors.text} border ${colors.border}`;
    case 'solid':
    default:
      return `${base} ${colors.bg} ${colors.text}`;
  }
}

/**
 * Mengembalikan class names untuk badge kategori berita
 * @param kategori - Nama kategori berita
 * @param style - Style badge
 * @returns Class names untuk badge
 */
export function getBeritaKategoriBadge(kategori: string, style: KategoriStyle = 'solid'): string {
  const kategoriLower = kategori.toLowerCase().trim();

  const colorMap: { [key: string]: { bg: string; text: string; border: string; glass: string } } = {
    pengumuman: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      border: 'border-blue-200',
      glass: 'bg-blue-500/20 text-blue-100 border-blue-400/30'
    },
    kegiatan: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-200',
      glass: 'bg-green-500/20 text-green-100 border-green-400/30'
    },
    berita: {
      bg: 'bg-orange-100',
      text: 'text-orange-800',
      border: 'border-orange-200',
      glass: 'bg-orange-500/20 text-orange-100 border-orange-400/30'
    },
    artikel: {
      bg: 'bg-purple-100',
      text: 'text-purple-800',
      border: 'border-purple-200',
      glass: 'bg-purple-500/20 text-purple-100 border-purple-400/30'
    },
    press: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-200',
      glass: 'bg-red-500/20 text-red-100 border-red-400/30'
    },
  };

  const colors = colorMap[kategoriLower] || {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-200',
    glass: 'bg-gray-500/20 text-gray-100 border-gray-400/30'
  };

  const base = 'px-2.5 py-1 rounded-full text-xs font-medium';

  switch (style) {
    case 'glass':
      return `${base} ${colors.glass} backdrop-blur-sm border`;
    case 'outline':
      return `${base} bg-transparent ${colors.text} border ${colors.border}`;
    case 'solid':
    default:
      return `${base} ${colors.bg} ${colors.text}`;
  }
}

/**
 * Mengembalikan class names untuk badge status (published, draft, dll)
 * @param status - Status value
 * @param style - Style badge
 * @returns Class names untuk badge
 */
export function getStatusBadge(status: string, style: KategoriStyle = 'solid'): string {
  const statusLower = status.toLowerCase().trim();

  const colorMap: { [key: string]: { bg: string; text: string; border: string; glass: string } } = {
    published: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-200',
      glass: 'bg-green-500/20 text-green-100 border-green-400/30'
    },
    draft: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-200',
      glass: 'bg-yellow-500/20 text-yellow-100 border-yellow-400/30'
    },
    archived: {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      border: 'border-gray-200',
      glass: 'bg-gray-500/20 text-gray-100 border-gray-400/30'
    },
    active: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      border: 'border-blue-200',
      glass: 'bg-blue-500/20 text-blue-100 border-blue-400/30'
    },
    inactive: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-200',
      glass: 'bg-red-500/20 text-red-100 border-red-400/30'
    },
  };

  const colors = colorMap[statusLower] || {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-200',
    glass: 'bg-gray-500/20 text-gray-100 border-gray-400/30'
  };

  const base = 'px-2.5 py-1 rounded-full text-xs font-medium';

  switch (style) {
    case 'glass':
      return `${base} ${colors.glass} backdrop-blur-sm border`;
    case 'outline':
      return `${base} bg-transparent ${colors.text} border ${colors.border}`;
    case 'solid':
    default:
      return `${base} ${colors.bg} ${colors.text}`;
  }
}

/**
 * Component KategoriBadge yang bisa digunakan langsung
 */
export function KategoriBadge({
  kategori,
  type = 'inovasi',
  style = 'solid',
  className = ''
}: {
  kategori: string;
  type?: 'inovasi' | 'berita';
  style?: KategoriStyle;
  className?: string;
}) {
  let badgeClass = '';

  switch (type) {
    case 'inovasi':
      badgeClass = getInovasiKategoriBadge(kategori, style);
      break;
    case 'berita':
      badgeClass = getBeritaKategoriBadge(kategori, style);
      break;
  }

  return (
    <span className={`${badgeClass} ${className}`}>
      {kategori}
    </span>
  );
}

/**
 * Component StatusBadge untuk menampilkan status (published, draft, dll)
 */
export function StatusBadge({
  status,
  style = 'solid',
  className = ''
}: {
  status: string;
  style?: KategoriStyle;
  className?: string;
}) {
  const badgeClass = getStatusBadge(status, style);

  return (
    <span className={`${badgeClass} ${className}`}>
      {status}
    </span>
  );
}
