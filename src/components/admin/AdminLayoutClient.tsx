'use client'

import { useEffect } from 'react'
import Sidebar from '@/components/admin/Sidebar'
import Topbar from '@/components/admin/Topbar'
import { Toaster } from 'react-hot-toast'
import { setupAuthListener, isAuthenticated, logout } from '@/libs/auth/token'
import { usePathname, useRouter } from 'next/navigation'

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
	const router = useRouter()
	const pathname = usePathname()

	useEffect(() => {
		// Setup auth listener for automatic token refresh
		const cleanup = setupAuthListener()

		// Check if user is authenticated on mount
		const checkAuth = async () => {
			// Tambahkan log untuk debugging
			console.log('AdminLayout: Checking authentication...');

			const authenticated = await isAuthenticated()

			console.log('AdminLayout: Is authenticated?', authenticated);
			

			if (!authenticated) {
				console.log(`AdminLayout: Not authenticated, redirecting to login with redirect=${pathname}`);
				const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`
				router.push(loginUrl)
			}
		}

		checkAuth();

		// Cleanup interval on unmount
		return cleanup
	}, [router,pathname])



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