"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Upload, X, ExternalLink, Instagram, Youtube, Music } from "lucide-react";
import { toast } from "react-hot-toast";
import { createWisata } from "@/hooks/useWisata";
import { IWisata } from "@/types/wisata-admin";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// --- Zod Schema ---
const wisataSchema = z.object({
  nama: z.string().min(1, "Nama wisata wajib diisi"),
  deskripsiSingkat: z.string().min(1, "Deskripsi singkat wajib diisi"),
  deskripsiLengkap: z.string().optional(),
  altText: z.string().optional(),
  lokasiLink: z.string().url("Harus berupa URL valid").optional().or(z.literal("")),
  linkPendaftaran: z.string().url("Harus berupa URL valid").optional().or(z.literal("")),
  linkWebsite: z.string().url("Harus berupa URL valid").optional().or(z.literal("")),
  gambar: z.array(z.string().url("Harus berupa URL gambar yang valid")).min(1, "Minimal 1 gambar diperlukan"),
  tags: z.array(z.string()).optional(),

  // Ganti dari nested object → flat fields
  instagram: z.string().url("Instagram harus berupa URL valid").optional().or(z.literal("")),
  youtube: z.string().url("YouTube harus berupa URL valid").optional().or(z.literal("")),
  tiktok: z.string().url("TikTok harus berupa URL valid").optional().or(z.literal("")),
});

type WisataFormValues = z.infer<typeof wisataSchema>;
// --- End Schema ---

