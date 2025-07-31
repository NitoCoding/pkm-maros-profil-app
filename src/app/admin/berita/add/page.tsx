'use client'

import {useForm, Controller} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import {z} from 'zod'
import {useRouter} from 'next/navigation'
import {ArrowLeft, Loader2, Upload} from 'lucide-react'
import Link from 'next/link'
import {useState, useCallback, useEffect} from 'react'
import {useDropzone} from 'react-dropzone'
import CKEditorWrapper from '@/components/ckeditor/CKEditorWrapper'
import { toast } from 'react-hot-toast'
import { getAuthToken } from '@/libs/auth/token'
import Image from 'next/image'
import { beritaKategori } from '@/libs/constant/beritaKategori'

const beritaSchema = z.object({
	judul: z.string().min(1, 'Judul harus diisi'),
	slug: z.string().min(1, 'Slug harus diisi'),
	ringkasan: z.string().min(1, 'Ringkasan harus diisi'),
	isi: z.string().min(1, 'Isi berita harus diisi'),
	gambar: z.string().optional(),
	tanggal: z.string().min(1, 'Tanggal harus diisi'),
	penulis: z.string().min(1, 'Penulis harus diisi'),
	kategori: z.string().min(1, 'Kategori harus diisi'),
	status: z.enum(['draft', 'published']),
	tags: z.string().optional(),
})

type BeritaFormValues = z.infer<typeof beritaSchema>

// Slugify utility
function slugify(text: string) {
	return text
		.toLowerCase()
		.replace(/[^\w\s-]/g, '') // Remove special chars
		.replace(/[\s_-]+/g, '-') // Replace spaces with -
		.replace(/^-+|-+$/g, '') // Remove double dash
		.trim()
}

export default function TambahBeritaPage() {
	const router = useRouter()
	const [loading, setLoading] = useState(false)
	const [uploading, setUploading] = useState(false)
	// Removed unused previewUrl state

	console.log("token", getAuthToken())

	const {
		register,
		handleSubmit,
		control,
		setValue,
		watch,
		formState: {errors},
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

	const judulValue = watch('judul')
	// Removed unused slugValue
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
			console.log(acceptedFiles[0])
			setUploading(true)
			// Removed unused previewUrl assignment
			// Upload ke server/Cloudinary dst.
			const url = await uploadImage(acceptedFiles[0])
			setValue('gambar', url, {shouldValidate: true})
			setUploading(false)
		},
		[setValue],
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

			// Use const instead of let for imageUrl
			const imageUrl = data.gambar

			const payload = {
				...data,
				tags: tagsArray,
				gambar: imageUrl,
				createdAt: new Date().toISOString()
			}

			const token = getAuthToken()
			console.log(token)

			const response = await fetch('/api/berita', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(payload),
			})

			if (!response.ok) {
				const error = await response.json()
				throw new Error(error.message || 'Gagal menyimpan berita')
			}

			toast.success('Berita berhasil ditambahkan!')
			router.push('/admin/berita')
		} catch (error: unknown) { // Fixed any type
			const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan saat menyimpan berita'
			toast.error(errorMessage)
			console.error('Error saving berita:', error)
		} finally {
			setLoading(false)
		}
	}

	// Upload image to Cloudinary with HD quality
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

	return (
		<div className='mx-auto py-8 px-6'>
			<h1 className='text-2xl font-bold mb-6'>Tambah Berita Baru</h1>
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
				<div>
					<label className='font-medium mb-1 block'>Ringkasan Berita</label>
					<Controller
						name='ringkasan'
						control={control}
						render={({field}) => (
							<CKEditorWrapper
								value={field.value}
								onChange={field.onChange}
								placeholder='Ringkasan berita...'
							/>
						)}
					/>
					{errors.ringkasan && (
						<div className='text-red-600 text-sm'>{errors.ringkasan.message}</div>
					)}
				</div>
				<div>
					<label className='font-medium mb-1 block'>Isi Berita</label>
					<Controller
						name='isi'
						control={control}
						render={({field}) => (
							<CKEditorWrapper
								value={field.value}
								onChange={field.onChange}
								placeholder='Isi berita...'
							/>
						)}
					/>
					{errors.isi && (
						<div className='text-red-600 text-sm'>{errors.isi.message}</div>
					)}
				</div>
				<div>
					<label className='font-medium'>Gambar Berita</label>
					<div
						{...getRootProps()}
						className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
							isDragActive
								? 'border-blue-500 bg-blue-50'
								: 'border-gray-300 hover:border-gray-400'
						}`}
					>
						<input {...getInputProps()} />
						<Upload className='mx-auto mb-2 text-gray-400' size={24} />
						{uploading ? (
							<span className='flex items-center gap-2 text-blue-600'>
								<Loader2 className='animate-spin' size={18} /> Uploading...
							</span>
						) : gambarUrl ? (
							<Image
								src={gambarUrl}
								alt='Preview'
								width={160}
								height={128}
								className='w-40 h-32 object-cover rounded mb-2 border mx-auto'
							/>
						) : (
							<span className='text-gray-400'>
								Klik/drag file gambar di sini (maks 5MB)
							</span>
						)}
					</div>
					<input {...register('gambar')} type='hidden' />
					{errors.gambar && (
						<div className='text-red-600 text-sm'>{errors.gambar.message}</div>
					)}
				</div>
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
				<div className='pt-3 flex justify-end'>
					<button
						type='submit'
						disabled={loading}
						className='bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
					>
						{loading && <Loader2 className='animate-spin' size={18} />}
						{loading ? 'Menyimpan...' : 'Simpan Berita'}
					</button>
				</div>
			</form>
		</div>
	)
}
