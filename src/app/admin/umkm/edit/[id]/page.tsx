'use client'

import {useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import {z} from 'zod'
import {useRouter} from 'next/navigation'
import {ArrowLeft, Loader2, MapPin, ExternalLink} from 'lucide-react'
import Link from 'next/link'
import {useState, useCallback, useEffect, use} from 'react'
import {useDropzone} from 'react-dropzone'
import { toast } from 'react-hot-toast'
import { makeAuthenticatedRequest } from '@/libs/auth/token'
import { IUMKM } from '@/types/umkm'

const umkmSchema = z.object({
	nama: z.string().min(3, 'Nama UMKM wajib diisi'),
	kategori: z.string().min(2, 'Kategori wajib diisi'),
	deskripsi: z.string().min(10, 'Deskripsi minimal 10 karakter'),
	gambar: z.string().url('URL gambar tidak valid'),
	startPrice: z.string().min(1, 'Harga awal wajib diisi'),
	endPrice: z.string().min(1, 'Harga akhir wajib diisi'),
	telepon: z.string().min(10, 'Nomor telepon minimal 10 digit'),
	alamat: z.string().min(10, 'Alamat minimal 10 karakter'),
	googleMapsLink: z.string().url('Link Google Maps tidak valid').optional().or(z.literal('')),
})

type UmkmFormValues = z.infer<typeof umkmSchema>

// Upload image to Cloudinary
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
		return result.url
	} catch (error) {
		toast.error('Gagal mengupload gambar')
		console.error('Error uploading image:', error)
		throw error
	}
}

// Extract coordinates from Google Maps link
const extractCoordinatesFromLink = (link: string): { latitude: string; longitude: string } => {
	try {
		// Handle different Google Maps link formats
		const url = new URL(link);
		
		// Format: https://maps.google.com/?q=lat,lng
		if (url.searchParams.has('q')) {
			const coords = url.searchParams.get('q')?.split(',');
			if (coords && coords.length === 2) {
				return {
					latitude: coords[0].trim(),
					longitude: coords[1].trim()
				};
			}
		}
		
		// Format: https://www.google.com/maps/place/.../@lat,lng,zoom
		const pathParts = url.pathname.split('/');
		const placeIndex = pathParts.findIndex(part => part === 'place');
		if (placeIndex !== -1 && placeIndex + 1 < pathParts.length) {
			const coordsPart = pathParts[placeIndex + 1];
			const coordsMatch = coordsPart.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
			if (coordsMatch) {
				return {
					latitude: coordsMatch[1],
					longitude: coordsMatch[2]
				};
			}
		}
		
		// Format: https://www.google.com/maps/@lat,lng,zoom
		const coordsMatch = url.pathname.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
		if (coordsMatch) {
			return {
				latitude: coordsMatch[1],
				longitude: coordsMatch[2]
			};
		}
		
		return { latitude: '0', longitude: '0' };
	} catch (error) {
		console.error('Error extracting coordinates:', error);
		return { latitude: '0', longitude: '0' };
	}
}

