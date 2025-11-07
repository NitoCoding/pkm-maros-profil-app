"use client";
import { useEffect, useState } from "react";
import { Edit, X, Loader2, Clock, Phone, Mail, MapPin, User } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-hot-toast";
import { useDashboard, useDashboardMutation } from "@/hooks/useDashboard";
import { IDashboardUpdate } from "@/types/dashboard";

export default function AdminDashboardPage() {
  // Hooks untuk data dashboard
  const { dashboard, loading: loadingDashboard, error: dashboardError, refresh } = useDashboard();
  const { updateDashboardSection, loading: saving, error: saveError } = useDashboardMutation();

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"hero" | "lurah" | "workingHours" | "contact">("hero");
  const [formData, setFormData] = useState<any>({});
  const [uploading, setUploading] = useState(false);

  const openModal = (type: "hero" | "lurah" | "workingHours" | "contact") => {
    setModalType(type);
    if (dashboard) {
      setFormData(dashboard[type]);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalType("hero");
    setFormData({});
    setUploading(false);
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
    maxSize: 10 * 1024 * 1024, // 10MB for HD images
    maxFiles: 1,
  });

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'dashboard');
      formData.append('quality', 'high');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload image');
      }

      const result = await response.json();
      
      if (modalType === "hero") {
        setFormData({ ...formData, image: result.url });
      } else if (modalType === "lurah") {
        setFormData({ ...formData, photo: result.url });
      }
      
      toast.success("Gambar berhasil diupload dengan kualitas HD!");
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Gagal mengupload gambar");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const success = await updateDashboardSection(modalType, formData);
      
      if (success) {
        toast.success("Data berhasil disimpan!");
        refresh(); // Refresh data setelah berhasil disimpan
        closeModal();
      } else {
        toast.error("Gagal menyimpan data");
      }
    } catch (error) {
      console.error("Error saving data:", error);
      toast.error("Gagal menyimpan data");
    }
  };

  const getModalTitle = () => {
    const titles: Record<string, string> = {
      hero: "Gambar Hero",
      lurah: "Informasi Lurah",
      workingHours: "Jam Kerja",
      contact: "Informasi Kontak",
    };
    return titles[modalType] || "";
  };

  // Loading state
  if (loadingDashboard) {
    return (
      <div className="px-6 py-8">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin" size={32} />
          <span className="ml-2">Memuat data dashboard...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (dashboardError) {
    return (
      <div className="px-6 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error: {dashboardError}</p>
            <button
              onClick={refresh}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard Admin</h2>
        <p className="text-gray-600">Kelola informasi utama website</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card Hero Image */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-lg">🏠</span>
                </div>
                <h3 className="text-lg font-semibold">Gambar Hero</h3>
              </div>
              <button
                onClick={() => openModal("hero")}
                className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg shadow hover:bg-blue-700 transition text-sm"
              >
                <Edit size={14} />
                <span className="hidden sm:inline">Edit</span>
              </button>
            </div>
            
            <div className="space-y-3">
              {dashboard?.hero?.image ? (
                <img
                  src={dashboard.hero.image}
                  alt="Hero"
                  className="w-full h-32 object-cover rounded-lg border border-gray-200"
                />
              ) : (
                <div className="w-full h-32 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-sm">Belum ada gambar</span>
                </div>
              )}
              
              <div className="text-sm text-gray-600">
                <p><strong>Judul:</strong> {dashboard?.hero?.title || 'Selamat Datang di Desa Benteng Gajah'}</p>
                <p><strong>Subtitle:</strong> {dashboard?.hero?.subtitle || 'Melayani Masyarakat dengan Sepenuh Hati'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Card Lurah */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold">Informasi Lurah</h3>
              </div>
              <button
                onClick={() => openModal("lurah")}
                className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg shadow hover:bg-green-700 transition text-sm"
              >
                <Edit size={14} />
                <span className="hidden sm:inline">Edit</span>
              </button>
            </div>
            
            <div className="flex items-center gap-4">
              {dashboard?.lurah?.photo ? (
                <img
                  src={dashboard.lurah.photo}
                  alt="Lurah"
                  className="w-16 h-16 object-cover rounded-full border border-gray-200"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-100 rounded-full border border-gray-200 flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-400" />
                </div>
              )}
              
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800">{dashboard?.lurah?.name || 'Nama Lurah'}</h4>
                <p className="text-sm text-gray-600">{dashboard?.lurah?.position || 'Lurah Desa Benteng Gajah'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Card Jam Kerja */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold">Jam Kerja</h3>
              </div>
              <button
                onClick={() => openModal("workingHours")}
                className="flex items-center gap-2 bg-orange-600 text-white px-3 py-2 rounded-lg shadow hover:bg-orange-700 transition text-sm"
              >
                <Edit size={14} />
                <span className="hidden sm:inline">Edit</span>
              </button>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Hari:</span>
                <span className="font-medium">{dashboard?.workingHours?.days || 'Senin - Jumat'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Jam:</span>
                <span className="font-medium">{dashboard?.workingHours?.hours || '08:00 - 16:00'}</span>
              </div>
              {dashboard?.workingHours?.note && (
                <div className="mt-3 p-2 bg-orange-50 rounded-lg">
                  <p className="text-xs text-orange-700">{dashboard.workingHours.note}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Card Kontak */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Phone className="w-4 h-4 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold">Informasi Kontak</h3>
              </div>
              <button
                onClick={() => openModal("contact")}
                className="flex items-center gap-2 bg-purple-600 text-white px-3 py-2 rounded-lg shadow hover:bg-purple-700 transition text-sm"
              >
                <Edit size={14} />
                <span className="hidden sm:inline">Edit</span>
              </button>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{dashboard?.contact?.phone || '+62 123 456 789'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{dashboard?.contact?.email || 'kelurahan.bilokka@example.com'}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                <span className="text-gray-600 text-xs">{dashboard?.contact?.address || 'Jl. Contoh No. 123, Bilokka, Kota Contoh'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSave}>
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">
                  Edit {getModalTitle()}
                </h2>
                <button
                  type="button"
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700 transition"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6">
                {modalType === "hero" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gambar Hero
                      </label>
                      <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-lg px-3 py-4 flex flex-col items-center justify-center cursor-pointer transition
                          ${isDragActive ? "border-blue-400 bg-blue-50" : "border-gray-300 bg-gray-50"}
                          ${uploading ? "opacity-60 pointer-events-none" : ""}
                        `}
                      >
                        <input {...getInputProps()} />
                        {uploading ? (
                          <span className="flex items-center gap-2 text-blue-600">
                            <Loader2 className="animate-spin" size={18} />
                            Uploading...
                          </span>
                        ) : formData.image ? (
                          <img
                            src={formData.image}
                            alt="Preview"
                            className="w-40 h-32 object-cover rounded mb-2 border"
                          />
                        ) : (
                          <span className="text-gray-400">
                            Klik/drag file gambar di sini (maks 10MB)
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Judul Hero
                      </label>
                      <input
                        type="text"
                        value={formData.title || ""}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Judul hero"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subtitle Hero
                      </label>
                      <input
                        type="text"
                        value={formData.subtitle || ""}
                        onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Subtitle hero"
                      />
                    </div>
                  </div>
                )}

                {modalType === "lurah" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Foto Lurah
                      </label>
                      <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-lg px-3 py-4 flex flex-col items-center justify-center cursor-pointer transition
                          ${isDragActive ? "border-green-400 bg-green-50" : "border-gray-300 bg-gray-50"}
                          ${uploading ? "opacity-60 pointer-events-none" : ""}
                        `}
                      >
                        <input {...getInputProps()} />
                        {uploading ? (
                          <span className="flex items-center gap-2 text-green-600">
                            <Loader2 className="animate-spin" size={18} />
                            Uploading...
                          </span>
                        ) : formData.photo ? (
                          <img
                            src={formData.photo}
                            alt="Preview"
                            className="w-32 h-32 object-cover rounded-full mb-2 border"
                          />
                        ) : (
                          <span className="text-gray-400">
                            Klik/drag foto lurah di sini (maks 10MB)
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Lurah
                      </label>
                      <input
                        type="text"
                        value={formData.name || ""}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Nama lurah"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Jabatan
                      </label>
                      <input
                        type="text"
                        value={formData.position || ""}
                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Jabatan lurah"
                      />
                    </div>
                  </div>
                )}

                {modalType === "workingHours" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hari Kerja
                      </label>
                      <input
                        type="text"
                        value={formData.days || ""}
                        onChange={(e) => setFormData({ ...formData, days: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Contoh: Senin - Jumat"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Jam Kerja
                      </label>
                      <input
                        type="text"
                        value={formData.hours || ""}
                        onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Contoh: 08:00 - 16:00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Catatan (Opsional)
                      </label>
                      <textarea
                        value={formData.note || ""}
                        onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        rows={3}
                        placeholder="Contoh: Sabtu: 08:00 - 12:00 (Pelayanan Terbatas)"
                      />
                    </div>
                  </div>
                )}

                {modalType === "contact" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nomor Telepon
                      </label>
                      <input
                        type="tel"
                        value={formData.phone || ""}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="+62 123 456 789"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email || ""}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="email@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Alamat
                      </label>
                      <textarea
                        value={formData.address || ""}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        rows={3}
                        placeholder="Alamat lengkap kelurahan"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        WhatsApp
                      </label>
                      <input
                        type="tel"
                        value={formData.whatsapp || ""}
                        onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="+62 123 456 789"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving && <Loader2 className="animate-spin" size={16} />}
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
