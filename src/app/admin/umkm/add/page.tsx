'use client'

import { useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Save, Loader2, MapPin, ExternalLink, Plus, X } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useDropzone } from 'react-dropzone'
import Image from 'next/image'

// --- Zod Schema (DIPERBAIKI) ---
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
})


type ProdukFormValues = z.infer<typeof produkSchema>

// --- End Schema ---


export default function TambahProdukUmkmPage() {
  const router = useRouter()
  const redirect = '/admin/umkm'

  const [uploading, setUploading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProdukFormValues>({
    resolver: zodResolver(produkSchema),
    // PERBAIKAN: Pastikan nilai default adalah tipe number
    defaultValues: {
      namaProduk: '',
      namaUMKM: '',
      kategori: '',
      deskripsi: '',
      gambar: '',
      harga: { awal: '', akhir: '' },
      kontak: { telepon: '', whatsapp: '' },
      lokasi: {
        alamat: '',
        latitude: 0, // Nilai default bertipe number
        longitude: 0, // Nilai default bertipe number
        googleMapsLink: '',
      },
      linkPenjualan: {},
    }
  })

  const gambar = watch('gambar')
  const linkPenjualan = watch('linkPenjualan')

  // Upload image to Cloudinary
  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', 'umkm')

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
        // Sudah dihandle
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

  // Tambah link penjualan
  const addLinkField = (platform: string) => {
    setValue(`linkPenjualan.${platform}`, '', { shouldValidate: true })
  }

  // Hapus link penjualan
  const removeLinkField = (key: string) => {
    const currentLinks = linkPenjualan || {};
    const newLinks = { ...currentLinks };
    delete newLinks[key];
    setValue('linkPenjualan', newLinks, { shouldValidate: true });
  }

  // Submit handler
  const onSubmit = async (data: ProdukFormValues) => {
    try {
      const payload = {
        ...data,
        harga: {
          awal: parseInt(data.harga.awal),
          akhir: data.harga.akhir ? parseInt(data.harga.akhir) : undefined,
        },
        lokasi: {
          ...data.lokasi,
          googleMapsLink: data.lokasi.googleMapsLink || undefined,
        },
      }

      const response = await fetch('/api/produk-umkm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Gagal menyimpan produk')
      }

      toast.success('Produk berhasil ditambahkan!')
      router.push(redirect)
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
          <h1 className="text-2xl font-bold text-gray-900">Tambah Produk UMKM Baru</h1>
          <p className="text-gray-600">Daftarkan produk dari pelaku usaha desa</p>
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
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.namaProduk ? 'border-red-500' : 'border-gray-300'
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
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.namaUMKM ? 'border-red-500' : 'border-gray-300'
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
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.kategori ? 'border-red-500' : ''
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
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.deskripsi ? 'border-red-500' : 'border-gray-300'
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
                <Plus size={24} className="mx-auto mb-2 text-gray-400" />
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
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.harga?.awal ? 'border-red-500' : 'border-gray-300'
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
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.kontak?.telepon ? 'border-red-500' : 'border-gray-300'
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
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.kontak?.whatsapp ? 'border-red-500' : 'border-gray-300'
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
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.lokasi?.alamat ? 'border-red-500' : 'border-gray-300'
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
              placeholder="https://maps.google.com/..."
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
            {Object.entries(linkPenjualan || {}).map(([platform, url]) => (
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
              {!linkPenjualan?.shopee && (
                <button
                  type="button"
                  onClick={() => addLinkField('shopee')}
                  className="text-sm bg-orange-100 text-orange-700 px-3 py-1 rounded-lg hover:bg-orange-200 transition"
                >
                  + Shopee
                </button>
              )}
              {!linkPenjualan?.tokopedia && (
                <button
                  type="button"
                  onClick={() => addLinkField('tokopedia')}
                  className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-lg hover:bg-green-200 transition"
                >
                  + Tokopedia
                </button>
              )}
              {!linkPenjualan?.website && (
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
                Simpan Produk
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}