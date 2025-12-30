'use client'

import {ChevronDown, Menu, X} from 'lucide-react'
import {useEffect, useState} from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {usePathname} from 'next/navigation'
import {IMenu} from '@/types/menu'
import { logout } from '@/libs/auth/token'

const MENU_ITEMS: IMenu[] = [
	{label: 'Beranda', href: '/', show: true},
	{
		label: 'Profil Desa',
		show: true,
		children: [
			{label: 'Tentang', href: '/profil/tentang', show: true},
			{label: 'Infografis', href: '/profil/infografis', show: true},
			{label: 'Geografis', href: '/profil/geografis', show: true},
		],
	},
	{
		label: 'Potensi Desa',
		show: true,
		children: [
			{label: 'Wisata', href: '/potensi/wisata', show: true},
			{label: 'Inovasi', href: '/potensi/inovasi', show: true},
		],
	},
	// {
	// 	label: 'Layanan',
	// 	show: true,
	// 	children: [
	// 		{label: 'Pengajuan Surat', href: '/layanan/surat', show: true},
	// 		{label: 'Pengaduan', href: '/layanan/pengaduan', show: true},
	// 	],
	// },
	{label: 'UMKM', href: '/umkm', show: true},
	{label: 'Galeri', href: '/galeri', show: true},
	{label: 'Berita', href: '/berita', show: true},
	// {label: 'Logout', href: '/auth/logout', show: true},
]

