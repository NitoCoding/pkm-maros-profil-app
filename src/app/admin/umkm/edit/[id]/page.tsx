'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { ArrowLeft, Save, Loader2, Plus, X } from 'lucide-react'
import Link from 'next/link'
import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { toast } from 'react-hot-toast'
import Image from 'next/image'
import { IProdukUMKM } from '@/types/umkm'
import { useProdukUMKMById } from '@/hooks/useProdukUMKM'

// Schema sama dengan halaman tambah
const produkSchema = z.object({
  namaProduk: z.string().min(3, 'Nama produk wajib diisi'),
  namaUMKM: z.string().min(3, 'Nama UMKM wajib diisi'),
  kategori: z.string().min(2, 'Kategori wajib diisi'),
  deskripsi: z.string().min(10, 'Deskripsi minimal 10 karakter'),
  gambar: z.string().url('URL gambar tidak valid').optional().or(z.literal('')),
  harga: z.object({
    awal: z.string().min(1, 'Harga awal wajib diisi'),
    akhir: z.string().optional(),
  }),
  kontak: z.object({
    telepon: z.string().min(10, 'Nomor telepon minimal 10 digit'),
    whatsapp: z.string().min(10, 'Nomor WhatsApp minimal 10 digit'),
  }),
  lokasi: z.object({
    alamat: z.string().min(10, 'Alamat minimal 10 karakter'),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    googleMapsLink: z.string().url('Link Google Maps tidak valid').optional().or(z.literal('')),
  }),
  linkPenjualan: z.record(z.string(), z.string().url()).optional(),
});

type ProdukFormValues = z.infer<typeof produkSchema>

// Fungsi upload gambar
const uploadImage = async (file: File): Promise<string> => {
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', 'umkm')

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to upload image')
    }

    const result = await response.json()
    toast.success('Gambar berhasil diupload')
    return result.url
  } catch (error) {
    toast.error('Gagal mengupload gambar')
    console.error('Error uploading image:', error)
    throw error
  }
}

