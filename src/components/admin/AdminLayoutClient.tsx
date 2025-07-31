'use client'

import { useEffect } from 'react'
import Sidebar from '@/components/admin/Sidebar'
import Topbar from '@/components/admin/Topbar'
import { Toaster } from 'react-hot-toast'
import { setupAuthListener, isAuthenticated } from '@/libs/auth/token'
import { useRouter } from 'next/navigation'

export default function AdminLayoutClient({children}: {children: React.ReactNode}) {
	const router = useRouter()

	useEffect(() => {
		// Setup auth listener for automatic token refresh
		setupAuthListener()

		// Check if user is authenticated on mount
		if (!isAuthenticated()) {
			router.push('/login')
		}
	}, [router])

	return (
		<div className='flex h-screen bg-gray-100'>
			<Sidebar />
			<div className='flex-1 flex flex-col overflow-hidden'>
				<Topbar />
				<main className='flex-1 overflow-x-hidden overflow-y-auto bg-gray-100'>
					{children}
					<Toaster position="top-right" />
				</main>
			</div>
		</div>
	)
} 