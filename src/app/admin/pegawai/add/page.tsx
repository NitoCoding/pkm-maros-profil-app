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

const pegawaiSchema = z.object({
	nama: z.string().min(3, 'Nama wajib diisi'),
	jabatan: z.string().min(3, 'Jabatan wajib diisi'),
	foto: z.string().url('URL foto tidak valid'),
	urutanTampil: z.string().min(1, 'Urutan tampil wajib diisi'),
})

type PegawaiFormValues = z.infer<typeof pegawaiSchema>

// Upload image to Cloudinary
const uploadImage = async (file: File): Promise<string> => {
	try {
		const formData = new FormData()
		formData.append('file', file)
		formData.append('folder', 'pegawai')

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

export default function TambahPegawaiPage() {
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
	} = useForm<PegawaiFormValues>({
		resolver: zodResolver(pegawaiSchema),
		defaultValues: {
			nama: '',
			jabatan: '',
			foto: '',
			urutanTampil: '',
		},
	})

	// Dropzone config
	const onDrop = useCallback(
		async (acceptedFiles: File[]) => {
			if (!acceptedFiles[0]) return
			
			console.log('Uploading file:', acceptedFiles[0])
			setUploading(true)
			setPreviewUrl(URL.createObjectURL(acceptedFiles[0]))
			
			try {
				const url = await uploadImage(acceptedFiles[0])
				setValue('foto', url, {shouldValidate: true})
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
		maxSize: 5 * 1024 * 1024, // 5MB
	})

	const gambarUrl = watch('foto')

	const onSubmit = async (data: PegawaiFormValues) => {
		try {
			setLoading(true)

			const payload = {
				...data,
				createdAt: new Date().toISOString()
			}

			console.log('📤 Sending payload:', payload)

			// Use makeAuthenticatedRequest for automatic token refresh
			const response = await fetch('/api/pegawai', {
				method: 'POST',
				body: JSON.stringify(payload),
			})

			console.log('📥 Response status:', response.status)
			console.log('📥 Response ok:', response.ok)

			const result = await response.json()
			console.log('📥 API Response:', result)

			if (!response.ok) {
				console.error('❌ API Error:', result)
				throw new Error(result.error || 'Gagal menyimpan pegawai')
			}

			if (result.success) {
				console.log('✅ Success result:', result.data)
				toast.success('Pegawai berhasil ditambahkan!')
				router.push('/admin/pegawai')
			} else {
				throw new Error(result.error || 'Gagal menyimpan pegawai')
			}
		} catch (error: any) {
			console.error('❌ Submit error:', error)
			
			// Don't show error toast if user was redirected to login
			if (error.message !== 'NO_TOKEN' && 
				error.message !== 'TOKEN_REFRESH_FAILED' && 
				error.message !== 'TOKEN_STILL_INVALID') {
				toast.error(error.message || 'Terjadi kesalahan saat menyimpan pegawai')
			}
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className='mx-auto py-8 px-6'>
			<h1 className='text-2xl font-bold mb-6'>Tambah Pegawai Baru</h1>
			<form
				onSubmit={handleSubmit(onSubmit)}
				className='bg-white rounded-xl border border-gray-200 shadow px-6 py-8 space-y-5'
			>
				<div className='flex items-center mb-8'>
					<Link
            href='/admin/pegawai'
            className='flex items-center text-gray-600 hover:text-gray-900 mb-4'
          >
            <ArrowLeft size={18} />
            Kembali
          </Link>
				</div>
				<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div className='space-y-4'>

					<div>
						<label className='font-medium'>Nama</label>
						<input
							{...register('nama')}
							className={`border w-full px-3 py-2 rounded mt-1 ${
								errors.nama && 'border-red-500'
							}`}
							placeholder='Nama pegawai'
						/>
						{errors.nama && (
							<div className='text-red-600 text-sm'>{errors.nama.message}</div>
						)}
					</div>
					<div>
						<label className='font-medium'>Jabatan</label>
						<input
							{...register('jabatan')}
							className={`border w-full px-3 py-2 rounded mt-1 ${
								errors.jabatan && 'border-red-500'
							}`}
							placeholder='Jabatan pegawai'
						/>
						{errors.jabatan && (
                            <div className='text-red-600 text-sm'>
								{errors.jabatan.message}
							</div>
						)}
					</div>
					<div>
						<label className='font-medium'>Urutan Tampil <span className='text-xs text-gray-400'>
                            (gunakan angka, misal 1, 2, 3 untuk urutan tampil pegawai)
                        </span></label>
						<input
							{...register('urutanTampil')}
							type='number'
							className={`border w-full px-3 py-2 rounded mt-1 ${
								errors.urutanTampil && 'border-red-500'
							}`}
							placeholder='Urutan tampil pegawai'
						/>
						{errors.urutanTampil && (
							<div className='text-red-600 text-sm'>
								{errors.urutanTampil.message}
							</div>
						)}
					</div>
                        </div>
					<div>
						<label className='font-medium'>Gambar Pegawai</label>
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
						<input {...register('foto')} type='hidden' />
						{errors.foto && (
							<div className='text-red-600 text-sm'>{errors.foto.message}</div>
						)}
					</div>
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
						{loading ? 'Menyimpan...' : uploading ? 'Mengupload...' : 'Simpan'}
					</button>
				</div>
			</form>
		</div>
	)
}
