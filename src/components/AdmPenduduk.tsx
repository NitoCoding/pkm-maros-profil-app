import { IDemografi } from '@/types/demografi';
import { CardPendudukIcon } from './CardPenduduk';
import CardPenduduk from './CardPenduduk';
import HeaderPage from './HeaderPage';
import { usePenduduk } from '@/hooks/useUmum';

export default function AdmPenduduk() {
  const { umum: penduduk, loading, error } = usePenduduk();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 text-center py-8">
        Error: {error}
      </div>
    );
  }

  const data = penduduk?.data.penduduk;

  if (!data) {
    return (
      <div className="text-gray-500 text-center py-8">
        Data penduduk tidak tersedia
      </div>
    );
  }

  return (
    <div className='px-4 sm:px-6 lg:px-8'>
      <div className='container mx-auto max-w-7xl'>
        <HeaderPage
          title="Administrasi Penduduk"
          description="Sistem digital yang berfungsi mempermudah pengelolaan data dan informasi terkait dengan kependudukan dan pendayagunaannya untuk pelayanan publik yang efektif dan efisien"
        />
        
        {/* Tampil pada tablet dan desktop (sm ke atas) */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <CardPenduduk kategori="Total Penduduk" jumlah={data.total} color="blue" />
          <CardPenduduk kategori="Laki-laki" jumlah={data.lakiLaki} color="green" />
          <CardPenduduk kategori="Perempuan" jumlah={data.perempuan} color="pink" />
          <CardPenduduk kategori="Kartu Keluarga" jumlah={data.kk} color="purple" />
          <CardPenduduk kategori="Wajib Pilih" jumlah={data.wajibPilih} color="orange" />
        </div>
        
        {/* Tampil pada mobile (di bawah sm) */}
        <div className="sm:hidden grid grid-cols-2 gap-4">
          <CardPendudukIcon
            icon="/jugend.png"
            kategori="Populasi"
            jumlah={data.total}
          />
          <CardPendudukIcon 
            icon="/boss.png" 
            kategori="Pria" 
            jumlah={data.lakiLaki} 
          />
          <CardPendudukIcon
            icon="/businesswoman.png"
            kategori="Wanita"
            jumlah={data.perempuan}
          />
          <CardPendudukIcon
            icon="/family.png"
            kategori="Kartu Keluarga"
            jumlah={data.kk}
          />
          <CardPendudukIcon
            icon="/voting-box.png"
            kategori="Wajib Pilih"
            jumlah={data.wajibPilih}
          />
        </div>
      </div>
    </div>
  );
}