export default function EditProdukUmkmPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/admin/umkm'
  const id = params.id as string

  const { umkm, loading, error } = useProdukUMKMById(id)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProdukFormValues>({
    resolver: zodResolver(produkSchema),
    defaultValues: {
      namaProduk: '',
      namaUMKM: '',
      kategori: '',
      deskripsi: '',
      gambar: '',
      harga: { awal: '', akhir: '' },
      kontak: { telepon: '', whatsapp: '' },
      lokasi: { alamat: '', latitude: 0, longitude: 0, googleMapsLink: '' },
      linkPenjualan: {},
    },
  })

  // Reset form saat data dimuat
  useEffect(() => {
    if (umkm) {
      reset({
        namaProduk: umkm.namaProduk,
        namaUMKM: umkm.namaUMKM,
        kategori: umkm.kategori,
        deskripsi: umkm.deskripsi,
        gambar: umkm.gambar || '',
        harga: {
          awal: String(umkm.harga.awal),
          akhir: umkm.harga.akhir ? String(umkm.harga.akhir) : '',
        },
        kontak: {
          telepon: umkm.kontak.telepon,
          whatsapp: umkm.kontak.whatsapp,
        },
        lokasi: {
          alamat: umkm.lokasi.alamat,
          latitude: umkm.lokasi.latitude,
          longitude: umkm.lokasi.longitude,
          googleMapsLink: umkm.lokasi.googleMapsLink || '',
        },
        linkPenjualan: umkm.linkPenjualan || {},
      })
    }
  }, [umkm, reset])

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles[0]) return
      setUploading(true)
      try {
        const url = await uploadImage(acceptedFiles[0])
        setValue('gambar', url, { shouldValidate: true })
      } catch (error) {
        // Sudah ditangani di dalam fungsi upload
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

  const gambarUrl = watch('gambar')
  const linkPenjualanValues = watch('linkPenjualan')

  const onSubmit = async (data: ProdukFormValues) => {
    try {
      // console.log(data)
      setIsSubmitting(true)

      const payload = {
        id,
        ...data,
        harga: {
          awal: Number(data.harga.awal),
          akhir: data.harga.akhir ? Number(data.harga.akhir) : undefined,
        },
        lokasi: {
          ...data.lokasi,
          googleMapsLink: data.lokasi.googleMapsLink || undefined,
        },
      }

      const response = await fetch(`/api/produk-umkm?id=${id}`, {
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
        throw new Error(errorData.error || 'Gagal memperbarui produk')
      }

      toast.success('Produk berhasil diperbarui!')
      router.push(redirect)
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan saat memperbarui produk'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const addLinkField = (key: string) => {
    setValue(`linkPenjualan.${key}`, '')
  }

  const removeLinkField = (key: string) => {
    const currentLinks = { ...(linkPenjualanValues || {}) }
    delete currentLinks[key]
    setValue('linkPenjualan', currentLinks, { shouldValidate: true })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
        <span className="ml-2 text-gray-600">Memuat data produk...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 text-lg mb-4">{error}</p>
        <Link href="/admin/umkm" className="text-blue-600 hover:underline">
          Kembali ke daftar produk
        </Link>
      </div>
    )
  }

  if (!umkm) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Produk tidak ditemukan.</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Edit Produk UMKM</h1>
          <p className="text-gray-600">Perbarui informasi produk pelaku usaha desa</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Informasi Produk</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Produk *
              </label>
              <input
                {...register('namaProduk')}
                type="text"
                placeholder="Contoh: Keripik Pisang"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.namaProduk ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.namaProduk && (
                <p className="text-red-500 text-xs mt-1">{errors.namaProduk.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama UMKM *
              </label>
              <input
                {...register('namaUMKM')}
                type="text"
                placeholder="Contoh: Usaha Kreatif Desa"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.namaUMKM ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.namaUMKM && (
                <p className="text-red-500 text-xs mt-1">{errors.namaUMKM.message}</p>
              )}
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kategori *
            </label>
            <select
              {...register('kategori')}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.kategori ? 'border-red-500' : ''
              }`}
            >
              <option value="">Pilih kategori</option>
              <option value="Makanan">Makanan</option>
              <option value="Minuman">Minuman</option>
              <option value="Fashion">Fashion</option>
              <option value="Kerajinan">Kerajinan</option>
              <option value="Jasa">Jasa</option>
              <option value="Pertanian">Pertanian</option>
              <option value="Teknologi">Teknologi</option>
              <option value="Lainnya">Lainnya</option>
            </select>
            {errors.kategori && (
              <p className="text-red-500 text-xs mt-1">{errors.kategori.message}</p>
            )}
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deskripsi *
            </label>
            <textarea
              {...register('deskripsi')}
              rows={4}
              placeholder="Jelaskan produk Anda secara lengkap..."
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.deskripsi ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.deskripsi && (
              <p className="text-red-500 text-xs mt-1">{errors.deskripsi.message}</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Gambar Produk</h2>

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
            ) : gambarUrl ? (
              <div className="text-center">
                <div className="relative w-48 h-32 mx-auto mb-2">
                  <Image src={gambarUrl} alt="Preview Gambar" fill className="object-cover rounded border" />
                </div>
                <p className="text-sm text-green-600">✓ Gambar berhasil diupload</p>
              </div>
            ) : (
              <div className="text-center">
                <Plus size={24} className="mx-auto mb-2 text-gray-400" />
                <span className="text-gray-400 block mb-2">Klik atau drag file gambar di sini</span>
                <span className="text-xs text-gray-500">Format: JPG, PNG, WebP (Maksimal 5MB)</span>
              </div>
            )}
          </div>

          <input {...register('gambar')} type="hidden" />
          {errors.gambar && (
            <p className="text-red-500 text-xs mt-2">{errors.gambar.message}</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Harga Produk</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Harga Awal *
              </label>
              <input
                {...register('harga.awal')}
                type="number"
                min="0"
                placeholder="Contoh: 15000"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.harga?.awal ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.harga?.awal && (
                <p className="text-red-500 text-xs mt-1">{errors.harga.awal.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Harga Diskon (Opsional)
              </label>
              <input
                {...register('harga.akhir')}
                type="number"
                min="0"
                placeholder="Contoh: 12000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {errors.harga?.akhir && (
                <p className="text-red-500 text-xs mt-1">{errors.harga.akhir.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Kontak & Lokasi</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nomor Telepon *
              </label>
              <input
                {...register('kontak.telepon')}
                type="tel"
                placeholder="Contoh: 08123456789"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.kontak?.telepon ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.kontak?.telepon && (
                <p className="text-red-500 text-xs mt-1">{errors.kontak.telepon.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nomor WhatsApp *
              </label>
              <input
                {...register('kontak.whatsapp')}
                type="tel"
                placeholder="Contoh: 628123456789"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.kontak?.whatsapp ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.kontak?.whatsapp && (
                <p className="text-red-500 text-xs mt-1">{errors.kontak.whatsapp.message}</p>
              )}
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alamat Lengkap *
            </label>
            <textarea
              {...register('lokasi.alamat')}
              rows={3}
              placeholder="Alamat lengkap tempat usaha"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.lokasi?.alamat ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.lokasi?.alamat && (
              <p className="text-red-500 text-xs mt-1">{errors.lokasi.alamat.message}</p>
            )}
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Link Google Maps (Opsional)
            </label>
            <input
              {...register('lokasi.googleMapsLink')}
              type="url"
              placeholder="https://maps.google.com/...  "
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {errors.lokasi?.googleMapsLink && (
              <p className="text-red-500 text-xs mt-1">{errors.lokasi.googleMapsLink.message}</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Link Penjualan</h2>
          <p className="text-sm text-gray-500 mb-4">Tambahkan platform penjualan online Anda</p>

          <div className="space-y-3">
            {Object.entries(linkPenjualanValues || {}).map(([platform, url]) => (
              <div key={platform} className="flex items-center gap-2">
                <input
                  {...register(`linkPenjualan.${platform}`)}
                  type="url"
                  placeholder={`Link ${platform.charAt(0).toUpperCase() + platform.slice(1)}`}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => removeLinkField(platform)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <X size={16} />
                </button>
              </div>
            ))}

            <div className="flex flex-wrap gap-2 pt-2">
              {!linkPenjualanValues?.shopee && (
                <button
                  type="button"
                  onClick={() => addLinkField('shopee')}
                  className="text-sm bg-orange-100 text-orange-700 px-3 py-1 rounded-lg hover:bg-orange-200 transition"
                >
                  + Shopee
                </button>
              )}
              {!linkPenjualanValues?.tokopedia && (
                <button
                  type="button"
                  onClick={() => addLinkField('tokopedia')}
                  className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-lg hover:bg-green-200 transition"
                >
                  + Tokopedia
                </button>
              )}
              {!linkPenjualanValues?.website && (
                <button
                  type="button"
                  onClick={() => addLinkField('website')}
                  className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-200 transition"
                >
                  + Website
                </button>
              )}
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
            disabled={isSubmitting || uploading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {(isSubmitting || uploading) ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {isSubmitting ? 'Menyimpan...' : 'Mengupload...'}
              </>
            ) : (
              <>
                <Save size={16} />
                Simpan Perubahan
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}