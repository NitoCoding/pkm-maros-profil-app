"use client";

import HeaderPage from "@/components/HeaderPage";
import Main from "@/components/Main";
import { IGeografi } from "@/types/geografi";
import { IUmum } from "@/types/umum";
import { MapPin } from "lucide-react";
import MapSimple from "@/components/MapSimple";
import { useUmumByJenis } from "@/hooks/useUmum";
import PageHead from "@/components/PageHead";

export default function GeografiPage() {
  const { umum, loading, error } = useUmumByJenis("geografi");

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
  const parsedUmum = parseUmumData(umum);
  const geografi: IGeografi | undefined = parsedUmum?.data?.geografi;

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!geografi) return <div>Data tidak ditemukan</div>;

  return (
    <>
      <PageHead 
        title="Geografi Desa Benteng Gajah" 
        description="Data geografis Desa Benteng Gajah" 
      />
      <div className="pt-12 min-h-screen pb-3">
        <Main>
          <div className="mt-5 px-4 sm:px-6 lg:px-8 ">
            <div className="container mx-auto max-w-7xl">
              <div className="decoration-2 text-green-700">
                <HeaderPage
                  title="Geografi"
                  description=""
                  customClass="mx-auto text-center"
                />
              </div>
              <div className="space-y-6 sm:space-y-8">
                {/* Card Geografi */}
                <div className="w-full bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="p-4 sm:p-6">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-6 h-6 text-teal-600" />
                        <h1 className="text-xl sm:text-2xl font-bold">
                          Data Geografi
                        </h1>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Informasi Umum */}
                      <div className="space-y-4">
                        <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                          <div className="text-2xl font-bold text-teal-600">
                            {geografi.luasWilayah} Ha
                          </div>
                          <div className="text-sm text-gray-600">
                            Luas Wilayah
                          </div>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <div className="text-2xl font-bold text-blue-600">
                            {geografi.jumlahDusun}
                          </div>
                          <div className="text-sm text-gray-600">
                            Jumlah Lingkungan
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-semibold text-gray-800">
                            Batas Wilayah
                          </h3>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                              <span>Utara: {geografi.batasUtara}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                              <span>Selatan: {geografi.batasSelatan}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                              <span>Timur: {geografi.batasTimur}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                              <span>Barat: {geografi.batasBarat}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Penggunaan Lahan */}
                      <div className="space-y-4">
                        <h3 className="font-semibold text-gray-800">
                          Penggunaan Lahan
                        </h3>
                        <div className="space-y-2">
                          {geografi.penggunaanLahan &&
                            Object.entries(geografi.penggunaanLahan).map(
                              ([key, value]) => (
                                <div
                                  key={key}
                                  className="flex items-center justify-between"
                                >
                                  <span className="text-sm text-gray-600 capitalize">
                                    {key}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <div className="w-20 bg-gray-200 rounded-full h-2">
                                      <div
                                        className="bg-teal-500 h-2 rounded-full"
                                        style={{ width: `${value}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-sm font-medium">
                                      {value}%
                                    </span>
                                  </div>
                                </div>
                              )
                            )}
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-semibold text-gray-800">
                            Kondisi Geografis
                          </h3>
                          <p className="text-sm text-gray-600">
                            {geografi.kondisiGeografis}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-semibold text-gray-800">
                            Potensi Alam
                          </h3>
                          <p className="text-sm text-gray-600">
                            {geografi.potensiAlam}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Peta */}
                <div className="w-full">
                  <MapSimple />
                </div>
              </div>
            </div>
          </div>
        </Main>
      </div>
    </>
  );
}