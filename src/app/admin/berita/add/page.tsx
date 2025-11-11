// src/app/admin/berita/add/page.tsx (atau path yang sesuai)
'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Upload } from 'lucide-react'
import Link from 'next/link'
import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import CKEditorWrapper from '@/components/ckeditor/CKEditorWrapper'
import { toast } from 'react-hot-toast'
import Image from 'next/image'
import { logout } from '@/libs/auth/token'

// Schema yang diperbaiki
const beritaSchema = z.object({
  judul: z.string().min(1, 'Judul harus diisi'),
  slug: z.string().min(1, 'Slug harus diisi'),
  ringkasan: z.string().min(1, 'Ringkasan harus diisi'),
  isi: z.string().min(1, 'Isi berita harus diisi'),
  gambar: z.string().optional(),
  status: z.enum(['draft', 'published']),
  tags: z.string().optional(),
});

type BeritaFormValues = z.infer<typeof beritaSchema>;

// Slugify utility
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
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

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
      isi: '',
      gambar: '',
      status: 'draft',
      tags: '',
    },
  })

  const judulValue = watch('judul')
  const [slugEdited, setSlugEdited] = useState(false)

  useEffect(() => {
    if (!slugEdited) {
      setValue('slug', slugify(judulValue || ''))
    }
  }, [judulValue, setValue, slugEdited])

  // Dropzone config
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles[0]) return
      setUploading(true)
      const url = await uploadImage(acceptedFiles[0])
      setValue('gambar', url, { shouldValidate: true })
      setUploading(false)
    },
    [setValue],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
    maxSize: 5 * 1024 * 1024,
  })

  const gambarUrl = watch('gambar')

  // --- PERBAIKAN UTAMA: onSubmit yang bersih dari token ---
  const onSubmit = async (data: BeritaFormValues) => {
    try {
      setLoading(true)

      const tagsArray = data.tags?.split(',').map(tag => tag.trim()).filter(Boolean) ?? []

      const payload = {
        ...data,
        tags: tagsArray,
        // Tidak perlu lagi mengirim createdAt, createdBy, dll.
        // Middleware dan API akan menanganinya.
      }

      // --- Hapus Authorization header ---
      const response = await fetch('/api/berita', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      console.log('Full response:', response)

      if (!response.ok) {
        const errorData = await response.json()
        console.log('Response status:', response.status)
        console.log('Error data:', errorData)
        const token = localStorage.getItem('authToken')
        console.log('Current token:', token)
        // Jika token tidak valid, middleware akan redirect ke login.
        // Kita bisa menangkapnya dengan cek error-nya.
        if (response.status === 401) {
          toast.error('Sesi Anda telah berakhir. Silakan login kembali.');
          // Redirect ke login bisa dilakukan otomatis oleh middleware,
          // tapi kita bisa memaksanya untuk jaga-jaga.
          //   router.push('/login');
          // await logout()
          return;
        }
        throw new Error(errorData.error || 'Gagal menyimpan berita')
      }

      toast.success('Berita berhasil ditambahkan!')
      router.push('/admin/berita')
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan saat menyimpan berita'
      toast.error(errorMessage)
      console.error('Error saving berita:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fungsi upload gambar tetap sama
  const uploadImage = async (file: File): Promise<string> => {
    // ... (kode uploadImage Anda tidak berubah)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'berita')
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
      toast.success('Gambar berhasil diupload dengan kualitas HD!')
      return result.url
    } catch (error) {
      toast.error('Gagal mengupload gambar')
      console.error('Error uploading image:', error)
      throw error
    }
  }

  return (
    <div className='mx-auto py-8 px-6'>
      <h1 className='text-2xl font-bold mb-6'>Tambah Berita Baru</h1>
      <form onSubmit={handleSubmit(onSubmit)} className='bg-white rounded-xl border border-gray-200 shadow px-6 py-8 space-y-5'>
        {/* ... semua bagian form sebelum grid tetap sama ... */}
        <div className='flex items-center mb-8'>
          <Link
            href='/admin/berita'
            className='flex items-center text-gray-600 hover:text-gray-900 mb-4'
          >
            <ArrowLeft size={18} />
            Kembali
          </Link>
        </div>
        <div>
          <label className='font-medium'>Judul</label>
          <input {...register('judul')} className={`border w-full px-3 py-2 rounded mt-1 ${errors.judul && 'border-red-500'}`} placeholder='Judul berita' />
          {errors.judul && <div className='text-red-600 text-sm'>{errors.judul.message}</div>}
        </div>
        {/* ... field slug, ringkasan, isi, gambar tetap sama ... */}
        <div>
          <label className='font-medium'>Slug</label>
          <Controller name='slug' control={control} render={({ field }) => (
            <input {...field} onChange={e => { setSlugEdited(true); field.onChange(e) }} className={`border w-full px-3 py-2 rounded mt-1 ${errors.slug && 'border-red-500'}`} placeholder='slug-berita' />
          )} />
          <div className='text-xs text-gray-400 mt-1'>Slug otomatis dari judul, bisa diubah manual</div>
          {errors.slug && <div className='text-red-600 text-sm'>{errors.slug.message}</div>}
        </div>
        <div>
          <label className='font-medium mb-1 block'>Ringkasan Berita</label>
          <Controller name='ringkasan' control={control} render={({ field }) => (
            <CKEditorWrapper value={field.value} onChange={field.onChange} placeholder='Ringkasan berita...' />
          )} />
          {errors.ringkasan && <div className='text-red-600 text-sm'>{errors.ringkasan.message}</div>}
        </div>
        <div>
          <label className='font-medium mb-1 block'>Isi Berita</label>
          <Controller name='isi' control={control} render={({ field }) => (
            <CKEditorWrapper value={field.value} onChange={field.onChange} placeholder='Isi berita...' />
          )} />
          {errors.isi && <div className='text-red-600 text-sm'>{errors.isi.message}</div>}
        </div>
        <div>
          <label className='font-medium'>Gambar Berita</label>
          <div
            {...getRootProps()}
            className={`mt-1 border-2 border-dashed rounded-lg px-3 py-4 flex flex-col items-center justify-center cursor-pointer transition 
                        ${isDragActive
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 bg-gray-50'
              }
                        ${uploading ? 'opacity-60 pointer-events-none' : ''}
                        `}
          >
            <input {...getInputProps()} />
            {uploading ? (
              <span className='flex items-center gap-2 text-blue-600'>
                <Loader2 className='animate-spin' size={18} /> Mengupload...
              </span>
            ) : gambarUrl ? (
              <div className='text-center'>
                <div className='relative w-48 h-32'>

                <Image
                  src={gambarUrl}
                  alt='Preview'
                  fill
                  className='w-48 h-32 object-cover rounded mb-2 border mx-auto'
                  />
                  </div>
                <p className='text-sm text-green-600'>✓ Gambar berhasil diupload</p>
              </div>
            ) : (
              <div className='text-center'>
                <span className='text-gray-400 block mb-2'>
                  Klik atau drag file gambar di sini
                </span>
                <span className='text-xs text-gray-500'>
                  Format: JPG, PNG, WebP (Maksimal 5MB)
                </span>
              </div>
            )}
          </div>
          <input {...register('gambar')} type='hidden' />
          {errors.gambar && (
            <div className='text-red-600 text-sm'>{errors.gambar.message}</div>
          )}
        </div>

        {/* --- PERBAIKAN: Hapus grid untuk tanggal, penulis, kategori --- */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label className='font-medium'>Status</label>
            <select {...register('status')} className='border w-full px-3 py-2 rounded mt-1'>
              <option value='draft'>Draft</option>
              <option value='published'>Published</option>
            </select>
            {errors.status && <div className='text-red-600 text-sm'>{errors.status.message}</div>}
          </div>
        </div>



        <div>
          <label className='font-medium'>Tags <span className='text-xs text-gray-400'>(pisahkan dengan koma)</span></label>
          <input {...register('tags')} className='border w-full px-3 py-2 rounded mt-1' placeholder='berita, desa, teknologi' />
        </div>

        <div className='pt-3 flex justify-end'>
          <button type='submit' disabled={loading} className='bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'>
            {loading && <Loader2 className='animate-spin' size={18} />}
            {loading ? 'Menyimpan...' : 'Simpan Berita'}
          </button>
        </div>
      </form>
    </div>
  )
}