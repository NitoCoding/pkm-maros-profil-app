"use client";
import HeaderPage from "@/components/HeaderPage";
import Main from "@/components/Main";
import { IPegawai } from "@/types/pegawai";
import Image from "next/image";
import ReactPlayer from "react-player";
import {
  useVisi,
  useMisi,
  useSejarah,
  useStruktur,
  useVideo,
} from "@/hooks/useProfil";
import { usePegawai } from "@/hooks/usePegawai";
import { prepareHTMLForRender } from "@/libs/utils/htmlUtils";
import PageHead from "@/components/PageHead";
import CardStokLite from "@/components/CardStokLite";
import { getCardStokImageUrl } from "@/libs/utils/cloudinary";
import { MapPin } from "lucide-react";

export default function SejarahPage() {
  const { profil: visi, loading: loadingVisi } = useVisi();
  const { profil: misi, loading: loadingMisi } = useMisi();
  const { profil: sejarah, loading: loadingSejarah } = useSejarah();
  const { profil: struktur, loading: loadingStruktur } = useStruktur();
  const { profil: video, loading: loadingVideo } = useVideo();
  const { pegawai, loading: loadingPegawai } = usePegawai({ pageSize: 50 });

  const isLoading =
    loadingVisi ||
    loadingMisi ||
    loadingSejarah ||
    loadingStruktur ||
    loadingVideo ||
    loadingPegawai;

  return (
    <>
      <PageHead 
        title="Tentang Kelurahan Bilokka"
        description="Sejarah, visi, misi, dan struktur organisasi Kelurahan Bilokka"
        keywords="tentang, sejarah, visi, misi, kelurahan, bilokka"
      />
      <div className="pt-12 min-h-screen pb-3">
        <Main>
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="container mx-auto max-w-7xl">
              <div className="decoration-2 text-green-700">
                <HeaderPage
                  title="Tentang Kelurahan Bilokka"
                  description=""
                  customClass="mx-auto text-center"
                />
              </div>
              <div className="w-full space-y-6 sm:space-y-8">
                {/* Video Section */}
                {video?.videoUrl && (
                  <div className="flex justify-center w-full max-w-md sm:max-w-lg md:max-w-4xl mx-auto bg-white rounded-lg p-4 sm:p-6 shadow-lg">
                    <div className="w-full aspect-video">
                      <ReactPlayer
                        src={video.videoUrl}
                        controls
                        width="100%"
                        height="100%"
                      />
                    </div>
                  </div>
                )}
                
                {/* Sejarah Section */}
                {sejarah && (
                  <div className="flex justify-center w-full max-w-md sm:max-w-lg md:max-w-4xl mx-auto bg-white rounded-lg p-4 sm:p-6 shadow-lg">
                    <div className="w-full text-gray-700">
                      <h1 className="text-xl sm:text-2xl font-bold mb-4 text-green-700 text-center">
                        {sejarah.judul || "Sejarah Singkat"}
                      </h1>
                      <div className="text-gray-700 text-base sm:text-lg">
                        <div
                          className="prose prose-gray max-w-none leading-relaxed"
                          dangerouslySetInnerHTML={{
                            __html: prepareHTMLForRender(sejarah.isi || ""),
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Visi & Misi Section */}
                <div className="flex flex-col gap-6 sm:gap-8">
                  {visi && (
                    <div className="flex flex-col justify-center w-full max-w-md sm:max-w-lg md:max-w-4xl mx-auto bg-white rounded-lg p-4 sm:p-6 shadow-lg">
                      <div className="w-full">
                        <h1 className="text-xl sm:text-2xl font-bold mb-4 text-green-700 text-center">
                          {visi.judul || "Visi"}
                        </h1>
                        <div className="text-gray-700 text-base sm:text-lg">
                          <div
                            className="prose prose-gray max-w-none leading-relaxed"
                            dangerouslySetInnerHTML={{
                              __html: prepareHTMLForRender(visi.isi || ""),
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {misi && (
                    <div className="flex flex-col justify-center w-full max-w-md sm:max-w-lg md:max-w-4xl mx-auto bg-white rounded-lg p-4 sm:p-6 shadow-lg">
                      <div className="w-full">
                        <h1 className="text-xl sm:text-2xl font-bold mb-4 text-green-700 text-center">
                          {misi.judul || "Misi"}
                        </h1>
                        <div className="text-gray-700 text-base sm:text-lg">
                          <div
                            className="prose prose-gray max-w-none leading-relaxed"
                            dangerouslySetInnerHTML={{
                              __html: prepareHTMLForRender(misi.isi || ""),
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Struktur Organisasi Section */}
                <div className="flex flex-col gap-6 sm:gap-8">
                  {struktur && (
                    <div className="flex justify-center w-full max-w-md sm:max-w-lg md:max-w-4xl mx-auto bg-white rounded-lg p-4 sm:p-6 shadow-lg">
                      <div className="w-full">
                        <h1 className="text-xl sm:text-2xl font-bold mb-4 text-green-700 text-center">
                          {struktur.judul || "Struktur Organisasi"}
                        </h1>
                        <div className="text-gray-700">
                          {struktur.gambar && (
                            <Image
                              src={struktur.gambar}
                              alt="Struktur Organisasi Kelurahan Bilokka"
                              width={800}
                              height={600}
                              className="w-full h-auto object-cover rounded-lg"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Staff Section */}
                  {pegawai.length > 0 && (
                    <div className="flex flex-col justify-center w-full max-w-md sm:max-w-lg md:max-w-4xl mx-auto bg-white rounded-lg p-4 sm:p-6 shadow-lg">
                      <div className="w-full">
                        <h1 className="text-xl sm:text-2xl font-bold mb-6 text-green-700 text-center">
                          Staff
                        </h1>
                        <div className="w-full">
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
                            {pegawai.map((pegawai) => (
                              <div key={pegawai.id}>{pegawaiCard(pegawai)}</div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Loading State */}
                {isLoading && (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Main>
      </div>
    </>
  );

  function pegawaiCard(pegawai: IPegawai) {
    const optimizedImageUrl = getCardStokImageUrl(pegawai.foto);
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        {/* Image Container - Square format */}
			<div className='relative w-full aspect-square overflow-hidden bg-gray-50'>
				<Image
					src={optimizedImageUrl}
					alt={pegawai.nama}
					fill
					className='object-cover group-hover:scale-105 transition-transform duration-200'
					unoptimized
					priority
				/>
			</div>

			{/* Content - Minimal */}
			<div className='p-3'>
				{/* Name */}
				<h3 className='text-sm font-semibold text-gray-900 text-center mb-1 truncate'>
					{pegawai.nama}
				</h3>
				
				{/* Position */}
				<div className='flex items-center justify-center gap-1 text-gray-600'>
					<MapPin className='w-3 h-3' />
					<p className='text-xs text-center truncate'>{pegawai.jabatan}</p>
				</div>
			</div>
      </div>
    );
  }
}
