'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Save, Loader2, Upload, X, ExternalLink, Instagram, Youtube, Music } from 'lucide-react'
import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import CKEditorWrapper from '@/components/ckeditor/CKEditorWrapper'
import { toast } from 'react-hot-toast'
import Image from 'next/image'
import { IInovasi } from '@/types/inovasi'
import { useInovasiById } from '@/hooks/useInovasi'

// --- Zod Schema ---
const inovasiSchema = z.object({
  judul: z.string().min(1, 'Judul harus diisi'),
  slug: z.string().min(1, 'Slug harus diisi'),
  kategori: z.string().min(1, 'Kategori harus dipilih'),
  deskripsi: z.string().min(1, 'Deskripsi harus diisi'),
  tahun: z.number().min(2000).max(new Date().getFullYear() + 1),
  gambar: z.array(z.string()).optional(),
  altText: z.string().optional(),
  linkProyek: z.string().url('Harus berupa URL valid').optional().or(z.literal('')),
  linkDanaDesa: z.string().url('Harus berupa URL valid').optional().or(z.literal('')),
  instagram: z.string().url('Instagram harus berupa URL valid').optional().or(z.literal('')),
  youtube: z.string().url('YouTube harus berupa URL valid').optional().or(z.literal('')),
  tiktok: z.string().url('TikTok harus berupa URL valid').optional().or(z.literal('')),
})

type InovasiFormValues = z.infer<typeof inovasiSchema>

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .trim()
}

const kategoriOptions = [
  'Teknologi',
  'Pertanian',
  'Kesehatan',
  'Pendidikan',
  'Ekonomi',
  'Lingkungan',
  'Infrastruktur',
  'Sosial',
  'Lainnya',
]

