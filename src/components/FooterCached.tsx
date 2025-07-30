'use client'

import {Leaf, MapPin, Phone, Mail, Clock} from 'lucide-react'
import { useFooterCached } from '@/hooks/useCachedData';
import Link from 'next/link';

export default function FooterCached() {
	const { data: footer, loading, error, isFromCache, refresh } = useFooterCached();

	const scrollToSection = (sectionId: string) => {
		const element = document.querySelector(sectionId)
		if (element) {
			window.scrollTo({
				top: element.getBoundingClientRect().top + window.scrollY - 80,
				behavior: 'smooth',
			})
		}
	}

	if (loading) {
		return (
			<footer className='bg-green-700 text-white pt-12 pb-6'>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='text-center py-8'>
						<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4'></div>
						<p className='text-sm opacity-75'>
							{isFromCache ? 'Memuat dari cache...' : 'Memuat footer...'}
						</p>
					</div>
				</div>
			</footer>
		);
	}

	if (error) {
		return (
			<footer className='bg-green-700 text-white pt-12 pb-6'>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='text-center py-8'>
						<p className='text-red-300 mb-4'>Gagal memuat footer: {error}</p>
						<button 
							onClick={refresh}
							className='bg-white text-green-700 px-4 py-2 rounded hover:bg-gray-100 transition'
						>
							Coba Lagi
						</button>
					</div>
				</div>
			</footer>
		);
	}

	return (
		<footer id='kontak' className='bg-green-700 text-white pt-12 pb-6'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='grid grid-cols-1 md:grid-cols-3 gap-10 mb-10'>
					<div>
						<div className='flex items-center mb-4'>
							<span className='font-heading font-bold text-xl'>
								Kelurahan Bilokka
							</span>
						</div>
						<p className='mb-4'>
							Website Kelurahan Bilokka yang menyediakan informasi desa
							dan mendukung pemberdayaan UMKM lokal.
						</p>
						<div className='flex space-x-4'>
							{/* Social media links can be added here */}
						</div>
					</div>

					<div>
						<h4 className='font-heading font-bold text-lg mb-4'>Halaman</h4>
						<ul className='space-y-2'>
							<li>
								<Link href='/' className='text-white hover:text-accent transition-colors'>
									Beranda
								</Link>
							</li>
							<li>
								{/* <Link
									className='text-white hover:text-accent transition-colors'
								>
									Profil
								</Link> */}
								<Link href='/profil/tentang' className='text-white hover:text-accent transition-colors'>
									Profil
								</Link>
							</li>
							<li>
								<Link href='/umkm' className='text-white hover:text-accent transition-colors'>
									UMKM
								</Link>
							</li>
							<li>
								<Link href='/galeri' className='text-white hover:text-accent transition-colors'>
									Galeri
								</Link>
							</li>
							<li>
								<Link href='/berita' className='text-white hover:text-accent transition-colors'>
									Berita
								</Link>
							</li>
						</ul>
					</div>

					<div>
						<h4 className='font-heading font-bold text-lg mb-4'>
							Hubungi Kami
						</h4>
						<ul className='space-y-3'>
							<li className='flex items-start'>
								<MapPin className='h-5 w-5 mt-1 mr-3 text-accent flex-shrink-0' />
								<span>
									{footer?.alamat || 'Bilokka, Kec. Panca Lautang, Kabupaten Sidenreng Rappang, Sulawesi Selatan 91672'}
								</span>
							</li>
							<li className='flex items-center'>
								<Phone className='h-5 w-5 mr-3 text-accent flex-shrink-0' />
								<span>{footer?.telepon || '031 3970961'}</span>
							</li>
							{footer?.email && (
								<li className='flex items-center'>
									<Mail className='h-5 w-5 mr-3 text-accent flex-shrink-0' />
									<span>{footer.email}</span>
								</li>
							)}
							<li className='flex items-center'>
								<Clock className='h-5 w-5 mr-3 text-accent flex-shrink-0' />
								<span>{footer?.jamKerja || 'Senin - Jumat: 08.00 - 15.00'}</span>
							</li>
						</ul>
						
						{/* Cache indicator */}
						{isFromCache && (
							<div className='mt-4 text-xs opacity-75'>
								⚡ Cache (30m)
							</div>
						)}
					</div>
				</div>

				<div className='border-t border-white border-opacity-20 pt-6 text-center text-sm'>
					<p>
						&copy; {new Date().getFullYear()} KKN GEL.114 Unhas 2025. Hak Cipta
						Dilindungi.
					</p>
				</div>
			</div>
		</footer>
	)
} 