'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Loader2, Upload } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useDropzone } from 'react-dropzone'
import Image from 'next/image'

// --- Zod Schema ---
const galeriSchema = z.object({
  caption: z.string().min(3, 'Caption wajib diisi'),
  alt: z.string().optional(),
  src: z.string().url('URL gambar tidak valid'),
  tanggal: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

type GaleriFormValues = z.infer<typeof galeriSchema>
// --- End Schema ---

export default function TambahGaleriPage() {
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<GaleriFormValues>({
    resolver: zodResolver(galeriSchema),
    defaultValues: {
      caption: '',
      alt: '',
      src: '',
      tanggal: new Date().toISOString().split('T')[0],
      tags: [],
    },
  })

  const src = watch('src')
  const tags = watch('tags') || []

  // Upload image to Cloudinary
  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', 'galeri')
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
      setPreviewUrl(URL.createObjectURL(acceptedFiles[0]))

      try {
        const url = await uploadImage(acceptedFiles[0])
        setValue('src', url, { shouldValidate: true })
        toast.success('Gambar berhasil diupload')
      } catch (error) {
        setPreviewUrl(null)
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
    maxSize: 10 * 1024 * 1024,
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
        ...data,
        alt: data.alt || data.caption || 'Gambar galeri', // fallback
        tanggal: data.tanggal || new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
      }

      const response = await fetch('/api/galeri', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Gagal menyimpan galeri')
      }

      toast.success('Galeri berhasil ditambahkan!')
      router.push('/admin/galeri')
    } catch (error: any) {
      if (
        !['NO_TOKEN', 'TOKEN_REFRESH_FAILED', 'TOKEN_STILL_INVALID'].includes(error.message)
      ) {
        toast.error(error.message || 'Terjadi kesalahan saat menyimpan')
      }
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
          <h1 className="text-2xl font-bold text-gray-900">Tambah Galeri Baru</h1>
          <p className="text-gray-600">Unggah foto untuk dokumentasi desa</p>
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
                <p className="text-sm text-green-600">✓ Gambar berhasil diupload</p>
              </div>
            ) : (
              <div className="text-center">
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
                Simpan Galeri
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}