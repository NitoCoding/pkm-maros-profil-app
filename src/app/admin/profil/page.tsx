"use client";
import { useState, useEffect, useCallback } from "react";
import { Edit, X, Loader2 } from "lucide-react";
import { useDropzone } from "react-dropzone";
import CKEditorWrapper from "@/components/ckeditor/CKEditorWrapper";
import ReactPlayer from "react-player";
import { IProfil } from "@/types/profil";
import { prepareHTMLForRender } from "@/libs/utils/htmlUtils";
import { useProfil } from "@/hooks/useProfil";
import { toast } from 'react-hot-toast'
import Image from "next/image";

export default function ProfilAdminPage() {
  // Hook untuk mengambil data profil
  const {
    profil: profilData,
    loading: loadingProfil,
    error: errorProfil,
    refresh: refreshProfil,
  } = useProfil();

  // State untuk mutasi data profil
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<IProfil["jenis"]>("visi");
  const [formData, setFormData] = useState("");
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // Helper function untuk mendapatkan data berdasarkan jenis
  const getProfilByJenis = (jenis: IProfil["jenis"]) => {
    return profilData.find((item) => item.jenis === jenis);
  };

  // Helper function untuk mendapatkan isi konten
  const getContent = (jenis: IProfil["jenis"]) => {
    const item = getProfilByJenis(jenis);
    return item?.isi || "Belum ada data";
  };

  // Helper function untuk mendapatkan gambar
  const getImage = (jenis: IProfil["jenis"]) => {
    const item = getProfilByJenis(jenis);
    return item?.gambarUrl || "";
  };

  const getVideoProfil = (jenis: IProfil["jenis"]) => {
    const item = getProfilByJenis(jenis);
    return item?.videoUrl || "";
  };

  const openModal = (type: IProfil["jenis"]) => {
    setModalType(type);
    const item = getProfilByJenis(type);
    if (type === "struktur") {
      setFormData(item?.gambarUrl || "");
    } else if (type === "video") {
      setFormData(item?.videoUrl || "");
    } else {
      setFormData(item?.isi || "");
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalType("visi");
    setFormData("");
    setUploading(false);
    setSaveError(null);
    setPreviewUrl(null);
  };

  // Upload image to Cloudinary with HD quality
  const uploadImage = async (file: File): Promise<string> => {
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)
      formDataUpload.append('folder', 'galeri')
      formDataUpload.append('quality', 'high') // Use high quality for HD images

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to upload image')
      }

      const result = await response.json()
      toast.success('Gambar berhasil diupload dengan kualitas HD!')
      return result.url
    } catch (error) {
      toast.error('Gagal mengupload gambar')
      console.error('Error uploading image:', error)
      throw error
    }
  }

  // Dropzone configuration
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles[0]) return

      console.log('Uploading file:', acceptedFiles[0])
      setUploading(true)
      setPreviewUrl(URL.createObjectURL(acceptedFiles[0]))

      try {
        const url = await uploadImage(acceptedFiles[0])
        setFormData(url) // Mengganti setValue dengan setFormData
        toast.success('Gambar berhasil diupload')
      } catch (error) {
        // Error already handled in uploadImage function
        setPreviewUrl(null)
      } finally {
        setUploading(false)
      }
    },
    [setFormData], // Mengganti setValue dengan setFormData
  )

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
          setFormData((e.target?.result as string) || "");
          setUploading(false);
        }, 1000);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);

    try {
      let updateData: Partial<IProfil> = {
        jenis: modalType,
      };

      if (modalType === "struktur") {
        updateData.gambarUrl = formData;
      } else if (modalType === "video") {
        updateData.videoUrl = formData;
      } else {
        updateData.isi = formData;
      }

      const response = await fetch('/api/profil', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Gagal menyimpan data');
      }

      if (result.success) {
        console.log("Data saved successfully");
        refreshProfil(); // Refresh data setelah berhasil disimpan
        closeModal();
      } else {
        throw new Error(result.error || 'Gagal menyimpan data');
      }
    } catch (error: any) {
      console.error("Error saving data:", error);
      setSaveError(error.message || "Gagal menyimpan data. Silakan coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  const getModalTitle = () => {
    const titles: Record<string, string> = {
      sejarah: "Sejarah Singkat",
      visi: "Visi",
      misi: "Misi",
      struktur: "Struktur Organisasi",
      sambutan: "Sambutan Lurah",
      video: "Video Profil",
    };
    return titles[modalType] || "";
  };

  // Loading state
  if (loadingProfil) {
    return (
      <div className="px-6 py-8">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin" size={32} />
          <span className="ml-2">Memuat data profil...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (errorProfil) {
    return (
      <div className="px-6 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error: {errorProfil}</p>
            <button
              onClick={refreshProfil}
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
        <h2 className="text-2xl font-bold text-gray-800">Profil Daerah</h2>
      </div>

      <div className="overflow-x-auto rounded-2xl p-4 ">
        <div className="flex flex-col items-center mb-4 space-y-6">
          {/* Card Sambutan Lurah */}
          <div className="w-full max-w-4xl bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Sambutan Lurah</h1>
                <button
                  onClick={() => openModal("sambutan")}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
                >
                  <Edit size={16} />
                  <span className="hidden sm:inline font-semibold">Edit</span>
                </button>
              </div>
              <div className="text-gray-700 text-base leading-relaxed">
                <div
                  className="prose prose-gray max-w-none leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: prepareHTMLForRender(getContent("sambutan") || ""),
                  }}
                />
              </div>
            </div>
          </div>

          {/* Card Sejarah Singkat */}
          <div className="w-full max-w-4xl bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Sejarah Singkat</h1>
                <button
                  onClick={() => openModal("sejarah")}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
                >
                  <Edit size={16} />
                  <span className="hidden sm:inline font-semibold">Edit</span>
                </button>
              </div>
              <div className="text-gray-700 text-base leading-relaxed">
                <div
                  className="prose prose-gray max-w-none leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: prepareHTMLForRender(getContent("sejarah") || ""),
                  }}
                />
              </div>
            </div>
          </div>

          {/* Card Visi */}
          <div className="w-full max-w-4xl bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Visi</h1>
                <button
                  onClick={() => openModal("visi")}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
                >
                  <Edit size={16} />
                  <span className="hidden sm:inline font-semibold">Edit</span>
                </button>
              </div>
              <div className="text-gray-700 text-base leading-relaxed">
                <div
                  className="prose prose-gray max-w-none leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: prepareHTMLForRender(getContent("visi") || ""),
                  }}
                />
              </div>
            </div>
          </div>

          {/* Card Misi */}
          <div className="w-full max-w-4xl bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Misi</h1>
                <button
                  onClick={() => openModal("misi")}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
                >
                  <Edit size={16} />
                  <span className="hidden sm:inline font-semibold">Edit</span>
                </button>
              </div>
              <div className="text-gray-700 text-base leading-relaxed whitespace-pre-line">
                <div
                  className="prose prose-gray max-w-none leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: prepareHTMLForRender(getContent("misi") || ""),
                  }}
                />
              </div>
            </div>
          </div>

          {/* Card Struktur Organisasi dengan Layout Gambar + Teks */}
          <div className="w-full max-w-4xl bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Struktur Organisasi</h1>
                <button
                  onClick={() => openModal("struktur")}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
                >
                  <Edit size={16} />
                  <span className="hidden sm:inline font-semibold">Edit</span>
                </button>
              </div>

              <div className="flex flex-col md:flex-row gap-6">
                {/* Gambar di kiri */}
                <div className="flex-shrink-0 md:w-80">
                  {getImage("struktur") ? (
                    <div className="relative w-full h-64">

                    <Image
                      src={getImage("struktur")}
                      alt="Struktur Organisasi"
                      fill
                      className="w-full h-64 object-cover rounded-lg border border-gray-200"
                      />
                      </div>
                  ) : (
                    <div className="w-full h-64 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">Belum ada gambar</span>
                    </div>
                  )}
                </div>

                {/* Teks di kanan */}
                <div className="flex-1">
                  <div className="text-gray-700 text-base leading-relaxed">
                    <p className="mb-4">
                      Struktur organisasi kelurahan menunjukkan hierarki dan
                      pembagian tugas dari setiap divisi yang ada. Organisasi
                      ini dipimpin oleh Lurah yang dibantu oleh beberapa seksi.
                    </p>
                    <p className="mb-4">
                      Setiap seksi memiliki tugas dan tanggung jawab yang
                      spesifik dalam menjalankan pelayanan kepada masyarakat.
                    </p>
                    <p>
                      Koordinasi antar seksi dilakukan secara rutin untuk
                      memastikan pelayanan yang optimal kepada warga kelurahan.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card untuk video profil */}
          <div className="w-full max-w-4xl bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Video Profil</h1>
                <button
                  onClick={() => openModal("video")}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
                >
                  <Edit size={16} />
                  <span className="hidden sm:inline font-semibold">Edit</span>
                </button>
              </div>

              <div className="w-full aspect-video bg-gray-100 rounded-lg border border-gray-200">
                {getVideoProfil("video") ? (
                  <ReactPlayer
                    src={getVideoProfil("video")}
                    width="100%"
                    height="100%"
                    controls={true}
                    className="rounded-lg"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-400">Belum ada video</span>
                  </div>
                )}
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

              {saveError && (
                <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {saveError}
                </div>
              )}

              <div className="p-6">
                {modalType === "struktur" ? (
                  <div className="space-y-4">
                    {/* DROPZONE UPLOAD GAMBAR */}
                    <div>
                      <label className="font-medium">
                        Gambar Struktur Organisasi
                      </label>
                      <div
                        {...getRootProps()}
                        className={`mt-1 border-2 border-dashed rounded-lg px-3 py-4 flex flex-col items-center justify-center cursor-pointer transition
                          ${
                            isDragActive
                              ? "border-blue-400 bg-blue-50"
                              : "border-gray-300 bg-gray-50"
                          }
                          ${uploading ? "opacity-60 pointer-events-none" : ""}
                        `}
                      >
                        <input {...getInputProps()} />
                        {uploading ? (
                          <span className="flex items-center gap-2 text-blue-600">
                            <Loader2 className="animate-spin" size={18} />{" "}
                            Uploading...
                          </span>
                        ) : formData || previewUrl ? (
                          <div className="relative w-40 h-32">

                          <Image
                            src={formData || previewUrl || ""}
                            alt="Preview"
                            fill
                            className="w-40 h-32 object-cover rounded mb-2 border"
                            />
                            </div>
                        ) : (
                          <span className="text-gray-400">
                            Klik/drag file gambar di sini (maks 5MB)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : modalType === "video" ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        URL Video
                      </label>
                      <input
                        type="url"
                        value={formData}
                        onChange={(e) => setFormData(e.target.value)}
                        placeholder="Masukkan URL video (YouTube, Vimeo, dll)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Preview Video */}
                    {formData && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Preview Video
                        </label>
                        <div className="w-full aspect-video bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                          <ReactPlayer
                            src={formData}
                            width="100%"
                            height="100%"
                            controls={true}
                            className="rounded-lg"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Konten {getModalTitle()}
                      </label>
                      {/* CKEditor untuk Text */}
                      <CKEditorWrapper
                        value={formData}
                        onChange={(value) => setFormData(value)}
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