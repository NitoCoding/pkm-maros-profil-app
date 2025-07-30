'use client'

import {useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import {z} from 'zod'
import {useRouter} from 'next/navigation'
import {ArrowLeft, Loader2} from 'lucide-react'
import Link from 'next/link'
import {useState, useCallback} from 'react'
import {useDropzone} from 'react-dropzone'
import { toast } from 'react-hot-toast'
import { makeAuthenticatedRequest } from '@/libs/auth/token'

const galeriSchema = z.object({
    caption: z.string().min(3, 'Caption wajib diisi'),
    alt: z.string().min(3, 'Alt text wajib diisi'),
    src: z.string().url('URL gambar tidak valid'),
    tanggal: z.string().min(8, 'Tanggal wajib diisi'),
    tags: z.string().optional(),
})

type GaleriFormValues = z.infer<typeof galeriSchema>

export default function TambahGaleriPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: {errors},
    } = useForm<GaleriFormValues>({
        resolver: zodResolver(galeriSchema),
        defaultValues: {
            caption: '',
            alt: '',
            src: '',
            tanggal: '',
            tags: '',
        },
    })

    // Upload image to Cloudinary with HD quality
    const uploadImage = async (file: File): Promise<string> => {
        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('folder', 'galeri')
            formData.append('quality', 'high') // Use high quality for HD images

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

    // Dropzone config
    const onDrop = useCallback(
        async (acceptedFiles: File[]) => {
            if (!acceptedFiles[0]) return
            
            console.log('Uploading file:', acceptedFiles[0])
            setUploading(true)
            setPreviewUrl(URL.createObjectURL(acceptedFiles[0]))
            
            try {
                const url = await uploadImage(acceptedFiles[0])
                setValue('src', url, {shouldValidate: true})
                toast.success('Gambar berhasil diupload')
            } catch (error) {
                // Error already handled in uploadImage function
                setPreviewUrl(null)
            } finally {
                setUploading(false)
            }
        },
        [setValue],
    )

    const {getRootProps, getInputProps, isDragActive} = useDropzone({
        onDrop,
        accept: {'image/*': []},
        multiple: false,
        maxSize: 10 * 1024 * 1024, // 10MB for HD images
    })

    const srcUrl = watch('src')

    const onSubmit = async (data: GaleriFormValues) => {
        try {
            setLoading(true)

            const tagsArray =
                data.tags
                    ?.split(',')
                    .map(tag => tag.trim())
                    .filter(Boolean) ?? []

            const payload = {
                ...data,
                tags: tagsArray,
                createdAt: new Date().toISOString()
            }

            console.log('📤 Sending payload:', payload)

            // Use makeAuthenticatedRequest for automatic token refresh
            const response = await makeAuthenticatedRequest('/api/galeri', {
                method: 'POST',
                body: JSON.stringify(payload),
            })

            console.log('📥 Response status:', response.status)
            console.log('📥 Response ok:', response.ok)

            const result = await response.json()
            console.log('📥 API Response:', result)

            if (!response.ok) {
                console.error('❌ API Error:', result)
                throw new Error(result.error || 'Gagal menyimpan galeri')
            }

            if (result.success) {
                console.log('✅ Success result:', result.data)
                toast.success('Galeri berhasil ditambahkan!')
                router.push('/admin/galeri')
            } else {
                throw new Error(result.error || 'Gagal menyimpan galeri')
            }
        } catch (error: any) {
            console.error('❌ Submit error:', error)
            
            // Don't show error toast if user was redirected to login
            if (error.message !== 'NO_TOKEN' && 
                error.message !== 'TOKEN_REFRESH_FAILED' && 
                error.message !== 'TOKEN_STILL_INVALID') {
                toast.error(error.message || 'Terjadi kesalahan saat menyimpan galeri')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='mx-auto py-8 px-6'>
            <h1 className='text-2xl font-bold mb-6'>Tambah Galeri Baru</h1>
            <form
                onSubmit={handleSubmit(onSubmit)}
                className='bg-white rounded-xl border border-gray-200 shadow px-6 py-8 space-y-5'
            >
                <div className='flex items-center gap-2 mb-6'>
                    <Link
                        href='/admin/galeri'
                        className='flex items-center gap-1 text-sm text-blue-600 hover:underline'
                    >
                        <ArrowLeft size={18} />
                        Kembali
                    </Link>
                </div>

                {/* Caption dan Alt Text */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                        <label className='font-medium'>Caption</label>
                        <input
                            {...register('caption')}
                            className={`border w-full px-3 py-2 rounded mt-1 ${
                                errors.caption && 'border-red-500'
                            }`}
                            placeholder='Deskripsi gambar'
                        />
                        {errors.caption && (
                            <div className='text-red-600 text-sm'>{errors.caption.message}</div>
                        )}
                    </div>

                    <div>
                        <label className='font-medium'>Alt Text</label>
                        <input
                            {...register('alt')}
                            className={`border w-full px-3 py-2 rounded mt-1 ${
                                errors.alt && 'border-red-500'
                            }`}
                            placeholder='Teks alternatif untuk aksesibilitas'
                        />
                        {errors.alt && (
                            <div className='text-red-600 text-sm'>{errors.alt.message}</div>
                        )}
                    </div>
                </div>

                {/* Upload Gambar */}
                <div>
                    <label className='font-medium'>Gambar Galeri</label>
                    <div
                        {...getRootProps()}
                        className={`mt-1 border-2 border-dashed rounded-lg px-3 py-4 flex flex-col items-center justify-center cursor-pointer transition 
                        ${
                            isDragActive
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
                        ) : srcUrl ? (
                            <div className='text-center'>
                                <img
                                    src={srcUrl}
                                    alt='Preview'
                                    className='w-48 h-32 object-cover rounded mb-2 border mx-auto'
                                />
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
                    <input {...register('src')} type='hidden' />
                    {errors.src && (
                        <div className='text-red-600 text-sm'>{errors.src.message}</div>
                    )}
                </div>

                {/* Tanggal dan Tags */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                        <label className='font-medium'>Tanggal</label>
                        <input
                            {...register('tanggal')}
                            type='date'
                            className={`border w-full px-3 py-2 rounded mt-1 ${
                                errors.tanggal && 'border-red-500'
                            }`}
                        />
                        {errors.tanggal && (
                            <div className='text-red-600 text-sm'>
                                {errors.tanggal.message}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className='font-medium'>
                            Tags{' '}
                            <span className='text-xs text-gray-400'>
                                (pisahkan dengan koma)
                            </span>
                        </label>
                        <input
                            {...register('tags')}
                            className='border w-full px-3 py-2 rounded mt-1'
                            placeholder='kegiatan, dokumentasi, kelurahan'
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <div className='pt-3 flex justify-end'>
                    <button
                        type='submit'
                        disabled={loading || uploading}
                        className='bg-blue-600 text-white px-6 py-2 rounded font-semibold flex items-center gap-2 hover:bg-blue-700 transition disabled:opacity-60'
                    >
                        {(loading || uploading) && (
                            <Loader2 size={18} className='animate-spin' />
                        )}
                        {loading ? 'Menyimpan...' : uploading ? 'Mengupload...' : 'Simpan'}
                    </button>
                </div>
            </form>
        </div>
    )
}
