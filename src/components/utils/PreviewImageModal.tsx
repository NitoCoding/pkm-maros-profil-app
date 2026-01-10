import {useState} from 'react'
import {EyeIcon, X} from 'lucide-react'
import Image from 'next/image'

// gambarUrl = string berisi URL gambar

export default function PreviewImageButton({gambarUrl}: {gambarUrl: string}) {
	const [open, setOpen] = useState(false)

	return (
		<>
			{/* Button Preview */}
			<button
				type='button'
				onClick={() => setOpen(true)}
				className='ml-2 text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-3 py-1 inline-flex items-center gap-1'
			>
				<EyeIcon
					size={16}
					className='transition-transform duration-200 group-hover:text-blue-500 group-hover:scale-125'
				/>
				Preview
			</button>

			{/* Modal */}
			{open && (
				<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
					<div className='bg-white rounded-lg shadow-lg p-6 relative max-w-md w-full'>
						<button
							type='button'
							onClick={() => setOpen(false)}
							className='absolute top-2 right-2 text-gray-600 hover:text-red-500'
						>
							<X size={20} />
						</button>
						<Image
							src={gambarUrl}
							alt='Preview'
                            width={400}
                            height={300}
							className='w-full h-auto rounded object-contain'
						/>
					</div>
				</div>
			)}
		</>
	)
}