export default function EditUmkmPage({ params }: { params: Promise<{ id: string }> }) {
	const resolvedParams = use(params)
	const router = useRouter()
	const [loading, setLoading] = useState(false)
	const [uploading, setUploading] = useState(false)
	const [previewUrl, setPreviewUrl] = useState<string | null>(null)
	const [fetchingData, setFetchingData] = useState(true)

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		formState: {errors},
	} = useForm<UmkmFormValues>({
		resolver: zodResolver(umkmSchema),
		defaultValues: {
			nama: '',
			kategori: '',
			deskripsi: '',
			gambar: '',
			startPrice: '',
			endPrice: '',
			telepon: '',
			alamat: '',
			googleMapsLink: '',
		},
	})

	// Fetch UMKM data by ID
	useEffect(() => {
		const fetchUmkmData = async () => {
			try {
				setFetchingData(true)
				
				const response = await makeAuthenticatedRequest(`/api/umkm?id=${resolvedParams.id}`)
				const result = await response.json()

				if (!response.ok) {
					throw new Error(result.error || 'Gagal memuat data UMKM')
				}

				const umkmData: IUMKM = result.data
				
				// Set form values
				setValue('nama', umkmData.nama)
				setValue('kategori', umkmData.kategori)
				setValue('deskripsi', umkmData.deskripsi)
				setValue('gambar', umkmData.gambar)
				setValue('startPrice', umkmData.startPrice.toString())
				setValue('endPrice', umkmData.endPrice.toString())
				setValue('telepon', umkmData.telepon)
				setValue('alamat', umkmData.lokasi.alamat)
				setValue('googleMapsLink', umkmData.lokasi.googleMapsLink || '')
				
				// Set preview URL
				setPreviewUrl(umkmData.gambar)
				
			} catch (error: any) {
				console.error('Error fetching UMKM data:', error)
				
				// Don't show error toast if user was redirected to login
				if (error.message !== 'NO_TOKEN' && 
					error.message !== 'TOKEN_REFRESH_FAILED' && 
					error.message !== 'TOKEN_STILL_INVALID') {
					toast.error(error.message || 'Gagal memuat data UMKM')
				}
				
				// Redirect back to UMKM list on error
				router.push('/admin/umkm')
				
			} finally {
				setFetchingData(false)
			}
		}

		if (resolvedParams.id) {
			fetchUmkmData()
		}
	}, [resolvedParams.id, setValue, router])

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
				// Restore previous preview if upload fails
				const currentGambar = watch('gambar')
				setPreviewUrl(currentGambar || null)
			} finally {
				setUploading(false)
			}
		},
		[setValue, watch],
	)

	const {getRootProps, getInputProps, isDragActive} = useDropzone({
		onDrop,
		accept: {'image/*': []},
		multiple: false,
		maxSize: 5 * 1024 * 1024, // 5MB
	})

	const gambarUrl = watch('gambar')
	const googleMapsLink = watch('googleMapsLink')

	const onSubmit = async (data: UmkmFormValues) => {
		try {
			setLoading(true)

			// Extract coordinates from Google Maps link
			const coordinates = data.googleMapsLink ? extractCoordinatesFromLink(data.googleMapsLink) : { latitude: '0', longitude: '0' };

			const payload = {
				id: resolvedParams.id,
				nama: data.nama,
				kategori: data.kategori,
				deskripsi: data.deskripsi,
				gambar: data.gambar,
				startPrice: data.startPrice,
				endPrice: data.endPrice,
				telepon: data.telepon,
				lokasi: {
					alamat: data.alamat,
					latitude: coordinates.latitude,
					longitude: coordinates.longitude,
					googleMapsLink: data.googleMapsLink || '',
				},
			}

			console.log('📤 Sending update payload:', payload)

			// Use makeAuthenticatedRequest for automatic token refresh
			const response = await makeAuthenticatedRequest('/api/umkm', {
				method: 'PUT',
				body: JSON.stringify(payload),
			})

			console.log('📥 Response status:', response.status)
			console.log('📥 Response ok:', response.ok)

			const result = await response.json()
			console.log('📥 API Response:', result)

			if (!response.ok) {
				console.error('❌ API Error:', result)
				throw new Error(result.error || 'Gagal mengupdate UMKM')
			}

			if (result.success) {
				console.log('✅ Success result:', result)
				toast.success('UMKM berhasil diupdate!')
				router.push('/admin/umkm')
			} else {
				throw new Error(result.error || 'Gagal mengupdate UMKM')
			}
		} catch (error: any) {
			console.error('❌ Submit error:', error)
			
			// Don't show error toast if user was redirected to login
			if (error.message !== 'NO_TOKEN' && 
				error.message !== 'TOKEN_REFRESH_FAILED' && 
				error.message !== 'TOKEN_STILL_INVALID') {
				toast.error(error.message || 'Terjadi kesalahan saat mengupdate UMKM')
			}
		} finally {
			setLoading(false)
		}
	}

	// Show loading while fetching data
	if (fetchingData) {
		return (
			<div className='mx-auto py-8 px-6'>
				<div className="flex justify-center items-center py-12">
					<Loader2 className="animate-spin h-8 w-8 text-blue-600" />
					<span className="ml-2 text-gray-600">Memuat data UMKM...</span>
				</div>
			</div>
		)
	}

	return (
		<div className='mx-auto py-8 px-6'>
			<h1 className='text-2xl font-bold mb-6'>Edit UMKM</h1>
			<form
				onSubmit={handleSubmit(onSubmit)}
				className='bg-white rounded-xl border border-gray-200 shadow px-6 py-8 space-y-5'
			>
				<div className='flex items-center gap-2 mb-6'>
					<Link
						href='/admin/umkm'
						className='flex items-center gap-1 text-sm text-blue-600 hover:underline'
					>
						<ArrowLeft size={18} />
						Kembali
					</Link>
				</div>

				{/* Nama dan Kategori */}
				<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
					<div>
						<label className='font-medium'>Nama UMKM</label>
						<input
							{...register('nama')}
							className={`border w-full px-3 py-2 rounded mt-1 ${
								errors.nama && 'border-red-500'
							}`}
							placeholder='Nama usaha'
						/>
						{errors.nama && (
							<div className='text-red-600 text-sm'>{errors.nama.message}</div>
						)}
					</div>

					<div>
						<label className='font-medium'>Kategori</label>
						<select
							{...register('kategori')}
							className={`border w-full px-3 py-2 rounded mt-1 ${
								errors.kategori && 'border-red-500'
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
							<div className='text-red-600 text-sm'>{errors.kategori.message}</div>
						)}
					</div>
				</div>

				{/* Deskripsi */}
				<div>
					<label className='font-medium'>Deskripsi</label>
					<textarea
						{...register('deskripsi')}
						rows={4}
						className={`border w-full px-3 py-2 rounded mt-1 ${
							errors.deskripsi && 'border-red-500'
						}`}
						placeholder='Deskripsi lengkap tentang UMKM'
					/>
					{errors.deskripsi && (
						<div className='text-red-600 text-sm'>{errors.deskripsi.message}</div>
					)}
				</div>

				{/* Upload Gambar */}
				<div>
					<label className='font-medium'>Gambar UMKM</label>
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
						) : (gambarUrl || previewUrl) ? (
							<div className='text-center'>
								<img
									src={previewUrl || gambarUrl}
									alt='Preview'
									className='w-48 h-32 object-cover rounded mb-2 border mx-auto'
								/>
								<p className='text-sm text-green-600'>✓ Gambar siap</p>
								<p className='text-xs text-gray-500 mt-1'>
									Klik atau drag file baru untuk mengganti gambar
								</p>
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

				{/* Harga */}
				<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
					<div>
						<label className='font-medium'>Harga Mulai</label>
						<input
							{...register('startPrice')}
							type='number'
							min='0'
							className={`border w-full px-3 py-2 rounded mt-1 ${
								errors.startPrice && 'border-red-500'
							}`}
							placeholder='100000'
						/>
						{errors.startPrice && (
							<div className='text-red-600 text-sm'>{errors.startPrice.message}</div>
						)}
					</div>

					<div>
						<label className='font-medium'>Harga Sampai</label>
						<input
							{...register('endPrice')}
							type='number'
							min='0'
							className={`border w-full px-3 py-2 rounded mt-1 ${
								errors.endPrice && 'border-red-500'
							}`}
							placeholder='500000'
						/>
						{errors.endPrice && (
							<div className='text-red-600 text-sm'>{errors.endPrice.message}</div>
						)}
					</div>
				</div>

				{/* Kontak */}
				<div>
					<label className='font-medium'>Nomor Telepon</label>
					<input
						{...register('telepon')}
						type='tel'
						className={`border w-full px-3 py-2 rounded mt-1 ${
							errors.telepon && 'border-red-500'
						}`}
						placeholder='08123456789'
					/>
					{errors.telepon && (
						<div className='text-red-600 text-sm'>{errors.telepon.message}</div>
					)}
				</div>

				{/* Lokasi */}
				<div>
					<label className='font-medium'>Alamat</label>
					<textarea
						{...register('alamat')}
						rows={3}
						className={`border w-full px-3 py-2 rounded mt-1 ${
							errors.alamat && 'border-red-500'
						}`}
						placeholder='Alamat lengkap UMKM'
					/>
					{errors.alamat && (
						<div className='text-red-600 text-sm'>{errors.alamat.message}</div>
					)}
				</div>

				{/* Google Maps Link */}
				<div>
					<label className='font-medium flex items-center gap-2'>
						<MapPin size={16} />
						Link Google Maps
						<span className='text-xs text-gray-400'>(opsional)</span>
					</label>
					<div className='relative'>
						<input
							{...register('googleMapsLink')}
							type='url'
							className={`border w-full px-3 py-2 rounded mt-1 pr-10 ${
								errors.googleMapsLink && 'border-red-500'
							}`}
							placeholder='https://maps.google.com/?q=-6.200000,106.816666'
						/>
						{googleMapsLink && (
							<a
								href={googleMapsLink}
								target='_blank'
								rel='noopener noreferrer'
								className='absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-800'
								title='Buka di Google Maps'
							>
								<ExternalLink size={16} />
							</a>
						)}
					</div>
					{errors.googleMapsLink && (
						<div className='text-red-600 text-sm'>{errors.googleMapsLink.message}</div>
					)}
					<p className='text-xs text-gray-500 mt-1'>
						Paste link Google Maps untuk lokasi UMKM. Koordinat akan otomatis diekstrak.
					</p>
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
						{loading ? 'Menyimpan...' : uploading ? 'Mengupload...' : 'Update'}
					</button>
				</div>
			</form>
		</div>
	)
}
