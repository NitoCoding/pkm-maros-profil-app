'use client'

import { useEffect, useState } from 'react'
import Sidebar from '@/components/admin/Sidebar'
import Topbar from '@/components/admin/Topbar'
import { Toaster } from 'react-hot-toast'
import { setupAuthListener, isAuthenticated, logout } from '@/libs/auth/token'
import { usePathname, useRouter } from 'next/navigation'

function isMobileOrTablet() {
  if (typeof window === 'undefined') return false

  const ua = navigator.userAgent
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  const isSmallScreen = window.innerWidth < 1024

  const isMobileOrTabletDevice = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)

  return isMobileOrTabletDevice || (isTouchDevice && isSmallScreen)
}

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [showDeviceModal, setShowDeviceModal] = useState(false)

  useEffect(() => {
    const cleanup = setupAuthListener()

    const checkAuthAndDevice = async () => {
      // // console.log('AdminLayout: Checking authentication...')
      const authenticated = await isAuthenticated()
      // // console.log('AdminLayout: Is authenticated?', authenticated)

      if (!authenticated) {
        // // console.log(`AdminLayout: Not authenticated, redirecting to login with redirect=${pathname}`)
        const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`
        return router.push(loginUrl)
      }

      // ✅ Cek: apakah sudah konfirmasi akses non-PC di sesi ini?
      const hasConfirmed = sessionStorage.getItem('admin_device_warning_dismissed')

      // Jika perangkat non-PC dan belum konfirmasi → tampilkan modal
      if (isMobileOrTablet() && !hasConfirmed) {
        setShowDeviceModal(true)
      }
    }

    checkAuthAndDevice()

    return () => {
      cleanup?.()
    }
  }, [router, pathname])

  const handleLogout = () => {
    logout()
    setShowDeviceModal(false)
    router.push('/') // Arahkan ke halaman publik
  }

  const handleContinue = () => {
    // ✅ Simpan ke sessionStorage: jangan tampilkan lagi selama sesi ini
    sessionStorage.setItem('admin_device_warning_dismissed', 'true')
    setShowDeviceModal(false)
  }

  return (
    <>
      {/* Modal Peringatan Akses Non-PC */}
      {showDeviceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl text-center">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Akses Terbatas</h3>
            <p className="text-gray-600 mb-6 text-sm">
              Fitur admin hanya didesain untuk digunakan di <strong>PC/Desktop</strong>. 
              Akses dari perangkat ini tidak disarankan.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700"
              >
                Keluar
              </button>
              <button
                onClick={handleContinue}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
              >
                Lanjutkan (Risiko Sendiri)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Layout Admin */}
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
    </>
  )
}