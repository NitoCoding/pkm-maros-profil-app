'use client'
import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {Home, Newspaper, Image, HardDrive,Users, Store, UserCircle} from 'lucide-react'

const navItems = [
	{label: 'Dashboard', href: '/admin', icon: Home},
	{label: 'Berita', href: '/admin/berita', icon: Newspaper},
	{label: 'Galeri', href: '/admin/galeri', icon: Image},
	{label: 'Pegawai', href: '/admin/pegawai', icon: Users},
	{label: 'UMKM', href: '/admin/umkm', icon: Store},
	{label: 'Profil', href: '/admin/profil', icon: UserCircle},
	{label: 'Umum', href: '/admin/umum', icon: HardDrive},
]

export default function Sidebar() {
	const pathname = usePathname()

	return (
		<aside className='w-64 bg-white border-r flex flex-col'>
			{/* Brand / Logo */}
			<div className='flex items-center gap-3 px-6 py-6 bg-blue-600 text-white shadow'>
				<span className='text-2xl font-extrabold tracking-tight'>K</span>
				<span className='font-bold text-lg'>Kelurahan Bilokka</span>
			</div>
			{/* Navigation */}
			<nav className='flex-1 py-4'>
				<ul className='space-y-1 px-2'>
					{navItems.map(item => {
						const isActive =
							item.href === '/admin'
								? pathname === '/admin'
								: pathname.startsWith(item.href)
						const ItemIcon = item.icon
						return (
							<li key={item.href}>
								<Link
									href={item.href}
									className={`flex items-center gap-3 px-4 py-2 rounded-l-lg transition
                    ${
											isActive
												? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 font-semibold shadow-sm'
												: 'text-gray-700 hover:bg-gray-50'
										}
                  `}
								>
									<ItemIcon
										className={`w-5 h-5 ${
											isActive ? 'text-blue-600' : 'text-gray-400'
										}`}
									/>
									<span>{item.label}</span>
								</Link>
							</li>
						)
					})}
				</ul>
			</nav>
			{/* Footer (optional) */}
			<div className='px-6 py-4 border-t text-xs text-gray-400'>
				© {new Date().getFullYear()} Kelurahan Bilokka
			</div>
		</aside>
	)
}
