"use client";

import HeaderPage from "@/components/HeaderPage";
import Main from "@/components/Main";
import PageHead from "@/components/PageHead";
import CardPenduduk from "@/components/CardPenduduk";
import { Users, School, Heart, MapPin, BarChart3 } from "lucide-react";
import { useInfografi, usePenduduk, useSaranaPendidikan, useSaranaKesehatan } from "@/hooks/useUmum";

export default function InfografiPage() {
  const { umum: infografi, loading: loadingInfografi } = useInfografi();
  const { umum: penduduk, loading: loadingPenduduk } = usePenduduk();
  const { umum: saranaPendidikan, loading: loadingSaranaPendidikan } = useSaranaPendidikan();
  const { umum: saranaKesehatan, loading: loadingSaranaKesehatan } = useSaranaKesehatan();

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
        title="Infografi Kelurahan Bilokka"
        description="Data demografi dan statistik Kelurahan Bilokka"
        keywords="infografi, demografi, statistik, kelurahan, bilokka"
      />
      <div className="pt-12 min-h-screen pb-3">
        <Main>
          <div className='px-4 sm:px-6 lg:px-8'>
            <div className='container mx-auto max-w-7xl'>
              <div className='decoration-2 text-green-700'>
                <HeaderPage
                  title="Infografi"
                  description="Data Demografi Kelurahan Bilokka"
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
                      {infografi?.data.infografi?.deskripsi || 'Infografi yang menampilkan data demografi dan statistik Kelurahan Bilokka'}
                    </p>
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
                      {penduduk?.data.penduduk && (
                        <>
                          <CardPenduduk kategori="Total Penduduk" jumlah={penduduk.data.penduduk.total} color="blue" />
                          <CardPenduduk kategori="Laki-laki" jumlah={penduduk.data.penduduk.lakiLaki} color="green" />
                          <CardPenduduk kategori="Perempuan" jumlah={penduduk.data.penduduk.perempuan} color="pink" />
                          <CardPenduduk kategori="Kartu Keluarga" jumlah={penduduk.data.penduduk.kk} color="purple" />
                          <CardPenduduk kategori="Wajib Pilih" jumlah={penduduk.data.penduduk.wajibPilih} color="orange" />
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
                      {saranaPendidikan?.data.saranaPendidikan && (
                        <>
                          <CardPenduduk kategori="TK/PAUD" jumlah={saranaPendidikan.data.saranaPendidikan.tk} color="orange" />
                          <CardPenduduk kategori="SD/MI" jumlah={saranaPendidikan.data.saranaPendidikan.sd} color="yellow" />
                          <CardPenduduk kategori="SMP/MTs" jumlah={saranaPendidikan.data.saranaPendidikan.smp} color="blue" />
                          <CardPenduduk kategori="SMA/MA" jumlah={saranaPendidikan.data.saranaPendidikan.sma} color="green" />
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
                      {saranaKesehatan?.data.saranaKesehatan && (
                        <>
                          <CardPenduduk kategori="Puskesmas" jumlah={saranaKesehatan.data.saranaKesehatan.puskesmas} color="red" />
                          <CardPenduduk kategori="Pustu" jumlah={saranaKesehatan.data.saranaKesehatan.pustu} color="pink" />
                          <CardPenduduk kategori="Posyandu" jumlah={saranaKesehatan.data.saranaKesehatan.posyandu} color="purple" />
                          <CardPenduduk kategori="Puskesdes" jumlah={saranaKesehatan.data.saranaKesehatan.puskesdes} color="indigo" />
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
