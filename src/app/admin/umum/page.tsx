"use client";

import { useState } from 'react';
import { useUmum, useUmumMutation } from '@/hooks/useUmum';
import { IUmum } from '@/types/umum';
import CardPenduduk from '@/components/CardPenduduk';
import { BarChart3, Users, School, Heart, Edit, Save, X } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import CKEditorWrapper from '@/components/ckeditor/CKEditorWrapper';

export default function AdminUmumPage() {
  const { umum, loading, error, refresh } = useUmum();
  const { updateUmumByJenis, loading: mutationLoading } = useUmumMutation();
  
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});

  // Helper function untuk mendapatkan data berdasarkan jenis
  const getDataByJenis = (jenis: IUmum['jenis']) => {
    return umum.find(item => item.jenis === jenis);
  };

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
        setEditingSection(null);
        setFormData({});
        refresh();
      }
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  // Helper function untuk menutup modal
  const closeModal = () => {
    setEditingSection(null);
    setFormData({});
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
                      Klinik
                    </label>
                    <input
                      type="number"
                      value={formData.data?.saranaKesehatan?.klinik || 0}
                      onChange={(e) => setFormData({
                        ...formData,
                        data: {
                          ...formData.data,
                          saranaKesehatan: {
                            ...formData.data?.saranaKesehatan,
                            klinik: parseInt(e.target.value) || 0
                          }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
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
