'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Loader2, Upload } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useDropzone } from 'react-dropzone'
import Image from 'next/image'
import CKEditorWrapper from '@/components/ckeditor/CKEditorWrapper'
import { beritaKategori } from '@/libs/constant/beritaKategori'

// --- Zod Schema ---
const beritaSchema = z.object({
  judul: z.string().min(1, 'Judul harus diisi'),
  slug: z.string().min(1, 'Slug harus diisi'),
  ringkasan: z.string().min(1, 'Ringkasan harus diisi'),
  isi: z.string().min(1, 'Isi berita harus diisi'),
  gambar: z.string().url('Gambar harus berupa URL').optional(),
  status: z.enum(['draft', 'published']),
  tags: z.array(z.string()).optional(),
  kategori: z.string().min(1, 'Kategori harus dipilih'),
  tanggal: z.string().refine(val => !isNaN(Date.parse(val)), { message: "Tanggal tidak valid" }), // Validasi format tanggal
})

type BeritaFormValues = z.infer<typeof beritaSchema>

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .trim()
}


export default function TambahBeritaPage() {
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const [slugEdited, setSlugEdited] = useState(false)
  const [tagInput, setTagInput] = useState('')

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BeritaFormValues>({
    resolver: zodResolver(beritaSchema),
    defaultValues: {
      judul: '',
      slug: '',
      ringkasan: '',
      kategori: '',
      isi: '',
      gambar: '',
      status: 'draft',
      tags: [],
      tanggal: new Date().toISOString().split('T')[0], // Format YYYY-MM-DD
    },
  })

  const judul = watch('judul')
  const status = watch('status') // Ekstrak ke variabel terpisah
  const tags = watch('tags') || []
  const gambar = watch('gambar')

  // Auto-generate slug dari judul
  useEffect(() => {
    if (judul && !slugEdited) {
      const newSlug = slugify(judul)
      if (newSlug !== watch('slug')) {
        setValue('slug', newSlug, { shouldValidate: true })
      }
    }
  }, [judul, slugEdited, setValue, watch])

  // Set tanggal saat status berubah ke published
  useEffect(() => {
    if (status === 'published' && !slugEdited) {
      const today = new Date().toISOString().split('T')[0]
      setValue('tanggal', today)
    }
  }, [status, slugEdited, setValue])

  // Upload image ke Cloudinary atau server
  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', 'berita')
    formData.append('quality', 'high')

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || 'Upload gagal')
    }

    const result = await res.json()
    toast.success('Gambar berhasil diupload!')
    return result.url
  }

  // Dropzone config
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles[0]) return
      setUploading(true)

      try {
        const url = await uploadImage(acceptedFiles[0])
        setValue('gambar', url, { shouldValidate: true })
      } catch (error) {
        toast.error('Gagal mengunggah gambar.')
      } finally {
        setUploading(false)
      }
    },
    [setValue]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
    maxSize: 5 * 1024 * 1024, // 5MB
  })

  // Tambah tag saat tekan Enter atau koma
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ',' || e.key === 'Enter') {
      e.preventDefault()
      const value = tagInput.trim().replace(/,+$/, '')
      if (value && !tags.includes(value)) {
        setValue('tags', [...tags, value], { shouldValidate: true })
        setTagInput('')
      }
    }
  }

  // Hapus tag
  const removeTag = (tagToRemove: string) => {
    setValue('tags', tags.filter((tag) => tag !== tagToRemove), { shouldValidate: true })
  }

  // Submit handler
  const onSubmit = async (data: BeritaFormValues) => {
    try {
      const payload = { ...data }

      const response = await fetch('/api/berita', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (response.status === 401) {
          toast.error('Sesi Anda telah berakhir. Silakan login ulang.')
          router.push('/login')
          return
        }
        throw new Error(errorData.error || 'Gagal menyimpan berita')
      }

      toast.success('Berita berhasil ditambahkan!')
      router.push('/admin/berita')
    } catch (error: any) {
      toast.error(error.message || 'Terjadi kesalahan saat menyimpan')
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Tambah Berita Baru</h1>
          <p className="text-gray-600">Tulis dan publikasikan berita desa secara profesional</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* INFORMASI DASAR */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Informasi Dasar</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Judul Berita *
              </label>
              <input
                {...register('judul')}
                type="text"
                placeholder="Contoh: Pelatihan Pertanian Organik"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.judul ? 'border-red-500' : 'border-gray-300'
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
              <input
                {...register('slug')}
                type="text"
                onChange={(e) => {
                  setSlugEdited(true)
                  setValue('slug', e.target.value, { shouldValidate: true })
                }}
                placeholder="pelatihan-pertanian-organik"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.slug ? 'border-red-500' : 'border-gray-300'
                  }`}
              />
              <p className="text-xs text-gray-500 mt-1">
                Digunakan untuk URL: <code className="bg-gray-100 px-1 rounded">/berita/{watch('slug')}</code>
              </p>
              {errors.slug && (
                <p className="text-red-500 text-xs mt-1">{errors.slug.message}</p>
              )}
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ringkasan Berita *
            </label>
            <textarea
              {...register('ringkasan')}
              rows={3}
              placeholder="Tuliskan ringkasan singkat tentang berita ini..."
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.ringkasan ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {errors.ringkasan && (
              <p className="text-red-500 text-xs mt-1">{errors.ringkasan.message}</p>
            )}
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kategori *
            </label>
            <select
              {...register('kategori')}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.kategori ? 'border-red-500' : ''
                }`}
            >
              <option value="">Pilih Kategori</option>
              {beritaKategori.map((kategori) => (
                <option key={kategori} value={kategori}>
                  {kategori}
                </option>
              ))}
            </select>
            {errors.kategori && (
              <p className="text-red-500 text-xs mt-1">{errors.kategori.message}</p>
            )}
          </div>
        </div>

        {/* ISI BERITA */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Isi Berita</h2>
          <Controller
            name="isi"
            control={control}
            render={({ field }) => (
              <CKEditorWrapper
                value={field.value?.trim() || ''}
                onChange={field.onChange}
                placeholder="Tulis isi berita lengkap di sini..."
              />
            )}
          />
          {errors.isi && (
            <p className="text-red-500 text-xs mt-2">{errors.isi.message}</p>
          )}
        </div>

        {/* GAMBAR UTAMA */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Gambar Utama</h2>

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
            ) : gambar ? (
              <div className="text-center">
                <div className="relative w-48 h-32 mx-auto mb-2">
                  <Image
                    src={gambar}
                    alt="Preview Gambar"
                    fill
                    className="object-cover rounded border"
                  />
                </div>
                <p className="text-sm text-green-600">✓ Gambar berhasil diupload</p>
              </div>
            ) : (
              <div className="text-center">
                <Upload size={24} className="mx-auto mb-2 text-gray-400" />
                <span className="text-gray-400 block mb-2">
                  Klik atau drag file gambar di sini
                </span>
                <span className="text-xs text-gray-500">
                  Format: JPG, PNG, WebP (Maksimal 5MB)
                </span>
              </div>
            )}
          </div>

          <input {...register('gambar')} type="hidden" />
          {errors.gambar && (
            <p className="text-red-500 text-xs mt-2">{errors.gambar.message}</p>
          )}
        </div>

        {/* TAGS */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Tags</h2>
          <p className="text-sm text-gray-500 mb-3">Tambahkan topik yang relevan</p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags{' '}
              <span className="text-xs text-gray-500">(pisahkan dengan koma atau enter)</span>
            </label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="alam, keluarga, pendidikan"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Display tags */}
          <div className="flex flex-wrap gap-2 mt-3">
            {tags.map((tag, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="text-blue-600 hover:text-blue-800 font-bold"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* METADATA */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Metadata</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status Publikasi
              </label>
              <select
                {...register('status')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">Draft (Belum Dipublikasikan)</option>
                <option value="published">Published (Langsung Publikasi)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Berita *
              </label>
              <input
                type="date"
                {...register('tanggal')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.tanggal ? 'border-red-500' : 'border-gray-300'
                  }`}
              />
              {errors.tanggal && (
                <p className="text-red-500 text-xs mt-1">{errors.tanggal.message}</p>
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
                Simpan Berita
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}