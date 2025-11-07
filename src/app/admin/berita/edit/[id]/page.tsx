// src/app/admin/berita/edit/[id]/page.tsx
'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import CKEditorWrapper from '@/components/ckeditor/CKEditorWrapper'
import { toast } from 'react-hot-toast'
import Image from 'next/image'
import { IBerita } from '@/types/berita'; // Menggunakan tipe baru
import { useBeritaById } from '@/hooks/useBerita'; // Menggunakan hook baru

// --- PERBAIKAN: Schema baru yang sesuai dengan tipe data IBerita ---
const beritaSchema = z.object({
	judul: z.string().min(1, 'Judul harus diisi'),
	slug: z.string().min(1, 'Slug harus diisi'),
	ringkasan: z.string().min(1, 'Ringkasan harus diisi'),
	isi: z.string().min(1, 'Isi berita harus diisi'),
	gambar: z.string().nullable(), // Gambar bisa null
	status: z.enum(['draft', 'published']),
	// tags: z.array(z.string()).optional(), // Tags adalah array
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

export default function EditBeritaPage() {
	const params = useParams();
	const id = params.id as string;
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [fetching, setFetching] = useState(true);
	const [berita, setBerita] = useState<IBerita | null>(null);

	const {
		register,
		handleSubmit,
		control,
		setValue,
		watch,
		reset,
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
	});

	// --- PERBAIKAN: Fetch data menggunakan hook baru ---
	const { berita: fetchedBerita, loading: isLoading, error } = useBeritaById(Number(id));

	console.log('Fetched berita for editing:', fetchedBerita?.kategori);

	useEffect(() => {
		if (fetchedBerita) {
			setBerita(fetchedBerita);
			// --- PERBAIKAN: Reset form dengan data yang sudah sesuai ---
			reset({
				judul: fetchedBerita.judul || '',
				slug: fetchedBerita.slug || '',
				ringkasan: fetchedBerita.ringkasan || '',
				isi: fetchedBerita.isi || '',
				gambar: fetchedBerita.gambar || '',
				status: fetchedBerita.status || 'draft',
				tags: Array.isArray(fetchedBerita.kategori)
					? fetchedBerita.kategori.join(', ')
					: '',
			});
			setFetching(false);
		} else if (!isLoading) {
			setFetching(false);
		}
	}, [fetchedBerita, isLoading, reset]);

	const judulValue = watch('judul');
	const [slugEdited, setSlugEdited] = useState(false);

	useEffect(() => {
		if (!slugEdited && judulValue) {
			setValue('slug', slugify(judulValue));
		}
	}, [judulValue, setValue, slugEdited]);

	// Fungsi upload gambar tetap sama
	const uploadImage = async (file: File): Promise<string> => {
		// ... (salin fungsi uploadImage dari halaman tambah)
		try {
			const formData = new FormData()
			formData.append('file', file)
			formData.append('folder', 'berita')
			formData.append('quality', 'high')

			const response = await fetch('/api/berita', {
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
			if (!acceptedFiles[0]) return;
			setUploading(true);
			try {
				const url = await uploadImage(acceptedFiles[0]);
				setValue('gambar', url, { shouldValidate: true });
				toast.success('Gambar berhasil diupload');
			} catch (error) {
				// Error already handled
			} finally {
				setUploading(false);
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

	// --- PERBAIKAN: onSubmit yang bersih ---
	const onSubmit = async (data: BeritaFormValues) => {
		try {
			setLoading(true);

			const payload = {
				id: Number(id),
				...data,
				// API akan menangani updatedAt
			};

			// --- Hapus makeAuthenticatedRequest ---
			const response = await fetch(`/api/berita?id=${id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				const errorData = await response.json();
				if (response.status === 401) {
					toast.error('Sesi Anda telah berakhir. Silakan login kembali.');
					router.push('/login');
					return;
				}
				throw new Error(errorData.error || 'Gagal mengupdate berita');
			}

			toast.success('Berita berhasil diupdate!');
			router.push('/admin/berita');
		} catch (error: any) {
			const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan saat mengupdate berita';
			toast.error(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	if (isLoading || fetching) {
		return (
			<div className='flex justify-center items-center py-24'>
				<div className='text-center'>
					<Loader2 className='animate-spin mx-auto mb-4' size={32} />
					<p className='text-gray-600'>Memuat data berita...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className='text-center py-12'>
				<p className='text-red-600 text-lg mb-4'>{error}</p>
				<Link href='/admin/berita' className='text-blue-600 hover:underline'>
					Kembali ke Daftar Berita
				</Link>
			</div>
		);
	}

	if (!berita) {
		return null; // Atau tampilkan pesan "Berita tidak ditemukan"
	}

	return (
		<div className='mx-auto py-8 px-6'>
			<h1 className='text-2xl font-bold mb-6'>Edit Berita</h1>
			<form onSubmit={handleSubmit(onSubmit)} className='bg-white rounded-xl border border-gray-200 shadow px-6 py-8 space-y-5'>
				<div className='flex items-center mb-8'>
					<Link
						href='/admin/berita'
						className='flex items-center text-gray-600 hover:text-gray-900 mb-4'
					>
						<ArrowLeft size={18} />
						Kembali
					</Link>
				</div>

				{/* --- PERBAIKAN: Hapus field yang tidak lagi digunakan --- */}
				<div>
					<label className='font-medium'>Judul</label>
					<input {...register('judul')} className={`border w-full px-3 py-2 rounded mt-1 ${errors.judul && 'border-red-500'}`} placeholder='Judul berita' />
					{errors.judul && <div className='text-red-600 text-sm'>{errors.judul.message}</div>}
				</div>

				<div>
					<label className='font-medium'>Slug</label>
					<Controller
						name='slug'
						control={control}
						render={({ field }) => (
							<input
								{...field}
								onChange={e => {
									setSlugEdited(true);
									field.onChange(e);
								}}
								className={`border w-full px-3 py-2 rounded mt-1 ${errors.slug && 'border-red-500'}`}
								placeholder='slug-berita'
							/>
						)}
					/>
					<div className='text-xs text-gray-400 mt-1'>Slug otomatis dari judul, bisa diubah manual</div>
					{errors.slug && <div className='text-red-600 text-sm'>{errors.slug.message}</div>}
				</div>

				<div>
					<label className='font-medium mb-1 block'>Ringkasan Berita</label>
					<Controller
						name='ringkasan'
						control={control}
						render={({ field }) => (
							<CKEditorWrapper
								value={field.value}
								onChange={field.onChange}
								placeholder='Ringkasan berita...'
							/>
						)}
					/>
					{errors.ringkasan && <div className='text-red-600 text-sm'>{errors.ringkasan.message}</div>}
				</div>

				<div>
					<label className='font-medium mb-1 block'>Isi Berita</label>
					<Controller
						name='isi'
						control={control}
						render={({ field }) => (
							<CKEditorWrapper
								value={field.value}
								onChange={field.onChange}
								placeholder='Isi berita...'
							/>
						)}
					/>
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
            ${uploading ? 'opacity-60 pointer-events-none' : ''
							}`}
					>
						<input {...getInputProps()} />
						{uploading ? (
							<span className='flex items-center gap-2 text-blue-600'>
								<Loader2 className='animate-spin' size={18} /> Mengupload...
							</span>
						) : gambarUrl ? (
							<div className='text-center'>
								<Image
									src={gambarUrl}
									alt='Preview'
									width={160}
									height={128}
									className='w-40 h-32 object-cover rounded mb-2 border mx-auto'
								/>
								<p className='text-sm text-green-600'>✓ Gambar berhasil diupload</p>
							</div>
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
					{/* --- PERBAIKAN: Controller untuk tags agar berupa array --- */}
					{/* <Controller
						name="tags"
						control={control}
						render={({ field }) => (
							<input
								value={field.value ? field.value.join(', ') : ''}
								onChange={e => {
									const tagsArray = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean);
									field.onChange(tagsArray);
								}}
								className="border w-full px-3 py-2 rounded mt-1"
								placeholder="berita, desa, teknologi"
							/>
						)}
					/> */}
					<input
						{...register('tags')}
						className='border w-full px-3 py-2 rounded mt-1'
						placeholder='berita, desa, teknologi'
					/>
				</div>

				<div className='pt-3 flex justify-end'>
					<button
						type='submit'
						disabled={loading || uploading}
						className='bg-blue-600 text-white px-6 py-2 rounded font-semibold flex items-center gap-2 hover:bg-blue-700 transition disabled:opacity-60'
					>
						{(loading || uploading) && <Loader2 size={18} className='animate-spin' />}
						{loading ? 'Menyimpan...' : uploading ? 'Mengupload...' : 'Simpan Perubahan'}
					</button>
				</div>
			</form>
		</div>
	)
}