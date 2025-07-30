"use client";
import { useState, useEffect } from "react";
import { Edit, X, Loader2 } from "lucide-react";
import { useDropzone } from "react-dropzone";
import CKEditorWrapper from "@/components/ckeditor/CKEditorWrapper";
import { useProfil, useProfilMutation } from "@/hooks/useProfil";
import ReactPlayer from "react-player";
import { IProfil } from "@/types/profil";
import { prepareHTMLForRender } from "@/libs/utils/htmlUtils";

// // Simulasi CKEditor Wrapper - hapus ini jika sudah ada CKEditorWrapper asli
// const CKEditorWrapperSim = ({
//   value,
//   onChange,
//   onBlur,
// }: {
//   value: string;
//   onChange: (value: string) => void;
//   onBlur?: () => void;
// }) => {
//   return (
//     <div className="border border-gray-300 rounded-lg">
//       <div className="bg-gray-50 border-b border-gray-300 p-2 flex gap-2">
//         <button
//           type="button"
//           className="px-2 py-1 text-sm bg-white border rounded hover:bg-gray-100"
//         >
//           <strong>B</strong>
//         </button>
//         <button
//           type="button"
//           className="px-2 py-1 text-sm bg-white border rounded hover:bg-gray-100"
//         >
//           <em>I</em>
//         </button>
//         <button
//           type="button"
//           className="px-2 py-1 text-sm bg-white border rounded hover:bg-gray-100"
//         >
//           <u>U</u>
//         </button>
//         {/* button untuk list */}
//         <button
//           type="button"
//           className="px-2 py-1 text-sm bg-white border rounded hover:bg-gray-100"
//         >
//           li
//         </button>
//       </div>
//       <textarea
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//         onBlur={onBlur}
//         className="w-full h-64 p-4 border-0 resize-none focus:outline-none focus:ring-0"
//         placeholder="Masukkan konten..."
//       />
//     </div>
//   );
// };

export default function ProfilAdminPage() {
  // Hook untuk mengambil data profil
  const {
    profil: profilData,
    loading: loadingProfil,
    error: errorProfil,
    refresh: refreshProfil,
  } = useProfil();

  // Hook untuk mutasi data profil
  const {
    updateProfilByJenis,
    loading: saving,
    error: saveError,
  } = useProfilMutation();

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<IProfil["jenis"]>("visi");
  const [formData, setFormData] = useState("");
  const [uploading, setUploading] = useState(false);

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
    return item?.gambar || "";
  };

  const getVideoProfil = (jenis: IProfil["jenis"]) => {
    const item = getProfilByJenis(jenis);
    return item?.videoUrl || "";
  };

  const openModal = (type: IProfil["jenis"]) => {
    setModalType(type);
    const item = getProfilByJenis(type);
    if (type === "struktur") {
      setFormData(item?.gambar || "");
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

    try {
      let updateData: Partial<IProfil> = {};

      if (modalType === "struktur") {
        updateData = {
          gambar: formData,
          updatedAt: new Date().toISOString(),
        };
      } else if (modalType === "video") {
        updateData = {
          videoUrl: formData,
          updatedAt: new Date().toISOString(),
        };
      } else {
        updateData = {
          isi: formData,
          updatedAt: new Date().toISOString(),
        };
      }

      const success = await updateProfilByJenis(modalType, updateData);

      if (success) {
        console.log("Data saved successfully");
        refreshProfil(); // Refresh data setelah berhasil disimpan
        closeModal();
      } else {
        alert("Gagal menyimpan data. Silakan coba lagi.");
      }
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Gagal menyimpan data. Silakan coba lagi.");
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
        <h2 className="text-2xl font-bold text-gray-800">Profil Kelurahan</h2>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white p-4 shadow">
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
                    <img
                      src={getImage("struktur")}
                      alt="Struktur Organisasi"
                      className="w-full h-64 object-cover rounded-lg border border-gray-200"
                    />
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
              {/* // ... existing code ... */}
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
                        ) : formData ? (
                          <img
                            src={formData}
                            alt="Preview"
                            className="w-40 h-32 object-cover rounded mb-2 border"
                          />
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
                          {/* {formData.includes("youtube.com") ||
                          formData.includes("youtu.be") ? (
                            <iframe
                              src={formData.replace("watch?v=", "embed/")}
                              title="Video Preview"
                              className="w-full h-full rounded-lg"
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          ) : formData.includes("vimeo.com") ? (
                            <iframe
                              src={formData.replace(
                                "vimeo.com/",
                                "player.vimeo.com/video/"
                              )}
                              title="Video Preview"
                              className="w-full h-full rounded-lg"
                              frameBorder="0"
                              allow="autoplay; fullscreen; picture-in-picture"
                              allowFullScreen
                            />
                          ) : (
                            <div className="text-center text-gray-500">
                              <p>Preview tidak tersedia untuk URL ini</p>
                              <p className="text-sm">URL: {formData}</p>
                            </div>
                          )} */}
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
                        // onBlur={() => {}}
                      />
                    </div>
                  </div>
                )}
              </div>
              {/* // ... existing code ... */}
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
