"use client";

import HeaderPage from "@/components/HeaderPage";
import Main from "@/components/Main";
import PageHead from "@/components/PageHead";
import CardPenduduk from "@/components/CardPenduduk";
import { Users, School, Heart, MapPin, BarChart3 } from "lucide-react";
import { useInfografi, usePenduduk, useSaranaPendidikan, useSaranaKesehatan } from "@/hooks/useUmum";
import { IUmum } from "@/types/umum";
import Image from "next/image";

export default function InfografiPage() {
  const { umum: infografi, loading: loadingInfografi } = useInfografi();
  const { umum: penduduk, loading: loadingPenduduk } = usePenduduk();
  const { umum: saranaPendidikan, loading: loadingSaranaPendidikan } = useSaranaPendidikan();
  const { umum: saranaKesehatan, loading: loadingSaranaKesehatan } = useSaranaKesehatan();

  // Helper function untuk mengurai data JSON
  const parseUmumData = (umumData: IUmum | null) => {
    if (!umumData) return null;
    
    // Buat salinan objek untuk tidak mengubah state asli
    const parsedData = { ...umumData };
    
    // Jika data adalah string, urai menjadi objek
    if (typeof parsedData.data === 'string') {
      try {
        parsedData.data = JSON.parse(parsedData.data);
      } catch (e) {
        console.error("Failed to parse data JSON:", e);
        // parsedData.data = null; // Atur ke null jika gagal mengurai
      }
    }
    
    return parsedData;
  };

  // Gunakan fungsi pembantu untuk mengurai data
  const parsedInfografi = parseUmumData(infografi);
  const parsedPenduduk = parseUmumData(penduduk);
  const parsedSaranaPendidikan = parseUmumData(saranaPendidikan);
  const parsedSaranaKesehatan = parseUmumData(saranaKesehatan);

  const isLoading = loadingInfografi || loadingPenduduk || loadingSaranaPendidikan || loadingSaranaKesehatan;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
      </div>
    );
  }

  return (
    <>
      <PageHead 
        title="Infografi Desa Benteng Gajah" 
        description="Data Demografi Desa Benteng Gajah" 
      />
      <div className="pt-12 min-h-screen pb-3">
        <Main>
          <div className='mt-5 px-4 sm:px-6 lg:px-8'>
            <div className='container mx-auto max-w-7xl'>
              <div className='decoration-2 text-green-700'>
                <HeaderPage
                  title="Infografi"
                  description="Data Demografi Desa Benteng Gajah"
                  customClass="mx-auto text-center"
                />
              </div>
              
              <div className='space-y-8'>
                {/* Infografi Section */}
                <div className="w-full bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="p-4 sm:p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <BarChart3 className="w-6 h-6 text-blue-600" />
                      <h1 className="text-xl sm:text-2xl font-bold">Infografi</h1>
                    </div>
                    <p className="text-gray-600 mb-4">
                      {parsedInfografi?.data?.infografi?.deskripsi || 'Infografi yang menampilkan data demografi dan statistik Desa Benteng Gajah'}
                    </p>
                    {parsedInfografi?.data?.infografi?.gambar && (
                      <div className="mt-4">
                        <Image
                          src={parsedInfografi.data.infografi.gambar || 'default-image.jpg'} 
                          alt="Infografi" 
                          className="w-full max-w-md rounded-lg border border-gray-200"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Administrasi Penduduk Section */}
                <div className="w-full bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="p-4 sm:p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Users className="w-6 h-6 text-green-600" />
                      <h1 className="text-xl sm:text-2xl font-bold">Administrasi Penduduk</h1>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                      {parsedPenduduk?.data?.penduduk && (
                        <>
                          <CardPenduduk kategori="Total Penduduk" jumlah={parsedPenduduk.data.penduduk.total} color="blue" />
                          <CardPenduduk kategori="Laki-laki" jumlah={parsedPenduduk.data.penduduk.lakiLaki} color="green" />
                          <CardPenduduk kategori="Perempuan" jumlah={parsedPenduduk.data.penduduk.perempuan} color="pink" />
                          <CardPenduduk kategori="Kartu Keluarga" jumlah={parsedPenduduk.data.penduduk.kk} color="purple" />
                          <CardPenduduk kategori="Wajib Pilih" jumlah={parsedPenduduk.data.penduduk.wajibPilih} color="orange" />
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sarana Pendidikan Section */}
                <div className="w-full bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="p-4 sm:p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <School className="w-6 h-6 text-orange-600" />
                      <h1 className="text-xl sm:text-2xl font-bold">Sarana Pendidikan</h1>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {parsedSaranaPendidikan?.data?.saranaPendidikan && (
                        <>
                          <CardPenduduk kategori="TK/PAUD" jumlah={parsedSaranaPendidikan.data.saranaPendidikan.tk} color="orange" />
                          <CardPenduduk kategori="SD/MI" jumlah={parsedSaranaPendidikan.data.saranaPendidikan.sd} color="yellow" />
                          <CardPenduduk kategori="SMP/MTs" jumlah={parsedSaranaPendidikan.data.saranaPendidikan.smp} color="blue" />
                          <CardPenduduk kategori="SMA/MA" jumlah={parsedSaranaPendidikan.data.saranaPendidikan.sma} color="green" />
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sarana Kesehatan Section */}
                <div className="w-full bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="p-4 sm:p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Heart className="w-6 h-6 text-red-600" />
                      <h1 className="text-xl sm:text-2xl font-bold">Sarana Kesehatan</h1>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {parsedSaranaKesehatan?.data?.saranaKesehatan && (
                        <>
                          <CardPenduduk kategori="Puskesmas" jumlah={parsedSaranaKesehatan.data.saranaKesehatan.puskesmas} color="red" />
                          <CardPenduduk kategori="Pustu" jumlah={parsedSaranaKesehatan.data.saranaKesehatan.pustu} color="pink" />
                          <CardPenduduk kategori="Posyandu" jumlah={parsedSaranaKesehatan.data.saranaKesehatan.posyandu} color="purple" />
                          <CardPenduduk kategori="Puskesdes" jumlah={parsedSaranaKesehatan.data.saranaKesehatan.puskesdes} color="indigo" />
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Main>
      </div>
    </>
  );
}