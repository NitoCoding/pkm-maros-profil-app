'use client'

import {useForm, Controller} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import {z} from 'zod'
import {useRouter} from 'next/navigation'
import {ArrowLeft, Loader2} from 'lucide-react'
import Link from 'next/link'
import {useState, useCallback, useEffect} from 'react'
import {useDropzone} from 'react-dropzone'
import CKEditorWrapper from '@/components/ckeditor/CKEditorWrapper'
import { toast } from 'react-hot-toast'
import { getAuthToken } from '@/libs/auth/token'

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

export default function TambahBeritaPage() {
	const router = useRouter()
	const [loading, setLoading] = useState(false)
	const [uploading, setUploading] = useState(false)
	const [previewUrl, setPreviewUrl] = useState<string | null>(null)

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
	const slugValue = watch('slug')
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
			setPreviewUrl(URL.createObjectURL(acceptedFiles[0]))
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

			// Use the image URL from Cloudinary upload
			let imageUrl = data.gambar

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
		} catch (error: any) {
			toast.error(error.message || 'Terjadi kesalahan saat menyimpan berita')
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
									/>
						)}
					/>
					{errors.isi && (
						<div className='text-red-600 text-sm'>{errors.isi.message}</div>
					)}
				</div>
				{/* DROPZONE UPLOAD GAMBAR */}
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
								<Loader2 className='animate-spin' size={18} /> Uploading...
							</span>
						) : gambarUrl ? (
							<img
								src={gambarUrl}
								alt='Preview'
								className='w-40 h-32 object-cover rounded mb-2 border'
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
						<input
							{...register('kategori')}
							className={`border w-full px-3 py-2 rounded mt-1 ${
								errors.kategori && 'border-red-500'
							}`}
							placeholder='Kategori berita'
						/>
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
						disabled={loading || uploading}
						className='bg-blue-600 text-white px-6 py-2 rounded font-semibold flex items-center gap-2 hover:bg-blue-700 transition disabled:opacity-60'
					>
						{(loading || uploading) && (
							<Loader2 size={18} className='animate-spin' />
						)}
						Simpan
					</button>
				</div>
			</form>
		</div>
	)
}
