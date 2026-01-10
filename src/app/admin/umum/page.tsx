"use client";

import { useState } from 'react';
import { useUmum, useUmumMutation } from '@/hooks/useUmum';
import { IUmum } from '@/types/umum';
import CardPenduduk from '@/components/cards/CardPenduduk';
import { BarChart3, Users, School, Heart, MapPin, Edit, Save, X, Upload } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import CKEditorWrapper from '@/components/ckeditor/CKEditorWrapper';
import { toast } from 'react-hot-toast';
import { get } from 'http';
import Image from 'next/image';

export default function AdminUmumPage() {
  const { umum, loading, error, refresh } = useUmum();
  const { updateUmumByJenis, loading: mutationLoading } = useUmumMutation();

  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [formData, setFormData] = useState<IUmum | Record<string, any>>({});
  const [uploading, setUploading] = useState(false);


  // Helper function untuk mendapatkan data berdasarkan jenis
  const getDataByJenis = (jenis: IUmum['jenis']) => {
    const item = umum.find(item => item.jenis === jenis);
    if (!item) return null;

    // Buat salinan objek untuk tidak mengubah state asli
    const parsedItem = { ...item };

    // Jika data adalah string, urai menjadi objek
    if (typeof parsedItem.data === 'string') {
      try {
        parsedItem.data = JSON.parse(parsedItem.data);
      } catch (e) {
        console.error("Failed to parse data JSON:", e);
        // parsedItem.data = null; // Atur ke null jika gagal mengurai
      }
    }

    return parsedItem;
  };


  // // console.log(getDataByJenis('infografi'));
  // Helper function untuk membuka modal edit
  const openEditModal = (jenis: IUmum['jenis']) => {
    const data = getDataByJenis(jenis);
    if (data) {
      setFormData(data);
      setEditingSection(jenis);
    }
  };

  // Helper function untuk menyimpan data
  const handleSave = async () => {
    if (!editingSection) return;

    try {
      const success = await updateUmumByJenis(editingSection as IUmum['jenis'], formData);
      if (success) {
        toast.success('Data berhasil disimpan');
        setEditingSection(null);
        setFormData({});
        refresh();
      } else {
        toast.error('Gagal menyimpan data');
      }
    } catch (error) {
      console.error('Error saving data:', error);
      toast.error('Gagal menyimpan data');
    }
  };

  // Helper function untuk menutup modal
  const closeModal = () => {
    setEditingSection(null);
    setFormData({});
  };

  // Dropzone configuration
  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif"],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    maxFiles: 1,
  });

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      // Simulasi upload file ke server
      // const formDataUpload = new FormData();
      // formDataUpload.append('file', file);
      // const response = await fetch('/api/upload', {
      //   method: 'POST',
      //   body: formDataUpload
      // });
      // const result = await response.json();
      // setFormData(result.url);

      // Simulasi delay upload
      const reader = new FileReader();
      reader.onload = (e) => {
        setTimeout(() => {
          const imageUrl = (e.target?.result as string) || "";
          setFormData(prev => ({
            ...prev,
            data: {
              ...prev.data,
              infografi: {
                ...prev.data?.infografi,
                gambar: imageUrl
              }
            }
          }));
          setUploading(false);
        }, 1000);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploading(false);
      toast.error('Gagal mengunggah gambar');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Data Umum</h1>
      </div>

      {/* Infografi Section */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold">Infografi</h2>
            </div>
            <button
              onClick={() => openEditModal('infografi')}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
          </div>
          <div className="text-gray-600">
            {getDataByJenis('infografi')?.data.infografi?.deskripsi || 'Data infografi belum tersedia'}
          </div>
          {getDataByJenis('infografi')?.data.infografi?.gambar && (
            <div className="mt-4">
              <div className='relative w-full'>

              <Image
                src={getDataByJenis('infografi')?.data.infografi?.gambar || 'default-image.png'}
                alt="Infografi"
                fill
                className="w-full max-w-md rounded-lg border border-gray-200"
                />
                </div>
            </div>
          )}
        </div>
      </div>

      {/* Administrasi Penduduk Section */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-bold">Administrasi Penduduk</h2>
            </div>
            <button
              onClick={() => openEditModal('penduduk')}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {getDataByJenis('penduduk')?.data.penduduk && (
              <>
                <CardPenduduk kategori="Total Penduduk" jumlah={getDataByJenis('penduduk')!.data.penduduk!.total} color="blue" />
                <CardPenduduk kategori="Laki-laki" jumlah={getDataByJenis('penduduk')!.data.penduduk!.lakiLaki} color="green" />
                <CardPenduduk kategori="Perempuan" jumlah={getDataByJenis('penduduk')!.data.penduduk!.perempuan} color="pink" />
                <CardPenduduk kategori="Kartu Keluarga" jumlah={getDataByJenis('penduduk')!.data.penduduk!.kk} color="purple" />
                <CardPenduduk kategori="Wajib Pilih" jumlah={getDataByJenis('penduduk')!.data.penduduk!.wajibPilih} color="orange" />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Sarana Pendidikan Section */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <School className="w-6 h-6 text-orange-600" />
              <h2 className="text-xl font-bold">Sarana Pendidikan</h2>
            </div>
            <button
              onClick={() => openEditModal('saranaPendidikan')}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {getDataByJenis('saranaPendidikan')?.data.saranaPendidikan && (
              <>
                <CardPenduduk kategori="TK/PAUD" jumlah={getDataByJenis('saranaPendidikan')!.data.saranaPendidikan!.tk} color="orange" />
                <CardPenduduk kategori="SD/MI" jumlah={getDataByJenis('saranaPendidikan')!.data.saranaPendidikan!.sd} color="yellow" />
                <CardPenduduk kategori="SMP/MTs" jumlah={getDataByJenis('saranaPendidikan')!.data.saranaPendidikan!.smp} color="blue" />
                <CardPenduduk kategori="SMA/MA" jumlah={getDataByJenis('saranaPendidikan')!.data.saranaPendidikan!.sma} color="green" />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Sarana Kesehatan Section */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-red-600" />
              <h2 className="text-xl font-bold">Sarana Kesehatan</h2>
            </div>
            <button
              onClick={() => openEditModal('saranaKesehatan')}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {getDataByJenis('saranaKesehatan')?.data.saranaKesehatan && (
              <>
                <CardPenduduk kategori="Puskesmas" jumlah={getDataByJenis('saranaKesehatan')!.data.saranaKesehatan!.puskesmas} color="red" />
                <CardPenduduk kategori="Pustu" jumlah={getDataByJenis('saranaKesehatan')!.data.saranaKesehatan!.pustu} color="pink" />
                <CardPenduduk kategori="Posyandu" jumlah={getDataByJenis('saranaKesehatan')!.data.saranaKesehatan!.posyandu} color="purple" />
                <CardPenduduk kategori="Puskesdes" jumlah={getDataByJenis('saranaKesehatan')!.data.saranaKesehatan!.puskesdes} color="indigo" />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Geografi Section */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-6 h-6 text-teal-600" />
              <h2 className="text-xl font-bold">Geografi</h2>
            </div>
            <button
              onClick={() => openEditModal('geografi')}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {getDataByJenis('geografi')?.data.geografi && (
              <>
                <div className="space-y-4">
                  <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                    <div className="text-2xl font-bold text-teal-600">{getDataByJenis('geografi')!.data.geografi!.luasWilayah} Ha</div>
                    <div className="text-sm text-gray-600">Luas Wilayah</div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="text-2xl font-bold text-blue-600">{getDataByJenis('geografi')!.data.geografi!.jumlahDusun}</div>
                    <div className="text-sm text-gray-600">Jumlah Lingkungan</div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-800">Batas Wilayah</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                        <span>Utara: {getDataByJenis('geografi')!.data.geografi!.batasUtara}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                        <span>Selatan: {getDataByJenis('geografi')!.data.geografi!.batasSelatan}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                        <span>Timur: {getDataByJenis('geografi')!.data.geografi!.batasTimur}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                        <span>Barat: {getDataByJenis('geografi')!.data.geografi!.batasBarat}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-800">Penggunaan Lahan</h3>
                    <div className="space-y-2">
                      {getDataByJenis('geografi')!.data.geografi!.penggunaanLahan && Object.entries(getDataByJenis('geografi')!.data.geografi!.penggunaanLahan).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 capitalize">{key}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-teal-500 h-2 rounded-full"
                                style={{ width: `${value}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{value}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-800">Kondisi Geografis</h3>
                    <p className="text-sm text-gray-600">{getDataByJenis('geografi')!.data.geografi!.kondisiGeografis}</p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-800">Potensi Alam</h3>
                    <p className="text-sm text-gray-600">{getDataByJenis('geografi')!.data.geografi!.potensiAlam}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingSection && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Edit {editingSection}</h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Form fields based on section */}
              {editingSection === 'infografi' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Judul
                    </label>
                    <input
                      type="text"
                      value={formData.data?.infografi?.judul || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        data: {
                          ...formData.data,
                          infografi: {
                            ...formData.data?.infografi,
                            judul: e.target.value
                          }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deskripsi
                    </label>
                    <textarea
                      value={formData.data?.infografi?.deskripsi || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        data: {
                          ...formData.data,
                          infografi: {
                            ...formData.data?.infografi,
                            deskripsi: e.target.value
                          }
                        }
                      })}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gambar Infografi
                    </label>
                    <div
                      {...getRootProps()}
                      className={`mt-1 border-2 border-dashed rounded-lg px-3 py-4 flex flex-col items-center justify-center cursor-pointer transition
                        ${isDragActive
                          ? "border-blue-400 bg-blue-50"
                          : "border-gray-300 bg-gray-50"
                        }
                        ${uploading ? "opacity-60 pointer-events-none" : ""}
                      `}
                    >
                      <input {...getInputProps()} />
                      {uploading ? (
                        <span className="flex items-center gap-2 text-blue-600">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          Uploading...
                        </span>
                      ) : formData.data?.infografi?.gambar ? (
                        <div className="flex flex-col items-center">
                          <div className='relative w-40 h-32'>

                          <Image
                            src={formData.data?.infografi?.gambar}
                            alt="Preview"
                            fill
                            className="w-40 h-32 object-cover rounded mb-2 border"
                            />
                            </div>
                          <span className="text-sm text-gray-500">Klik atau drag untuk mengganti gambar</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <span className='text-gray-400 block mb-2'>
                            Klik atau drag file gambar di sini
                          </span>
                          <span className='text-xs text-gray-500'>
                            Format: JPG, PNG, WebP (Maksimal 5MB)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {editingSection === 'penduduk' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Penduduk
                    </label>
                    <input
                      type="number"
                      value={formData.data?.penduduk?.total || 0}
                      onChange={(e) => setFormData({
                        ...formData,
                        data: {
                          ...formData.data,
                          penduduk: {
                            ...formData.data?.penduduk,
                            total: parseInt(e.target.value) || 0
                          }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Laki-laki
                    </label>
                    <input
                      type="number"
                      value={formData.data?.penduduk?.lakiLaki || 0}
                      onChange={(e) => setFormData({
                        ...formData,
                        data: {
                          ...formData.data,
                          penduduk: {
                            ...formData.data?.penduduk,
                            lakiLaki: parseInt(e.target.value) || 0
                          }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Perempuan
                    </label>
                    <input
                      type="number"
                      value={formData.data?.penduduk?.perempuan || 0}
                      onChange={(e) => setFormData({
                        ...formData,
                        data: {
                          ...formData.data,
                          penduduk: {
                            ...formData.data?.penduduk,
                            perempuan: parseInt(e.target.value) || 0
                          }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kartu Keluarga
                    </label>
                    <input
                      type="number"
                      value={formData.data?.penduduk?.kk || 0}
                      onChange={(e) => setFormData({
                        ...formData,
                        data: {
                          ...formData.data,
                          penduduk: {
                            ...formData.data?.penduduk,
                            kk: parseInt(e.target.value) || 0
                          }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Wajib Pilih
                    </label>
                    <input
                      type="number"
                      value={formData.data?.penduduk?.wajibPilih || 0}
                      onChange={(e) => setFormData({
                        ...formData,
                        data: {
                          ...formData.data,
                          penduduk: {
                            ...formData.data?.penduduk,
                            wajibPilih: parseInt(e.target.value) || 0
                          }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {editingSection === 'saranaPendidikan' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      TK/PAUD
                    </label>
                    <input
                      type="number"
                      value={formData.data?.saranaPendidikan?.tk || 0}
                      onChange={(e) => setFormData({
                        ...formData,
                        data: {
                          ...formData.data,
                          saranaPendidikan: {
                            ...formData.data?.saranaPendidikan,
                            tk: parseInt(e.target.value) || 0
                          }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SD/MI
                    </label>
                    <input
                      type="number"
                      value={formData.data?.saranaPendidikan?.sd || 0}
                      onChange={(e) => setFormData({
                        ...formData,
                        data: {
                          ...formData.data,
                          saranaPendidikan: {
                            ...formData.data?.saranaPendidikan,
                            sd: parseInt(e.target.value) || 0
                          }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SMP/MTs
                    </label>
                    <input
                      type="number"
                      value={formData.data?.saranaPendidikan?.smp || 0}
                      onChange={(e) => setFormData({
                        ...formData,
                        data: {
                          ...formData.data,
                          saranaPendidikan: {
                            ...formData.data?.saranaPendidikan,
                            smp: parseInt(e.target.value) || 0
                          }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SMA/MA
                    </label>
                    <input
                      type="number"
                      value={formData.data?.saranaPendidikan?.sma || 0}
                      onChange={(e) => setFormData({
                        ...formData,
                        data: {
                          ...formData.data,
                          saranaPendidikan: {
                            ...formData.data?.saranaPendidikan,
                            sma: parseInt(e.target.value) || 0
                          }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {editingSection === 'saranaKesehatan' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Puskesmas
                    </label>
                    <input
                      type="number"
                      value={formData.data?.saranaKesehatan?.puskesmas || 0}
                      onChange={(e) => setFormData({
                        ...formData,
                        data: {
                          ...formData.data,
                          saranaKesehatan: {
                            ...formData.data?.saranaKesehatan,
                            puskesmas: parseInt(e.target.value) || 0
                          }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pustu
                    </label>
                    <input
                      type="number"
                      value={formData.data?.saranaKesehatan?.pustu || 0}
                      onChange={(e) => setFormData({
                        ...formData,
                        data: {
                          ...formData.data,
                          saranaKesehatan: {
                            ...formData.data?.saranaKesehatan,
                            pustu: parseInt(e.target.value) || 0
                          }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Posyandu
                    </label>
                    <input
                      type="number"
                      value={formData.data?.saranaKesehatan?.posyandu || 0}
                      onChange={(e) => setFormData({
                        ...formData,
                        data: {
                          ...formData.data,
                          saranaKesehatan: {
                            ...formData.data?.saranaKesehatan,
                            posyandu: parseInt(e.target.value) || 0
                          }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Puskesdes
                    </label>
                    <input
                      type="number"
                      value={formData.data?.saranaKesehatan?.puskesdes || 0}
                      onChange={(e) => setFormData({
                        ...formData,
                        data: {
                          ...formData.data,
                          saranaKesehatan: {
                            ...formData.data?.saranaKesehatan,
                            puskesdes: parseInt(e.target.value) || 0
                          }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {editingSection === 'geografi' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Luas Wilayah (Ha)
                      </label>
                      <input
                        type="number"
                        value={formData.data?.geografi?.luasWilayah || 0}
                        onChange={(e) => setFormData({
                          ...formData,
                          data: {
                            ...formData.data,
                            geografi: {
                              ...formData.data?.geografi,
                              luasWilayah: parseInt(e.target.value) || 0
                            }
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Jumlah Lingkungan
                      </label>
                      <input
                        type="number"
                        value={formData.data?.geografi?.jumlahDusun || 0}
                        onChange={(e) => setFormData({
                          ...formData,
                          data: {
                            ...formData.data,
                            geografi: {
                              ...formData.data?.geografi,
                              jumlahDusun: parseInt(e.target.value) || 0
                            }
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Batas Utara
                      </label>
                      <input
                        type="text"
                        value={formData.data?.geografi?.batasUtara || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          data: {
                            ...formData.data,
                            geografi: {
                              ...formData.data?.geografi,
                              batasUtara: e.target.value
                            }
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Batas Selatan
                      </label>
                      <input
                        type="text"
                        value={formData.data?.geografi?.batasSelatan || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          data: {
                            ...formData.data,
                            geografi: {
                              ...formData.data?.geografi,
                              batasSelatan: e.target.value
                            }
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Batas Timur
                      </label>
                      <input
                        type="text"
                        value={formData.data?.geografi?.batasTimur || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          data: {
                            ...formData.data,
                            geografi: {
                              ...formData.data?.geografi,
                              batasTimur: e.target.value
                            }
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Batas Barat
                      </label>
                      <input
                        type="text"
                        value={formData.data?.geografi?.batasBarat || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          data: {
                            ...formData.data,
                            geografi: {
                              ...formData.data?.geografi,
                              batasBarat: e.target.value
                            }
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Latitude
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={formData.data?.geografi?.koordinat?.latitude || 0}
                        onChange={(e) => setFormData({
                          ...formData,
                          data: {
                            ...formData.data,
                            geografi: {
                              ...formData.data?.geografi,
                              koordinat: {
                                ...formData.data?.geografi?.koordinat,
                                latitude: parseFloat(e.target.value) || 0
                              }
                            }
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Longitude
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={formData.data?.geografi?.koordinat?.longitude || 0}
                        onChange={(e) => setFormData({
                          ...formData,
                          data: {
                            ...formData.data,
                            geografi: {
                              ...formData.data?.geografi,
                              koordinat: {
                                ...formData.data?.geografi?.koordinat,
                                longitude: parseFloat(e.target.value) || 0
                              }
                            }
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kondisi Geografis
                    </label>
                    <textarea
                      value={formData.data?.geografi?.kondisiGeografis || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        data: {
                          ...formData.data,
                          geografi: {
                            ...formData.data?.geografi,
                            kondisiGeografis: e.target.value
                          }
                        }
                      })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Potensi Alam
                    </label>
                    <input
                      type="text"
                      value={formData.data?.geografi?.potensiAlam || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        data: {
                          ...formData.data,
                          geografi: {
                            ...formData.data?.geografi,
                            potensiAlam: e.target.value
                          }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pertanian (%)
                      </label>
                      <input
                        type="number"
                        value={formData.data?.geografi?.penggunaanLahan?.pertanian || 0}
                        onChange={(e) => setFormData({
                          ...formData,
                          data: {
                            ...formData.data,
                            geografi: {
                              ...formData.data?.geografi,
                              penggunaanLahan: {
                                ...formData.data?.geografi?.penggunaanLahan,
                                pertanian: parseInt(e.target.value) || 0
                              }
                            }
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Perumahan (%)
                      </label>
                      <input
                        type="number"
                        value={formData.data?.geografi?.penggunaanLahan?.perumahan || 0}
                        onChange={(e) => setFormData({
                          ...formData,
                          data: {
                            ...formData.data,
                            geografi: {
                              ...formData.data?.geografi,
                              penggunaanLahan: {
                                ...formData.data?.geografi?.penggunaanLahan,
                                perumahan: parseInt(e.target.value) || 0
                              }
                            }
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hutan (%)
                      </label>
                      <input
                        type="number"
                        value={formData.data?.geografi?.penggunaanLahan?.hutan || 0}
                        onChange={(e) => setFormData({
                          ...formData,
                          data: {
                            ...formData.data,
                            geografi: {
                              ...formData.data?.geografi,
                              penggunaanLahan: {
                                ...formData.data?.geografi?.penggunaanLahan,
                                hutan: parseInt(e.target.value) || 0
                              }
                            }
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lainnya (%)
                      </label>
                      <input
                        type="number"
                        value={formData.data?.geografi?.penggunaanLahan?.lainnya || 0}
                        onChange={(e) => setFormData({
                          ...formData,
                          data: {
                            ...formData.data,
                            geografi: {
                              ...formData.data?.geografi,
                              penggunaanLahan: {
                                ...formData.data?.geografi?.penggunaanLahan,
                                lainnya: parseInt(e.target.value) || 0
                              }
                            }
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={mutationLoading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {mutationLoading ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}