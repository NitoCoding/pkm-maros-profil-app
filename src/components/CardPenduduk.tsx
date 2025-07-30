import Image from 'next/image'

interface CardPendudukProps {
  kategori: string;
  jumlah: number;
  icon?: string;
  color?: 'blue' | 'green' | 'pink' | 'purple' | 'orange' | 'teal' | 'yellow' | 'red' | 'indigo';
}

const colorClasses = {
  blue: 'bg-blue-50 border-blue-200 text-blue-600',
  green: 'bg-green-50 border-green-200 text-green-600',
  pink: 'bg-pink-50 border-pink-200 text-pink-600',
  purple: 'bg-purple-50 border-purple-200 text-purple-600',
  orange: 'bg-orange-50 border-orange-200 text-orange-600',
  teal: 'bg-teal-50 border-teal-200 text-teal-600',
  yellow: 'bg-yellow-50 border-yellow-200 text-yellow-600',
  red: 'bg-red-50 border-red-200 text-red-600',
  indigo: 'bg-indigo-50 border-indigo-200 text-indigo-600',
};

export default function CardPenduduk({ kategori, jumlah, icon, color = 'blue' }: CardPendudukProps) {
  return (
    <div className={`p-4 rounded-lg border ${colorClasses[color]} transition-all hover:shadow-md`}>
      <div className="text-2xl font-bold">{jumlah.toLocaleString()}</div>
      <div className="text-sm text-gray-600 mt-1">{kategori}</div>
    </div>
  );
}

export function CardPendudukIcon({ icon, kategori, jumlah }: { icon: string; kategori: string; jumlah: number }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 text-center hover:shadow-lg transition-shadow">
      <div className="flex justify-center mb-2">
        <img src={icon} alt={kategori} className="w-12 h-12 object-contain" />
      </div>
      <div className="text-2xl font-bold text-gray-800">{jumlah.toLocaleString()}</div>
      <div className="text-sm text-gray-600">{kategori}</div>
    </div>
  );
}
