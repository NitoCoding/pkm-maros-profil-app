'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Save, Loader2, Upload } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useDropzone } from 'react-dropzone'
import Image from 'next/image'
import { usePegawaiById } from '@/hooks/usePegawai'
import { IPegawai } from '@/types/pegawai'

// --- Zod Schema ---
const pegawaiSchema = z.object({
	nama: z.string().min(3, 'Nama wajib diisi'),
	jabatan: z.string().min(3, 'Jabatan wajib diisi'),
	fotoUrl: z.string().url('URL foto tidak valid'),
	tampilkanDiBeranda: z.boolean(),
	urutanBeranda: z.number()
		.int()
		.min(1, 'Urutan harus antara 1–4')
		.max(4, 'Urutan harus antara 1–4')
		.optional(),
}).refine(
	(data) => !data.tampilkanDiBeranda || (data.tampilkanDiBeranda && data.urutanBeranda !== undefined),
	{
		message: 'Harus memilih urutan (1–4) jika ingin muncul di beranda',
		path: ['urutanBeranda'],
	}
)

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
			throw new Error(error.message || 'Gagal mengupload gambar')
		}

		const result = await response.json()
		toast.success('Gambar berhasil diupload!')
		return result.url
	} catch (error) {
		toast.error('Gagal mengupload gambar')
		console.error('Error uploading image:', error)
		throw error
	}
}

