import Image from 'next/image'

export default function Hero() {
	return (
		<div className='min-h-screen w-full mb-4' id='hero'>
			<Image
				src='/hero_1.jpg'
				alt='Hero Image'
				className='absolute inset-0 object-cover w-full h-full'
				width={1920}
				height={1080}
				priority
			/>
			<div className='absolute inset-0 bg-gradient-to-b from-transparent to-white from-85% z-10'></div>
			<div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 text-center text-white'>
				<div className='w-full'>
					<h1 className=' font-bold mb-4 drop-shadow-xl tracking-wide'>
						<p className='text-3xl md:text-4xl'>
							Selamat Datang Di Website Desa Benteng Gajah
						</p>
						<p className='mt-2'>
							Desa Benteng Gajah, Kecamatan Panca Lautang, Kabupaten Sidrap
						</p>
					</h1>
				</div>
			</div>
		</div>
	)
}
