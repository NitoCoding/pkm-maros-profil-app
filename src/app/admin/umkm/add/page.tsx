// src/app/admin/umkm/add/page.tsx
'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Loader2, MapPin, ExternalLink, Plus, X } from 'lucide-react'
import Link from 'next/link'
import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { toast } from 'react-hot-toast'
import Image from 'next/image'

// --- PERBAIKAN: Schema baru untuk produk ---
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
    latitude: z.number(),
    longitude: z.number(),
    googleMapsLink: z.string().url('Link Google Maps tidak valid').optional().or(z.literal('')),
  }),
  // --- TAMBAHAN: Link penjualan ---
  linkPenjualan: z.record(z.string(),z.string().url()).optional(),
});

type ProdukFormValues = z.infer<typeof produkSchema>;

// Upload image to Cloudinary
const uploadImage = async (file: File): Promise<string> => {
  // ... (fungsi uploadImage Anda tetap sama)
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
    return result.url
  } catch (error) {
    toast.error('Gagal mengupload gambar')
    console.error('Error uploading image:', error)
    throw error
  }
}

export default function TambahProdukUmkmPage() {
  const router = useRouter()
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/admin/umkm';
  
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
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
      lokasi: {
        alamat: '',
        latitude: 0,
        longitude: 0,
        googleMapsLink: '',
      },
      linkPenjualan: {},
    },
  });

  // Dropzone config
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles[0]) return
      setUploading(true)
      try {
        const url = await uploadImage(acceptedFiles[0])
        setValue('gambar', url, { shouldValidate: true })
        toast.success('Gambar berhasil diupload')
      } catch (error) {
        // Error already handled in uploadImage function
      } finally {
        setUploading(false)
      }
    },
    [setValue],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
    maxSize: 5 * 1024 * 1024,
  });

  const gambarUrl = watch('gambar');
  const linkPenjualanValues = watch('linkPenjualan');

  // --- PERBAIKAN: onSubmit yang bersih ---
  const onSubmit = async (data: ProdukFormValues) => {
    try {
      setLoading(true)
      
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
      };

      // --- Hapus makeAuthenticatedRequest ---
      const response = await fetch('/api/produk-umkm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          toast.error('Sesi Anda telah berakhir. Silakan login kembali.');
          router.push('/login');
          return;
        }
        throw new Error(errorData.error || 'Gagal menyimpan produk');
      }

      toast.success('Produk berhasil ditambahkan!');
      router.push(redirect);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan saat menyimpan produk';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // --- TAMBAHAN: Fungsi untuk menambah link penjualan ---
  const addLinkField = (key: string) => {
    setValue(`linkPenjualan.${key}`, '');
  };

  const removeLinkField = (key: string) => {
    setValue(`linkPenjualan.${key}` as any, '' as any);
  };

  return (
    <div className='mx-auto py-8 px-6 max-w-4xl'>
      <h1 className='text-2xl font-bold mb-6'>Tambah Produk UMKM Baru</h1>
      <form onSubmit={handleSubmit(onSubmit)} className='bg-white rounded-xl border border-gray-200 shadow px-6 py-8 space-y-5'>
        <div className='flex items-center mb-8'>
          <Link
            href='/admin/umkm'
            className='flex items-center text-gray-600 hover:text-gray-900 mb-4'
          >
            <ArrowLeft size={18} />
            Kembali
          </Link>
        </div>

        {/* --- PERBAIKAN: Field Nama Produk dan Nama UMKM --- */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label className='font-medium'>Nama Produk</label>
            <input {...register('namaProduk')} className={`border w-full px-3 py-2 rounded mt-1 ${errors.namaProduk && 'border-red-500'}`} placeholder='Nama produk' />
            {errors.namaProduk && <div className='text-red-600 text-sm'>{errors.namaProduk.message}</div>}
          </div>
          <div>
            <label className='font-medium'>Nama UMKM</label>
            <input {...register('namaUMKM')} className={`border w-full px-3 py-2 rounded mt-1 ${errors.namaUMKM && 'border-red-500'}`} placeholder='Nama usaha' />
            {errors.namaUMKM && <div className='text-red-600 text-sm'>{errors.namaUMKM.message}</div>}
          </div>
        </div>

        {/* --- Field Kategori dan Deskripsi tetap --- */}
        <div>
          <label className='font-medium'>Kategori</label>
          <select {...register('kategori')} className={`border w-full px-3 py-2 rounded mt-1 ${errors.kategori && 'border-red-500'}`}>
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
          {errors.kategori && <div className='text-red-600 text-sm'>{errors.kategori.message}</div>}
        </div>
        
        <div>
          <label className='font-medium'>Deskripsi</label>
          <textarea {...register('deskripsi')} rows={4} className={`border w-full px-3 py-2 rounded mt-1 ${errors.deskripsi && 'border-red-500'}`} placeholder='Deskripsi lengkap tentang produk' />
          {errors.deskripsi && <div className='text-red-600 text-sm'>{errors.deskripsi.message}</div>}
        </div>

        {/* --- Field Gambar tetap --- */}
        <div>
          <label className='font-medium'>Gambar Produk</label>
          <div {...getRootProps()} className={`mt-1 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'} ${uploading ? 'opacity-60 pointer-events-none' : ''}`}>
            <input {...getInputProps()} />
            {uploading ? (
              <span className='flex items-center gap-2 text-blue-600'><Loader2 className='animate-spin' size={18} /> Mengupload...</span>
            ) : gambarUrl ? (
              <Image src={gambarUrl} alt='Preview' width={160} height={128} className='w-40 h-32 object-cover rounded mb-2 border mx-auto' />
            ) : (
              <div className='text-center'>
                <span className='text-gray-400 block mb-2'>Klik atau drag file gambar di sini</span>
                <span className='text-xs text-gray-500'>Format: JPG, PNG, WebP (Maksimal 5MB)</span>
              </div>
            )}
          </div>
          <input {...register('gambar')} type='hidden' />
          {errors.gambar && <div className='text-red-600 text-sm'>{errors.gambar.message}</div>}
        </div>

        {/* --- PERBAIKAN: Field Harga --- */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label className='font-medium'>Harga Awal</label>
            <input {...register('harga.awal')} type='number' min='0' className={`border w-full px-3 py-2 rounded mt-1 ${errors.harga?.awal && 'border-red-500'}`} placeholder='100000' />
            {errors.harga?.awal && <div className='text-red-600 text-sm'>{errors.harga.awal.message}</div>}
          </div>
          <div>
            <label className='font-medium'>Harga Akhir (Opsional)</label>
            <input {...register('harga.akhir')} type='number' min='0' className={`border w-full px-3 py-2 rounded mt-1 ${errors.harga?.akhir && 'border-red-500'}`} placeholder='500000' />
            {errors.harga?.akhir && <div className='text-red-600 text-sm'>{errors.harga.akhir.message}</div>}
          </div>
        </div>

        {/* --- PERBAIKAN: Field Kontak --- */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label className='font-medium'>Nomor Telepon</label>
            <input {...register('kontak.telepon')} type='tel' className={`border w-full px-3 py-2 rounded mt-1 ${errors.kontak?.telepon && 'border-red-500'}`} placeholder='08123456789' />
            {errors.kontak?.telepon && <div className='text-red-600 text-sm'>{errors.kontak.telepon.message}</div>}
          </div>
          <div>
            <label className='font-medium'>Nomor WhatsApp</label>
            <input {...register('kontak.whatsapp')} type='tel' className={`border w-full px-3 py-2 rounded mt-1 ${errors.kontak?.whatsapp && 'border-red-500'}`} placeholder='628123456789' />
            {errors.kontak?.whatsapp && <div className='text-red-600 text-sm'>{errors.kontak.whatsapp.message}</div>}
          </div>
        </div>

        {/* --- Field Lokasi tetap --- */}
        <div>
          <label className='font-medium'>Alamat</label>
          <textarea {...register('lokasi.alamat')} rows={3} className={`border w-full px-3 py-2 rounded mt-1 ${errors.lokasi?.alamat && 'border-red-500'}`} placeholder='Alamat lengkap UMKM' />
          {errors.lokasi?.alamat && <div className='text-red-600 text-sm'>{errors.lokasi?.alamat.message}</div>}
        </div>

        {/* --- TAMBAHAN: Field Link Penjualan --- */}
        <div>
          <label className='font-medium'>Link Penjualan</label>
          <div className="space-y-2">
            {Object.entries(linkPenjualanValues || {}).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <input
                  {...register(`linkPenjualan.${key}`)}
                  type="url"
                  className="flex-1 border px-3 py-2 rounded"
                  placeholder={`Link ${key}`}
                />
                <button type="button" onClick={() => removeLinkField(key)}>
                  <X size={18} className="text-red-500" />
                </button>
              </div>
            ))}
            <div className="flex gap-2">
              <button type="button" onClick={() => addLinkField('shopee')} className="text-sm bg-orange-100 text-orange-700 px-3 py-1 rounded hover:bg-orange-200">
                + Tambah Shopee
              </button>
              <button type="button" onClick={() => addLinkField('tokopedia')} className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200">
                + Tambah Tokopedia
              </button>
              <button type="button" onClick={() => addLinkField('website')} className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200">
                + Tambah Website
              </button>
            </div>
          </div>
        </div>

        {/* --- Submit Button --- */}
        <div className='pt-3 flex justify-end'>
          <button type='submit' disabled={loading || uploading} className='bg-blue-600 text-white px-6 py-2 rounded font-semibold flex items-center gap-2 hover:bg-blue-700 transition disabled:opacity-60'>
            {(loading || uploading) && <Loader2 size={18} className='animate-spin' />}
            {loading ? 'Menyimpan...' : uploading ? 'Mengupload...' : 'Simpan Produk'}
          </button>
        </div>
      </form>
    </div>
  )
}