export default function EditPegawaiPage() {
	const router = useRouter()
	const params = useParams()
	const id = params.id as string
	const [loading, setLoading] = useState(false)
	const [uploading, setUploading] = useState(false)

	const { pegawai, loading: fetching, error } = usePegawaiById(id)

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		reset,
		formState: { errors },
	} = useForm<PegawaiFormValues>({
		resolver: zodResolver(pegawaiSchema),
		defaultValues: {
			nama: '',
			jabatan: '',
			fotoUrl: '',
			tampilkanDiBeranda: false,
			urutanBeranda: 1,
		},
	})

	const fotoUrl = watch('fotoUrl')
	const tampilkanDiBeranda = watch('tampilkanDiBeranda')

	// Reset form saat data dimuat
	useEffect(() => {
		if (pegawai) {
			reset({
				nama: pegawai.nama,
				jabatan: pegawai.jabatan,
				fotoUrl: pegawai.fotoUrl,
				tampilkanDiBeranda: pegawai.tampilkanDiBeranda,
				urutanBeranda: pegawai.urutanBeranda ?? undefined,
			})
		}
	}, [pegawai, reset])

	// Dropzone config
	const onDrop = useCallback(
		async (acceptedFiles: File[]) => {
			if (!acceptedFiles[0]) return
			setUploading(true)
			try {
				const url = await uploadImage(acceptedFiles[0])
				setValue('fotoUrl', url, { shouldValidate: true })
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
		maxSize: 5 * 1024 * 1024, // 5MB
	})

	// Submit handler
	const onSubmit = async (data: PegawaiFormValues) => {
		try {
			setLoading(true)

			const payload = {
				id,
				...data,
				fotoUrl: data.fotoUrl,
				updatedBy: 'current-user-id', // bisa dari auth context
			}

			const response = await fetch('/api/pegawai', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			})

			const result = await response.json()

			if (!response.ok) {
				throw new Error(result.error || 'Gagal memperbarui pegawai')
			}

			toast.success('Pegawai berhasil diperbarui!')
			router.push('/admin/pegawai')
		} catch (error: any) {
			if (!error.message.includes('TOKEN')) {
				toast.error(error.message || 'Terjadi kesalahan saat menyimpan')
			}
		} finally {
			setLoading(false)
		}
	}

	if (fetching) {
		return (
			<div className="p-6">
				<div className="flex items-center gap-4 mb-6">
					<button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
						<ArrowLeft size={20} />
					</button>
					<div>
						<h1 className="text-2xl font-bold text-gray-900">Edit Pegawai</h1>
						<p className="text-gray-600">Memuat data pegawai...</p>
					</div>
				</div>
				<div className="flex justify-center py-12">
					<Loader2 className="animate-spin h-8 w-8 text-blue-600" />
					<span className="ml-2 text-gray-600">Memuat data...</span>
				</div>
			</div>
		)
	}

	if (error || !pegawai) {
		return (
			<div className="p-6">
				<div className="flex items-center gap-4 mb-6">
					<button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
						<ArrowLeft size={20} />
					</button>
					<div>
						<h1 className="text-2xl font-bold text-gray-900">Edit Pegawai</h1>
						<p className="text-gray-600">Gagal memuat data</p>
					</div>
				</div>
				<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg max-w-md mx-auto">
					<p className="font-medium">{error || 'Pegawai tidak ditemukan'}</p>
					<button
						onClick={() => router.back()}
						className="mt-2 text-sm bg-red-100 hover:bg-red-200 px-3 py-1 rounded transition"
					>
						Kembali
					</button>
				</div>
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
					<h1 className="text-2xl font-bold text-gray-900">Edit Pegawai</h1>
					<p className="text-gray-600">Perbarui informasi staf desa</p>
				</div>
			</div>

			<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
				{/* INFORMASI PEGAWAI */}
				<div className="bg-white rounded-lg shadow p-6">
					<h2 className="text-lg font-semibold mb-4">Informasi Pegawai</h2>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Nama Lengkap *
							</label>
							<input
								{...register('nama')}
								type="text"
								placeholder="Contoh: Ahmad Supriadi"
								className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.nama ? 'border-red-500' : 'border-gray-300'
									}`}
							/>
							{errors.nama && (
								<p className="text-red-500 text-xs mt-1">{errors.nama.message}</p>
							)}
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Jabatan *
							</label>
							<input
								{...register('jabatan')}
								type="text"
								placeholder="Contoh: Kepala Desa"
								className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.jabatan ? 'border-red-500' : 'border-gray-300'
									}`}
							/>
							{errors.jabatan && (
								<p className="text-red-500 text-xs mt-1">{errors.jabatan.message}</p>
							)}
						</div>
					</div>

					{/* TAMPILKAN DI BERANDA */}
					<div className="mt-6 pt-6 border-t border-gray-200">
						<div>
							<label className="flex items-start gap-2 text-sm font-medium text-gray-700 mb-1">
								<input
									type="checkbox"
									{...register('tampilkanDiBeranda')}
									className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
								/>
								<span>Tampilkan di Beranda Desa</span>
							</label>
							<p className="text-xs text-gray-500 mb-3">
								Jika dicentang, pegawai akan muncul di halaman utama (maksimal 4 orang).
							</p>

							{tampilkanDiBeranda && (
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Urutan di Beranda (1–4) *
									</label>
									<select
										{...register('urutanBeranda', { valueAsNumber: true })}
										className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.urutanBeranda ? 'border-red-500' : 'border-gray-300'
											}`}
									>
										<option value="">Pilih posisi</option>
										{[1, 2, 3, 4].map(num => (
											<option key={num} value={num}>{num}</option>
										))}
									</select>
									{errors.urutanBeranda && (
										<p className="text-red-500 text-xs mt-1">{errors.urutanBeranda.message}</p>
									)}
									<p className="text-xs text-gray-500 mt-1">
										1 = paling atas, 4 = paling bawah
									</p>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* FOTO PEGAWAI */}
				<div className="bg-white rounded-lg shadow p-6">
					<h2 className="text-lg font-semibold mb-4">Foto Pegawai</h2>

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
						) : fotoUrl ? (
							<div className="text-center">
								<div className="relative w-48 h-32 mx-auto mb-2">
									<Image
										src={fotoUrl}
										alt="Preview Foto Pegawai"
										fill
										className="object-cover rounded border"
									/>
								</div>
								<p className="text-sm text-green-600">✓ Foto berhasil diupload</p>
							</div>
						) : (
							<div className="text-center">
								<Upload size={24} className="mx-auto mb-2 text-gray-400" />
								<span className="text-gray-400 block mb-2">
									Klik atau drag file gambar di sini
								</span>
								<span className="text-xs text-gray-500">
									Format: JPG, PNG, WebP (Maksimal 5MB)
								</span>
							</div>
						)}
					</div>

					<input {...register('fotoUrl')} type="hidden" />
					{errors.fotoUrl && (
						<p className="text-red-500 text-xs mt-2">{errors.fotoUrl.message}</p>
					)}
				</div>

				{/* SUBMIT BUTTON */}
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
						disabled={loading || uploading}
						className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
					>
						{(loading || uploading) ? (
							<>
								<Loader2 size={16} className="animate-spin" />
								{loading ? 'Menyimpan...' : 'Mengupload...'}
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