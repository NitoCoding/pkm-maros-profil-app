'use client'

import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { LogOut, User, UserCircle } from 'lucide-react'
import { logout } from '@/libs/auth/token'
import Link from 'next/link'

export default function Topbar() {
	const router = useRouter()
	const [isLoggingOut, setIsLoggingOut] = useState(false);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false)
	const dropdownRef = useRef<HTMLDivElement>(null)

	// Close dropdown jika klik di luar
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsDropdownOpen(false)
			}
		}
		if (isDropdownOpen) {
			document.addEventListener('mousedown', handleClickOutside)
		}
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [isDropdownOpen])

	const handleLogout = async () => {
		// Logout logic here
		console.log('Logout clicked')
		// router.push('/login')
		await logout()
	}

	return (
		<header className='bg-white shadow-sm px-6 py-6 flex justify-between items-center sticky top-0 z-30 h-[80]'>
			{/* LOGO / JUDUL - bisa aktifkan jika ingin */}
			{/* <div className="flex items-center gap-2 text-blue-700 font-semibold text-lg">
        <span className="text-2xl font-extrabold tracking-tight">K</span>
        <span>Desa Benteng Gajah</span>
      </div> */}
			<span></span>
			{/* User Dropdown */}
			<div className='relative' ref={dropdownRef}>
				<button
					onClick={() => setIsDropdownOpen(v => !v)}
					className='flex items-center gap-2 px-4 py-2 transition text-white border-none rounded-md bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300'
				>
					<User size={18} />
					<span className='text-sm font-medium'>Admin Panel</span>
				</button>
				{isDropdownOpen && (
					<div className='absolute right-0 mt-2 w-44 bg-white border rounded-lg shadow-lg z-20 animate-fade-in'>

						<button className='w-full'>

							<Link href='/admin/user-profile' className='flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg transition'>
								<UserCircle size={16} />
								Profile
							</Link>
						</button>
						<button
							onClick={handleLogout}
							disabled={isLoggingOut}
							className='flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 rounded-t-lg transition'
						>
							<LogOut size={16} />
							{isLoggingOut ? 'Logging out...' : 'Logout'}
						</button>
					</div>
				)}
			</div>
			<style jsx global>{`
				@keyframes fade-in {
					0% {
						opacity: 0;
						transform: translateY(-8px);
					}
					100% {
						opacity: 1;
						transform: translateY(0);
					}
				}
				.animate-fade-in {
					animation: fade-in 0.15s ease;
				}
			`}</style>
		</header>
	)
}