export default function AddWisataPage() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<WisataFormValues>({
    resolver: zodResolver(wisataSchema),
    defaultValues: {
      nama: "",
      deskripsiSingkat: "",
      deskripsiLengkap: "",
      altText: "",
      lokasiLink: "",
      linkPendaftaran: "",
      linkWebsite: "",
      gambar: [],
      tags: [],
      instagram: "",
      youtube: "",
      tiktok: "",
    },
  });

  const gambar = watch("gambar");
  const tags = watch("tags") || [];

  // Upload image to Cloudinary
  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "wisata");
    formData.append("quality", "high");

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Gagal mengupload gambar");
    }

    const result = await response.json();
    toast.success("Gambar berhasil diupload!");
    return result.url;
  };

  // Dropzone config
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles[0]) return;
      setUploading(true);

      try {
        const url = await uploadImage(acceptedFiles[0]);
        const newImages = [...uploadedImages, url];
        setUploadedImages(newImages);
        setValue("gambar", newImages, { shouldValidate: true });
      } catch (error) {
        // Error handled in uploadImage
      } finally {
        setUploading(false);
      }
    },
    [uploadedImages, setValue]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: true,
    maxSize: 10 * 1024 * 1024,
  });

  // Tag handlers
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setValue("tags", [...tags, tagInput.trim()], { shouldValidate: true });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setValue(
      "tags",
      tags.filter((t) => t !== tagToRemove),
      { shouldValidate: true }
    );
  };

  // Remove image by index
  const handleRemoveImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(newImages);
    setValue("gambar", newImages, { shouldValidate: true });
  };

  // Submit handler
  const onSubmit: SubmitHandler<WisataFormValues> = async (data) => {
    try {
      const payload = {
        ...data,
        socialMedia: {
          instagram: data.instagram || null,
          youtube: data.youtube || null,
          tiktok: data.tiktok || null,
        },
        createdBy: 1,
      };

      const result = await createWisata(payload);

      if (result) {
        toast.success("Wisata berhasil ditambahkan!");
        router.push("/admin/wisata");
      } else {
        throw new Error("Gagal menambah wisata");
      }
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan saat menyimpan data");
    }
  };

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tambah Wisata Baru</h1>
          <p className="text-gray-600">Tambahkan destinasi wisata baru</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* INFORMASI DASAR */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Informasi Dasar</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Wisata *
              </label>
              <input
                {...register("nama")}
                type="text"
                placeholder="Contoh: Air Terjun Salewangang"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.nama ? "border-red-500" : "border-gray-300"
                  }`}
              />
              {errors.nama && (
                <p className="text-red-500 text-xs mt-1">{errors.nama.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alt Text Gambar
              </label>
              <input
                {...register("altText")}
                type="text"
                placeholder="Deskripsi gambar untuk SEO & aksesibilitas"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deskripsi Singkat *
            </label>
            <textarea
              {...register("deskripsiSingkat")}
              rows={3}
              placeholder="Tuliskan gambaran singkat wisata, contoh: 'Wisata alam dengan panorama pegunungan dan udara sejuk...'"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.deskripsiSingkat ? "border-red-500" : "border-gray-300"
                }`}
            />
            {errors.deskripsiSingkat && (
              <p className="text-red-500 text-xs mt-1">{errors.deskripsiSingkat.message}</p>
            )}
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deskripsi Lengkap
            </label>
            <textarea
              {...register("deskripsiLengkap")}
              rows={6}
              placeholder="Tuliskan deskripsi lengkap tentang wisata, termasuk sejarah, daya tarik utama, fasilitas, jam operasional, harga tiket, dan informasi tambahan lainnya."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* GAMBAR */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Gambar</h2>

          <div
            {...getRootProps()}
            className={`mt-1 border-2 border-dashed rounded-lg px-3 py-4 flex flex-col items-center justify-center cursor-pointer transition mb-4
            ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50'}
            ${uploading ? 'opacity-60 pointer-events-none' : ''}`}
          >
            <input {...getInputProps()} />
            {uploading ? (
              <span className='flex items-center gap-2 text-blue-600'>
                <Loader2 className='animate-spin' size={18} /> Mengupload...
              </span>
            ) : (
              <div className='text-center'>
                <Upload size={24} className="mx-auto mb-2 text-gray-400" />
                <span className="text-gray-400 block mb-2">
                  Klik atau drag file gambar di sini
                </span>
                <span className="text-xs text-gray-500">
                  Format: JPG, PNG, WebP (Maksimal 10MB)
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {uploadedImages.map((url, index) => (
              <div key={index} className="relative group">
                <div className="relative w-full h-32">
                  <Image
                    src={url}
                    alt={`Gambar ${index + 1}`}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
          {errors.gambar && (
            <p className="text-red-500 text-xs mt-2">{errors.gambar.message}</p>
          )}
        </div>

        {/* LOKASI & LINK */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Lokasi & Link</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link Google Maps</label>
              <div className="relative">
                <input
                  {...register("lokasiLink")}
                  type="url"
                  placeholder="https://maps.app.goo.gl/xxxxxx"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.lokasiLink ? "border-red-500" : "border-gray-300"
                    }`}
                />
                <ExternalLink size={16} className="absolute right-3 top-3 text-gray-400" />
              </div>
              {errors.lokasiLink && (
                <p className="text-red-500 text-xs mt-1">{errors.lokasiLink.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link Pendaftaran</label>
              <div className="relative">
                <input
                  {...register("linkPendaftaran")}
                  type="url"
                  placeholder="https://contoh.com/form-pendaftaran"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.linkPendaftaran ? "border-red-500" : "border-gray-300"
                    }`}
                />
                <ExternalLink size={16} className="absolute right-3 top-3 text-gray-400" />
              </div>
              {errors.linkPendaftaran && (
                <p className="text-red-500 text-xs mt-1">{errors.linkPendaftaran.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link Website</label>
              <div className="relative">
                <input
                  {...register("linkWebsite")}
                  type="url"
                  placeholder="https://website-wisata.com"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.linkWebsite ? "border-red-500" : "border-gray-300"
                    }`}
                />
                <ExternalLink size={16} className="absolute right-3 top-3 text-gray-400" />
              </div>
              {errors.linkWebsite && (
                <p className="text-red-500 text-xs mt-1">{errors.linkWebsite.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* TAGS */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Tags</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags{" "}
              <span className="text-xs text-gray-500">(pisahkan dengan koma atau enter)</span>
            </label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "," || e.key === "Enter") {
                  e.preventDefault();
                  const value = tagInput.trim().replace(/,+$/, "");
                  if (value && !tags.includes(value)) {
                    setValue("tags", [...tags, value], { shouldValidate: true });
                    setTagInput("");
                  }
                }
              }}
              placeholder="alam, keluarga, pendidikan"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            {tags.map((tag, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => setValue("tags", tags.filter((t) => t !== tag), { shouldValidate: true })}
                  className="text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* MEDIA SOSIAL (POLA INOVASI) */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Media Sosial</h2>
          <p className="text-sm text-gray-500 mb-4">Masukkan tautan profil media sosial terkait wisata</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Instagram */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">

                Instagram
              </label>
              <input
                {...register("instagram")}
                type="url"
                placeholder="https://instagram.com/username"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.instagram ? "border-red-500" : "border-gray-300"
                  }`}
              />
              {errors.instagram && (
                <p className="text-red-500 text-xs mt-1">{errors.instagram.message}</p>
              )}
            </div>

            {/* YouTube */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">

                YouTube
              </label>
              <input
                {...register("youtube")}
                type="url"
                placeholder="https://youtube.com/@channel"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.youtube ? "border-red-500" : "border-gray-300"
                  }`}
              />
              {errors.youtube && (
                <p className="text-red-500 text-xs mt-1">{errors.youtube.message}</p>
              )}
            </div>

            {/* TikTok */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">

                TikTok
              </label>
              <input
                {...register("tiktok")}
                type="url"
                placeholder="https://tiktok.com/@username"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.tiktok ? "border-red-500" : "border-gray-300"
                  }`}
              />
              {errors.tiktok && (
                <p className="text-red-500 text-xs mt-1">{errors.tiktok.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={uploading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Mengupload...
              </>
            ) : (
              <>
                <Save size={16} />
                Simpan Wisata
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}