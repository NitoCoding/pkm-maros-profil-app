'use client'

import { useState, useCallback, useEffect, use } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Save, Loader2, Upload } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useDropzone } from 'react-dropzone'
import Image from 'next/image'
import { IGaleri } from '@/types/galeri'

// --- Zod Schema ---
const galeriSchema = z.object({
  caption: z.string().min(3, 'Caption wajib diisi'),
  alt: z.string().nullable().optional(),
  src: z.string().url('URL gambar tidak valid'),
  tanggal: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
})

type GaleriFormValues = z.infer<typeof galeriSchema>
// --- End Schema ---

export default function EditGaleriPage() {
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [fetchingData, setFetchingData] = useState(true)

  const resolvedParams = useParams()
  const galeriId = resolvedParams.id

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<GaleriFormValues>({
    resolver: zodResolver(galeriSchema),
    defaultValues: {
      caption: '',
      alt: null,
      src: '',
      tanggal: null,
      tags: [],
    },
  })

  const src = watch('src')
  const tags = watch('tags') || []

  // Fetch data galeri berdasarkan ID
  useEffect(() => {
    const fetchGaleriData = async () => {
      try {
        setFetchingData(true)

        const response = await fetch(`/api/galeri?id=${galeriId}`)
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Gagal memuat data galeri')
        }

        const data: IGaleri = result.data

        // Reset form dengan data
        reset({
          caption: data.caption || '',
          alt: data.alt || null,
          src: data.src,
          tanggal: data.tanggal || null,
          tags: Array.isArray(data.tags) ? data.tags : [],
        })
      } catch (error: any) {
        if (
          !['NO_TOKEN', 'TOKEN_REFRESH_FAILED', 'TOKEN_STILL_INVALID'].includes(error.message)
        ) {
          toast.error(error.message || 'Gagal memuat data galeri')
        }
        router.push('/admin/galeri')
      } finally {
        setFetchingData(false)
      }
    }

    if (galeriId) {
      fetchGaleriData()
    }
  }, [galeriId, reset, router])

  // Upload image to Cloudinary
  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', 'galeri')

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
        setValue('src', url, { shouldValidate: true })
      } catch (error) {
        // Biarkan preview tetap jika gagal
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
    maxSize: 5 * 1024 * 1024,
  })

  // Tambah tag saat koma atau enter
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
    setValue('tags', tags.filter(tag => tag !== tagToRemove), { shouldValidate: true })
  }

  // Submit handler
  const onSubmit = async ( data: GaleriFormValues) => {
    try {
      const payload = {
        id: galeriId,
        ...data,
      }

      const response = await fetch('/api/galeri', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Gagal mengupdate galeri')
      }

      toast.success('Galeri berhasil diperbarui!')
      router.push('/admin/galeri')
    } catch (error: any) {
      if (
        !['NO_TOKEN', 'TOKEN_REFRESH_FAILED', 'TOKEN_STILL_INVALID'].includes(error.message)
      ) {
        toast.error(error.message || 'Terjadi kesalahan saat menyimpan')
      }
    }
  }

  // Loading state
  if (fetchingData) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Galeri</h1>
            <p className="text-gray-600">Memuat data...</p>
          </div>
        </div>
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
          <span className="ml-2 text-gray-600">Memuat data galeri...</span>
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
          <h1 className="text-2xl font-bold text-gray-900">Edit Galeri</h1>
          <p className="text-gray-600">Perbarui foto dokumentasi desa</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Informasi Gambar</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Caption *
              </label>
              <input
                {...register('caption')}
                type="text"
                placeholder="Deskripsi kegiatan"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.caption ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.caption && (
                <p className="text-red-500 text-xs mt-1">{errors.caption.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alt Text
              </label>
              <input
                {...register('alt')}
                type="text"
                placeholder="Teks alternatif untuk aksesibilitas"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Upload Gambar</h2>

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
            ) : src ? (
              <div className="text-center">
                <div className="relative w-48 h-32 mx-auto mb-2">
                  <Image
                    src={src}
                    alt="Preview Gambar"
                    fill
                    className="object-cover rounded border"
                  />
                </div>
                <p className="text-sm text-green-600">✓ Gambar siap</p>
                <p className="text-xs text-gray-500 mt-1">
                  Klik atau drag file baru untuk mengganti
                </p>
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

          <input {...register('src')} type="hidden" />
          {errors.src && (
            <p className="text-red-500 text-xs mt-2">{errors.src.message}</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Tags</h2>

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
              placeholder="kegiatan, dokumentasi, kelurahan"
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
                  className="text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Metadata</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal
              </label>
              <input
                {...register('tanggal')}
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

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
                Menyimpan...
              </>
            ) : (
              <>
                <Save size={16} />
                Update Galeri
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}