export default function Navbar() {
	const pathname = usePathname()
	const [openDropdown, setOpenDropdown] = useState<string | null>(null)
	const [mobileOpen, setMobileOpen] = useState(false)
	const [isCarouselPassed, setIsCarouselPassed] = useState(false)
	const isHomePage = pathname === '/'

	// Set isCarouselPassed based on isHomePage on mount and pathname change
	useEffect(() => {
		if (!isHomePage) {
			setIsCarouselPassed(true)
		} else {
			setIsCarouselPassed(false) // Reset when returning to home page
		}
	}, [isHomePage])

	useEffect(() => {
		const handleScroll = () => {
			if (window.scrollY >= window.innerHeight && isHomePage) {
				setIsCarouselPassed(true)
			} else if (isHomePage) {
				setIsCarouselPassed(false)
			}
		}

		window.addEventListener('scroll', handleScroll)
		return () => {
			window.removeEventListener('scroll', handleScroll)
		}
	}, [isHomePage])

	const toggleDropdown = (label: string) => {
		setOpenDropdown(openDropdown === label ? null : label)
	}

	const handleMouseEnter = (label: string) => {
		setOpenDropdown(label)
	}

	const handleMouseLeave = () => {
		setOpenDropdown(null)
	}

	useEffect(() => {
		setMobileOpen(false)
		setOpenDropdown(null)
	}, [pathname])

	const handleLogout = async() => {
		await logout()
	}

	return (
		<div className='relative'>
			<div
				className={`text-white px-3.5 py-3 fixed w-full shadow-lg z-[99999] md:px-6 md:py-2 transition-colors duration-500 ${
					isCarouselPassed
						? 'bg-white text-black'
						: 'bg-transparent md:shadow-none'
				}`}
			>
				<div className='max-w-7xl mx-auto flex items-center justify-between'>
					<a
						className={`text-lg font-semibold flex items-center gap-2 hover:shadow-slate-900 hover:backdrop-blur-sm hover:bg-opacity-50 transition-all duration-300 ${
							isCarouselPassed ? 'text-black' : 'text-white'
						}`}
					>
						<Image
							src='/logo.png'
							alt='Logo'
							width={70}
							height={70}
							className='rounded-full object-cover'
						/>
						<div className='flex flex-col'>
							<h1>Desa Benteng Gajah</h1>
							<p className='text-sm'>Kecamatan Tompobulu</p>
						</div>
					</a>
					<div className='flex items-center gap-6'>
						<button
							className={`lg:hidden ${
								isCarouselPassed ? 'text-black' : 'text-white'
							}`}
							onClick={() => setMobileOpen(!mobileOpen)}
						>
							{mobileOpen ? <X size={24} /> : <Menu size={24} />}
						</button>
						<div className='hidden lg:flex gap-6 items-center'>
							{MENU_ITEMS.map(item =>
								item.children ? (
									<div
										key={item.label}
										className='relative'
										onMouseEnter={() => handleMouseEnter(item.label)}
										// onMouseLeave={handleMouseLeave}
									>
										<button
											onClick={() => toggleDropdown(item.label)}
											className={`flex items-center gap-1 hover:text-blue-600 font-medium ${
												isCarouselPassed ? 'text-black' : 'text-white'
											}`}
										>
											{item.label}
											<ChevronDown size={16} />
										</button>
										<div
											className={`absolute top-full left-0 mt-2 text-black bg-white shadow-md border rounded-md py-2 w-48 ${
												openDropdown === item.label ? 'block' : 'hidden'
											}`}
											onMouseEnter={() => handleMouseEnter(item.label)}
											onMouseLeave={handleMouseLeave}
										>
											{item.children
												.filter(child => child.show && child.href)
												.map(child => (
													<Link
														key={child.href}
														href={child.href as string}
														className={`block px-4 py-2 hover:bg-gray-100 ${
															pathname === child.href
																? 'text-blue-600 font-semibold'
																: ''
														}`}
													>
														{child.label}
													</Link>
												))}
										</div>
									</div>
								) : (
									<Link
										key={item.label}
										href={item.href!}
										className={`hover:text-blue-600 font-medium ${
											isCarouselPassed ? 'text-black' : 'text-white'
										} ${
											pathname === item.href ? 'underline underline-offset-1 text-blue-600' : ''
										}`}
									>
										{item.label}
									</Link>
								),
							)}
							{/* <button onClick={() => handleLogout()}>
								logout
							</button> */}
						</div>
					</div>
				</div>

				{/* Mobile Menu - Full-screen overlay sliding from left */}
				{mobileOpen && (
					<div
						className='fixed top-0 left-0 w-full h-full bg-white text-black z-[99998] transform transition-transform duration-300 ease-in-out'
						style={{
							transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
						}}
					>
						<div className='flex items-center justify-between'>
							<a
								className='text-lg font-semibold flex items-center gap-2 hover:shadow-slate-900 hover:backdrop-blur-sm hover:bg-opacity-50 transition-all duration-300 
									text-black px-3.5 py-3'
							>
								<Image
									src='/logo.png'
									alt='Logo'
									width={70}
									height={70}
									className='rounded-full object-cover'
								/>
								<div className='flex flex-col'>
									<h1>Desa Benteng Gajah</h1>
									<p className='text-sm'>Kecamatan Panca Lautang</p>
								</div>
							</a>
							<div className='flex justify-end p-4'>
								<button onClick={() => setMobileOpen(false)}>
									<X size={24} />
								</button>
							</div>
						</div>
						<div className='p-6 space-y-2'>
							{MENU_ITEMS.map(item =>
								item.children ? (
									<div key={item.label}>
										<button
											onClick={() => toggleDropdown(item.label)}
											className='flex items-center justify-between w-full py-2 font-medium text-left border-gray-200'
										>
											<span className='px-3.5'>{item.label}</span>
											<ChevronDown
												size={16}
												className={`transition-transform ${
													openDropdown === item.label ? 'rotate-180' : ''
												}`}
											/>
										</button>
										{openDropdown === item.label && (
											<div className='pl-4 mt-2 space-y-2'>
												{item.children
													.filter(child => child.show && child.href)
													.map(child => (
														<Link
															key={child.href}
															href={child.href as string}
															className={`block py-1 text-sm ${
																pathname === child.href
																	? 'text-blue-600 font-semibold'
																	: ''
															}`}
															onClick={() => setMobileOpen(false)} // Close menu on link click
														>
															{child.label}
														</Link>
													))}
											</div>
										)}
									</div>
								) : (
									<Link
		key={item.label}
		href={item.href!}
		className={`block py-2 font-medium rounded-md transition-colors duration-300 ${
			pathname === item.href
				? 'bg-gradient-to-br from-green-300 to-green-700 text-white'
				: 'bg-white text-black hover:bg-gray-500'
		}`}
		onClick={() => setMobileOpen(false)} // Close menu on link click
	>
		<span className="px-3.5">{item.label}</span>
	</Link>
								),
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	)
}
