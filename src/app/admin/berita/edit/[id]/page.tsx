'use client'

import {useForm, Controller} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import {z} from 'zod'
import {useRouter, useParams} from 'next/navigation'
import {ArrowLeft, Loader2} from 'lucide-react'
import Link from 'next/link'
import {useEffect, useState, useCallback} from 'react'
import {useDropzone} from 'react-dropzone'
import CKEditorWrapper from '@/components/ckeditor/CKEditorWrapper'
import { toast } from 'react-hot-toast'
import { makeAuthenticatedRequest } from '@/libs/auth/token'
import { IBerita } from '@/types/berita'
import { formatDateForInput } from '@/libs/utils/date'
import { beritaKategori } from '@/libs/constant/beritaKategori'

const beritaSchema = z.object({
	judul: z.string().min(3, 'Judul wajib diisi'),
	slug: z.string().min(3, 'Slug wajib diisi'),
	ringkasan: z.string().min(10, 'Ringkasan berita wajib diisi'),
	isi: z.string().min(10, 'Isi berita wajib diisi'),
	gambar: z.string().url('URL gambar tidak valid'),
	tanggal: z.string().min(8, 'Tanggal wajib diisi'),
	penulis: z.string().min(2, 'Penulis wajib diisi'),
	kategori: z.string().min(2, 'Kategori wajib diisi'),
	status: z.enum(['draft', 'published']),
	tags: z.string().optional(),
})

type BeritaFormValues = z.infer<typeof beritaSchema>

// Slugify utility
function slugify(text: string) {
	return text
		.toLowerCase()
		.replace(/[^\w\s-]/g, '') // Remove special chars
		.replace(/\s+/g, '-') // Replace spaces with -
		.replace(/--+/g, '-') // Remove double dash
		.trim()
}

