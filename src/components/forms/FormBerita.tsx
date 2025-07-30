import React from 'react'
import {useForm, Controller} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'

import dynamic from 'next/dynamic'
import {z} from 'zod'
import { ClassicEditor } from 'ckeditor5'


// Dynamic import CKEditorWrapper
const CKEditorWrapper = dynamic(
	() => import('../ckeditor/CKEditorWrapper'),
	{ssr: false},
)

const beritaSchema = z.object({
	judul: z.string().nonempty('Judul wajib diisi'),
	slug: z.string().nonempty('Slug wajib diisi'),
	isi: z.string().nonempty('Isi berita wajib diisi'),
	gambar: z.string().url('Harus URL gambar yang valid'),
	tanggal: z.string().nonempty('Tanggal wajib diisi'),
	penulis: z.string().nonempty('Penulis wajib diisi'),
	kategori: z.string().nonempty('Kategori wajib diisi'),
	status: z.enum(['draft', 'published']),
	tags: z.string().optional(), // Diolah menjadi array saat submit
})

type BeritaFormValues = z.infer<typeof beritaSchema>

export default function BeritaForm() {
	const {
		register,
		handleSubmit,
		control,
		formState: {errors},
		setValue,
	} = useForm<BeritaFormValues>({
		resolver: zodResolver(beritaSchema),
		defaultValues: {
			status: 'draft',
			tags: '',
		},
	})

	const onSubmit = (data: BeritaFormValues) => {
		// Ubah tags string menjadi array
		const tagsArray =
			data.tags
				?.split(',')
				.map(tag => tag.trim())
				.filter(Boolean) ?? []
		const hasil = {
			...data,
			tags: tagsArray,
		}
		console.log(hasil)
		alert('Data berhasil dikirim! Lihat console.')
	}

	return (
		<form
			onSubmit={handleSubmit(onSubmit)}
			className='space-y-4 max-w-xl mx-auto p-4 bg-white rounded border'
		>
			<div>
				<label>Judul</label>
				<input {...register('judul')} className='input' />
				{errors.judul && <p className='text-red-600'>{errors.judul.message}</p>}
			</div>
			<div>
				<label>Slug</label>
				<input {...register('slug')} className='input' />
				{errors.slug && <p className='text-red-600'>{errors.slug.message}</p>}
			</div>
			<div>
				<label>Isi</label>
				<Controller
					name='isi'
					control={control}
					render={({field}) => (
						<CKEditorWrapper
							value={field.value}
							onChange={(value) => {
								setValue('isi', value)
							}}
						/>
					)}
				/>
				{errors.isi && <p className='text-red-600'>{errors.isi.message}</p>}
			</div>
			<div>
				<label>URL Gambar</label>
				<input {...register('gambar')} className='input' />
				{errors.gambar && (
					<p className='text-red-600'>{errors.gambar.message}</p>
				)}
			</div>
			<div>
				<label>Tanggal</label>
				<input {...register('tanggal')} type='date' className='input' />
				{errors.tanggal && (
					<p className='text-red-600'>{errors.tanggal.message}</p>
				)}
			</div>
			<div>
				<label>Penulis</label>
				<input {...register('penulis')} className='input' />
				{errors.penulis && (
					<p className='text-red-600'>{errors.penulis.message}</p>
				)}
			</div>
			<div>
				<label>Kategori</label>
				<input {...register('kategori')} className='input' />
				{errors.kategori && (
					<p className='text-red-600'>{errors.kategori.message}</p>
				)}
			</div>
			<div>
				<label>Status</label>
				<select {...register('status')} className='input'>
					<option value='draft'>Draft</option>
					<option value='published'>Published</option>
				</select>
				{errors.status && (
					<p className='text-red-600'>{errors.status.message}</p>
				)}
			</div>
			<div>
				<label>Tags (pisahkan dengan koma)</label>
				<input
					{...register('tags')}
					className='input'
					placeholder='berita, nasional, teknologi'
				/>
			</div>
			<button
				type='submit'
				className='px-4 py-2 bg-blue-600 text-white rounded'
			>
				Simpan
			</button>
		</form>
	)
}