export default function EditInovasiPage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])

  const { inovasi: fetchedInovasi, loading: isLoading, error } = useInovasiById(id)

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<InovasiFormValues>({
    resolver: zodResolver(inovasiSchema),
    defaultValues: {
      judul: '',
      slug: '',
      kategori: '',
      deskripsi: '',
      tahun: new Date().getFullYear(),
      gambar: [],
      altText: '',
      linkProyek: '',
      linkDanaDesa: '',
      instagram: '',
      youtube: '',
      tiktok: '',
    },
  })

  const judulValue = watch('judul')
  const [slugEdited, setSlugEdited] = useState(false)

  // Auto-generate slug from judul if not manually edited
  useEffect(() => {
    if (!slugEdited && judulValue) {
      setValue('slug', slugify(judulValue))
    }
  }, [judulValue, setValue, slugEdited])

  // Reset form when data is loaded
  useEffect(() => {
    if (fetchedInovasi) {
      const images = fetchedInovasi.gambar || []
      setUploadedImages(images)

      reset({
        judul: fetchedInovasi.judul || '',
        slug: fetchedInovasi.slug || '',
        kategori: fetchedInovasi.kategori || '',
        deskripsi: fetchedInovasi.deskripsi || '',
        tahun: fetchedInovasi.tahun || new Date().getFullYear(),
        gambar: images,
        altText: fetchedInovasi.altText || '',
        linkProyek: fetchedInovasi.linkProyek || '',
        linkDanaDesa: fetchedInovasi.linkDanaDesa || '',
        instagram: fetchedInovasi.socialMedia?.instagram || '',
        youtube: fetchedInovasi.socialMedia?.youtube || '',
        tiktok: fetchedInovasi.socialMedia?.tiktok || '',
      })
    }
  }, [fetchedInovasi, reset])

  // Upload image
  const uploadImage = async (file: File): Promise<string> => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'inovasi')
      formData.append('quality', 'high')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to upload image')
      }

      const result = await response.json()
      toast.success('Gambar berhasil diupload!')
      return result.url
    } catch (error) {
      toast.error('Gagal mengupload gambar')
      console.error('Error uploading image:', error)
      throw error
    }
  }

  // Dropzone config
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return

      setUploading(true)
      try {
        const uploadPromises = acceptedFiles.map(file => uploadImage(file))
        const urls = await Promise.all(uploadPromises)
        const newImages = [...uploadedImages, ...urls]
        setUploadedImages(newImages)
        setValue('gambar', newImages, { shouldValidate: true })
      } catch (error) {
        console.error('Error uploading images:', error)
      } finally {
        setUploading(false)
      }
    },
    [uploadedImages, setValue]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: true,
    maxSize: 5 * 1024 * 1024,
  })

  // Remove image
  const removeImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index)
    setUploadedImages(newImages)
    setValue('gambar', newImages, { shouldValidate: true })
  }

  // Submit handler
  const onSubmit = async (data: InovasiFormValues) => {
    try {
      setLoading(true)

      const payload = {
        id,
        ...data,
        gambar: uploadedImages,
        socialMedia: {
          instagram: data.instagram || null,
          youtube: data.youtube || null,
          tiktok: data.tiktok || null,
        },
      }

      const response = await fetch(`/api/inovasi?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (response.status === 401) {
          toast.error('Sesi Anda telah berakhir. Silakan login kembali.')
          router.push('/login')
          return
        }
        throw new Error(errorData.error || 'Gagal mengupdate inovasi')
      }

      toast.success('Inovasi berhasil diperbarui!')
      router.push('/admin/inovasi')
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan saat menyimpan'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Inovasi</h1>
            <p className="text-gray-600">Memuat data...</p>
          </div>
        </div>
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
          <span className="ml-2 text-gray-600">Memuat data inovasi...</span>
        </div>
      </div>
    )
  }

  if (error || !fetchedInovasi) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Inovasi</h1>
            <p className="text-gray-600">Gagal memuat data</p>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg max-w-md mx-auto">
          <p className="font-medium">{error || 'Inovasi tidak ditemukan'}</p>
          <button
            onClick={() => router.back()}
            className="mt-2 text-sm bg-red-100 hover:bg-red-200 px-3 py-1 rounded transition"
          >
            Kembali
          </button>
        </div>
      </div>
    )
  }

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
          <h1 className="text-2xl font-bold text-gray-900">Edit Inovasi</h1>
          <p className="text-gray-600">Perbarui inovasi desa</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* INFORMASI DASAR */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Informasi Inovasi</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Judul *
              </label>
              <input
                {...register('judul')}
                type="text"
                placeholder="Contoh: Sistem Irigasi Digital"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.judul ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.judul && (
                <p className="text-red-500 text-xs mt-1">{errors.judul.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug *
              </label>
              <Controller
                name="slug"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    onChange={(e) => {
                      setSlugEdited(true)
                      field.onChange(e)
                    }}
                    placeholder="sistem-irigasi-digital"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.slug ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                )}
              />
              <p className="text-xs text-gray-500 mt-1">Bisa diedit manual, digunakan untuk URL</p>
              {errors.slug && (
                <p className="text-red-500 text-xs mt-1">{errors.slug.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategori *
              </label>
              <select
                {...register('kategori')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.kategori ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Pilih Kategori</option>
                {kategoriOptions.map(kategori => (
                  <option key={kategori} value={kategori.toLowerCase()}>
                    {kategori}
                  </option>
                ))}
              </select>
              {errors.kategori && (
                <p className="text-red-500 text-xs mt-1">{errors.kategori.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tahun *
              </label>
              <input
                {...register('tahun', { valueAsNumber: true })}
                type="number"
                min="2000"
                max={new Date().getFullYear() + 1}
                placeholder="2025"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.tahun ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.tahun && (
                <p className="text-red-500 text-xs mt-1">{errors.tahun.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* DESKRIPSI LENGKAP */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Deskripsi Inovasi</h2>
          <Controller
            name="deskripsi"
            control={control}
            render={({ field }) => (
              <CKEditorWrapper
                value={field.value?.toString() || ''}
                onChange={field.onChange}
                placeholder="Jelaskan inovasi secara lengkap..."
              />
            )}
          />
          {errors.deskripsi && (
            <p className="text-red-500 text-xs mt-1">{errors.deskripsi.message}</p>
          )}
        </div>

        {/* GAMBAR */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Gambar Inovasi</h2>

          <div
            {...getRootProps()}
            className={`mt-1 border-2 border-dashed rounded-lg px-3 py-4 flex flex-col items-center justify-center cursor-pointer transition 
                        ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50'}
                        ${uploading ? 'opacity-60 pointer-events-none' : ''}`}
          >
            <input {...getInputProps()} />
            {uploading ? (
              <span className="flex items-center gap-2 text-blue-600">
                <Loader2 className="animate-spin" size={18} /> Mengupload...
              </span>
            ) : (
              <div className="text-center">
                <Upload size={24} className="mx-auto mb-2 text-gray-400" />
                <span className="text-gray-400 block mb-2">
                  Klik atau drag file gambar di sini
                </span>
                <span className="text-xs text-gray-500">
                  Format: JPG, PNG, WebP (Maksimal 5MB per file, bisa multiple)
                </span>
              </div>
            )}
          </div>

          {uploadedImages.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              {uploadedImages.map((url, index) => (
                <div key={index} className="relative group">
                  <div className="relative w-full h-24">
                    <Image src={url} alt={`Preview ${index + 1}`} fill className="object-cover rounded border" />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <input {...register('gambar')} type="hidden" />
          {errors.gambar && (
            <p className="text-red-500 text-xs mt-2">{errors.gambar.message}</p>
          )}
        </div>

        {/* ALT TEXT DAN LINK */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Detail Tambahan</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Alt Text Gambar</label>
            <input
              {...register('altText')}
              placeholder="Deskripsi alternatif untuk aksesibilitas"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link Proyek (Opsional)</label>
              <div className="relative">
                <input
                  {...register('linkProyek')}
                  type="url"
                  placeholder="https://example.com/proyek  "
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.linkProyek ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <ExternalLink size={16} className="absolute right-3 top-3 text-gray-400" />
              </div>
              {errors.linkProyek && (
                <p className="text-red-500 text-xs mt-1">{errors.linkProyek.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link Dana Desa (Opsional)</label>
              <div className="relative">
                <input
                  {...register('linkDanaDesa')}
                  type="url"
                  placeholder="https://example.com/laporan-dana  "
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.linkDanaDesa ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <ExternalLink size={16} className="absolute right-3 top-3 text-gray-400" />
              </div>
              {errors.linkDanaDesa && (
                <p className="text-red-500 text-xs mt-1">{errors.linkDanaDesa.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* MEDIA SOSIAL */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Media Sosial</h2>
          <p className="text-sm text-gray-500 mb-4">Masukkan tautan profil media sosial terkait inovasi</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                Instagram
              </label>
              <input
                {...register('instagram')}
                type="url"
                placeholder="https://instagram.com/username  "
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.instagram ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.instagram && (
                <p className="text-red-500 text-xs mt-1">{errors.instagram.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                YouTube
              </label>
              <input
                {...register('youtube')}
                type="url"
                placeholder="https://youtube.com/@channel  "
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.youtube ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.youtube && (
                <p className="text-red-500 text-xs mt-1">{errors.youtube.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                TikTok
              </label>
              <input
                {...register('tiktok')}
                type="url"
                placeholder="https://tiktok.com/@username  "
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.tiktok ? 'border-red-500' : 'border-gray-300'
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
            disabled={loading || uploading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {(loading || uploading) ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save size={16} />
                Simpan Inovasi
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}