export default function EditBeritaPage() {
	const params = useParams()
	const id = params.id as string
	const router = useRouter()
	const [loading, setLoading] = useState(false)
	const [uploading, setUploading] = useState(false)
	const [previewUrl, setPreviewUrl] = useState<string | null>(null)
	const [fetching, setFetching] = useState(true)
	const [berita, setBerita] = useState<IBerita | null>(null)

	const {
		register,
		handleSubmit,
		control,
		setValue,
		watch,
		formState: {errors},
		reset,
	} = useForm<BeritaFormValues>({
		resolver: zodResolver(beritaSchema),
		defaultValues: {
			judul: '',
			slug: '',
			ringkasan: '',
			isi: '',
			gambar: '',
			tanggal: '',
			penulis: '',
			kategori: '',
			status: 'draft',
			tags: '',
		},
	})

	// Fetch berita data by ID
	useEffect(() => {
		const fetchBerita = async () => {
			try {
				setFetching(true)
				
				const response = await fetch(`/api/berita?id=${id}`)
				const result = await response.json()

				if (!response.ok) {
					throw new Error(result.error || 'Failed to fetch berita')
				}

				if (result.success && result.data) {
					const beritaData = result.data
					setBerita(beritaData)
					
					// Convert tags array back to string
					const tagsString = Array.isArray(beritaData.tags) 
						? beritaData.tags.join(', ') 
						: beritaData.tags || ''

					// Reset form with fetched data
					reset({
						judul: beritaData.judul || '',
						slug: beritaData.slug || '',
						ringkasan: beritaData.ringkasan || '',
						isi: beritaData.isi || '',
						gambar: beritaData.gambar || '',
						tanggal: beritaData.tanggal ? formatDateForInput(beritaData.tanggal) : '',
						penulis: beritaData.penulis || '',
						kategori: beritaData.kategori || '',
						status: beritaData.status || 'draft',
						tags: tagsString,
					})

					setPreviewUrl(beritaData.gambar || null)
				} else {
					throw new Error('Berita tidak ditemukan')
				}
			} catch (error: any) {
				console.error('Error fetching berita:', error)
				toast.error(error.message || 'Gagal memuat data berita')
				router.push('/admin/berita')
			} finally {
				setFetching(false)
			}
		}

		if (id) {
			fetchBerita()
		}
	}, [id, reset, router])

	const judulValue = watch('judul')
	const [slugEdited, setSlugEdited] = useState(false)

	// Auto generate slug from title
	useEffect(() => {
		if (!slugEdited && judulValue) {
			setValue('slug', slugify(judulValue))
		}
	}, [judulValue, setValue, slugEdited])

	// Upload image to Cloudinary
	const uploadImage = async (file: File): Promise<string> => {
		try {
			const formData = new FormData()
			formData.append('file', file)
			formData.append('folder', 'berita')
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
				setValue('gambar', url, {shouldValidate: true})
				toast.success('Gambar berhasil diupload')
			} catch (error) {
				// Error already handled in uploadImage function
				setPreviewUrl(berita?.gambar || null) // Revert to original image
			} finally {
				setUploading(false)
			}
		},
		[setValue, berita?.gambar],
	)

	const {getRootProps, getInputProps, isDragActive} = useDropzone({
		onDrop,
		accept: {'image/*': []},
		multiple: false,
		maxSize: 5 * 1024 * 1024, // 5MB
	})

	const gambarUrl = watch('gambar')

	const onSubmit = async (data: BeritaFormValues) => {
		try {
			setLoading(true)

			const tagsArray =
				data.tags
					?.split(',')
					.map(tag => tag.trim())
					.filter(Boolean) ?? []

			const payload = {
				...data,
				id: id, // Include ID in the payload
				tags: tagsArray,
				updatedAt: new Date().toISOString()
			}

			console.log('📤 Updating berita with payload:', payload)

			// Use makeAuthenticatedRequest for automatic token refresh
			const response = await makeAuthenticatedRequest('/api/berita', {
				method: 'PUT',
				body: JSON.stringify(payload),
			})

			console.log('📥 Response status:', response.status)
			console.log('📥 Response ok:', response.ok)

			const result = await response.json()
			console.log('📥 API Response:', result)

			if (!response.ok) {
				console.error('❌ API Error:', result)
				throw new Error(result.error || 'Gagal mengupdate berita')
			}

			if (result.success) {
				console.log('✅ Success result:', result.data)
				toast.success('Berita berhasil diupdate!')
				router.push('/admin/berita')
			} else {
				throw new Error(result.error || 'Gagal mengupdate berita')
			}
		} catch (error: any) {
			console.error('❌ Submit error:', error)
			
			// Don't show error toast if user was redirected to login
			if (error.message !== 'NO_TOKEN' && 
				error.message !== 'TOKEN_REFRESH_FAILED' && 
				error.message !== 'TOKEN_STILL_INVALID') {
				toast.error(error.message || 'Terjadi kesalahan saat mengupdate berita')
			}
		} finally {
			setLoading(false)
		}
	}

	if (fetching) {
		return (
			<div className='mx-auto py-8 px-6'>
				<div className='flex items-center justify-center py-24'>
					<div className='text-center'>
						<Loader2 className='animate-spin mx-auto mb-4' size={32} />
						<p className='text-gray-600'>Memuat data berita...</p>
					</div>
				</div>
			</div>
		)
	}

	if (!berita) {
		return (
			<div className='mx-auto py-8 px-6'>
				<div className='flex items-center justify-center py-24'>
					<div className='text-center'>
						<div className='text-6xl mb-4'>📰</div>
						<h2 className='text-2xl font-bold text-gray-800 mb-2'>
							Berita Tidak Ditemukan
						</h2>
						<p className='text-gray-600 mb-4'>
							Berita yang ingin Anda edit tidak dapat ditemukan.
						</p>
						<Link 
							href='/admin/berita'
							className='bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition'
						>
							Kembali ke Daftar Berita
						</Link>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className='mx-auto py-8 px-6'>
			<h1 className='text-2xl font-bold mb-6'>Edit Berita</h1>
			<form
				onSubmit={handleSubmit(onSubmit)}
				className='bg-white rounded-xl border border-gray-200 shadow px-6 py-8 space-y-5'
			>
				<div className='flex items-center gap-2 mb-6'>
					<Link
						href='/admin/berita'
						className='flex items-center gap-1 text-sm text-blue-600 hover:underline'
					>
						<ArrowLeft size={18} />
						Kembali
					</Link>
				</div>

				{/* Judul dan Slug */}
				<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
					<div>
						<label className='font-medium'>Judul</label>
						<input
							{...register('judul')}
							className={`border w-full px-3 py-2 rounded mt-1 ${
								errors.judul && 'border-red-500'
							}`}
							placeholder='Judul berita'
						/>
						{errors.judul && (
							<div className='text-red-600 text-sm'>{errors.judul.message}</div>
						)}
					</div>

					<div>
						<label className='font-medium'>Slug</label>
						<Controller
							name='slug'
							control={control}
							render={({field}) => (
								<input
									{...field}
									onChange={e => {
										setSlugEdited(true)
										field.onChange(e)
									}}
									className={`border w-full px-3 py-2 rounded mt-1 ${
										errors.slug && 'border-red-500'
									}`}
									placeholder='slug-berita'
								/>
							)}
						/>
						<div className='text-xs text-gray-400 mt-1'>
							Slug otomatis dari judul, bisa diubah manual
						</div>
						{errors.slug && (
							<div className='text-red-600 text-sm'>{errors.slug.message}</div>
						)}
					</div>
				</div>

				{/* Ringkasan */}
				<div>
					<label className='font-medium'>Ringkasan</label>
					<textarea
						{...register('ringkasan')}
						rows={3}
						className={`border w-full px-3 py-2 rounded mt-1 resize-none ${
							errors.ringkasan && 'border-red-500'
						}`}
						placeholder='Ringkasan singkat berita...'
					/>
					{errors.ringkasan && (
						<div className='text-red-600 text-sm'>{errors.ringkasan.message}</div>
					)}
				</div>

				{/* Isi Berita */}
				<div>
					<label className='font-medium mb-1 block'>Isi Berita</label>
					<Controller
						name='isi'
						control={control}
						render={({field}) => (
							<CKEditorWrapper
								value={field.value}
								onChange={field.onChange}
							/>
						)}
					/>
					{errors.isi && (
						<div className='text-red-600 text-sm'>{errors.isi.message}</div>
					)}
				</div>

				{/* Upload Gambar */}
				<div>
					<label className='font-medium'>Gambar Berita</label>
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
						) : gambarUrl ? (
							<div className='text-center'>
								<img
									src={gambarUrl}
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
					<input {...register('gambar')} type='hidden' />
					{errors.gambar && (
						<div className='text-red-600 text-sm'>{errors.gambar.message}</div>
					)}
				</div>

				{/* Tanggal dan Penulis */}
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
						<label className='font-medium'>Penulis</label>
						<input
							{...register('penulis')}
							className={`border w-full px-3 py-2 rounded mt-1 ${
								errors.penulis && 'border-red-500'
							}`}
							placeholder='Nama penulis'
						/>
						{errors.penulis && (
							<div className='text-red-600 text-sm'>
								{errors.penulis.message}
							</div>
						)}
					</div>
				</div>

				{/* Kategori dan Status */}
				<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
					<div>
						<label className='font-medium'>Kategori</label>
						<select
							{...register('kategori')}
							className={`border w-full px-3 py-2 rounded mt-1 ${
								errors.kategori && 'border-red-500'
							}`}
						>
							<option value=''>Pilih kategori</option>
							{beritaKategori.map((kategori) => (
								<option key={kategori} value={kategori}>
									{kategori}
								</option>
							))}
						</select>
						{errors.kategori && (
							<div className='text-red-600 text-sm'>
								{errors.kategori.message}
							</div>
						)}
					</div>

					<div>
						<label className='font-medium'>Status</label>
						<select
							{...register('status')}
							className='border w-full px-3 py-2 rounded mt-1'
						>
							<option value='draft'>Draft</option>
							<option value='published'>Published</option>
						</select>
						{errors.status && (
							<div className='text-red-600 text-sm'>
								{errors.status.message}
							</div>
						)}
					</div>
				</div>

				{/* Tags */}
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
						placeholder='berita, nasional, teknologi'
					/>
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
						{loading ? 'Menyimpan...' : uploading ? 'Mengupload...' : 'Simpan Perubahan'}
					</button>
				</div>
			</form>
		</div>
	)
}
