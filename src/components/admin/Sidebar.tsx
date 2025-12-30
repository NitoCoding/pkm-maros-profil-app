'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Newspaper, Image, HardDrive, Users, Store, Rocket, Star, Landmark, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: Home },
  { label: 'Profil Desa', href: '/admin/profil', icon: Star },
  { label: 'Umum', href: '/admin/umum', icon: HardDrive },
  { label: 'Berita', href: '/admin/berita', icon: Newspaper },
  { label: 'Galeri', href: '/admin/galeri', icon: Image },
  { label: 'Pegawai', href: '/admin/pegawai', icon: Users },
  { label: 'UMKM', href: '/admin/umkm', icon: Store },
  { label: 'Wisata', href: '/admin/wisata', icon: Landmark },
  { label: 'Inovasi', href: '/admin/inovasi', icon: Rocket },
  { label: 'User', href: '/admin/user', icon: Users },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Deteksi ukuran layar
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      const newIsMobile = width < 768
      setIsMobile(newIsMobile)
      
      // Auto-collapse di desktop jika ukuran layar kecil
      if (!newIsMobile && width < 1024) {
        setIsCollapsed(true)
      } else if (!newIsMobile && width >= 1024) {
        setIsCollapsed(false)
      }
      
      // Tutup mobile menu saat resize ke desktop
      if (!newIsMobile) {
        setIsMobileMenuOpen(false)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileMenuOpen(!isMobileMenuOpen)
    } else {
      setIsCollapsed(!isCollapsed)
    }
  }

  return (
    <>
      <aside
  className={`fixed top-0 left-0 h-full bg-white border-r flex flex-col transition-all duration-300 z-[888] ${
    isMobile
      ? isMobileMenuOpen
        ? 'translate-x-0 w-64'
        : '-translate-x-full w-64'
      : isCollapsed
      ? 'w-16'
      : 'w-64'
  }`}
>
  {/* Brand / Logo dengan Toggle Button */}
  <div className='flex items-center gap-3 px-6 py-6 bg-blue-600 text-white shadow relative'>
    {/* Toggle Button di dalam brand */}
    <button
      onClick={toggleSidebar}
      className={`absolute -right-3 top-6 p-1.5 rounded-full shadow-md transition-all duration-200 ${
        isMobile
          ? 'bg-blue-600 text-white'
          : isCollapsed
          ? 'bg-blue-600 text-white'
          : 'bg-white text-gray-600 hover:bg-gray-100'
      }`}
      aria-label={isMobile ? (isMobileMenuOpen ? 'Tutup menu' : 'Buka menu') : (isCollapsed ? 'Buka sidebar' : 'Tutup sidebar')}
    >
      {isMobile ? (
        isMobileMenuOpen ? <X size={16} /> : <Menu size={16} />
      ) : (
        <Menu size={16} />
      )}
    </button>
    
    <span className='text-2xl font-extrabold tracking-tight'>B</span>
    {(!isCollapsed || isMobile) && <span className='font-bold text-lg'>Desa Benteng Gajah</span>}
  </div>

        {/* Navigation */}
        <nav className='flex-1 py-4 overflow-y-auto'>
          <ul className='space-y-1 px-2'>
            {navItems.map((item) => {
              const isActive =
                item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname.startsWith(item.href)
              const ItemIcon = item.icon
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => {
                      if (isMobile) {
                        setIsMobileMenuOpen(false)
                      }
                    }}
                    className={`flex items-center gap-3 px-4 py-2 rounded-l-lg transition ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 font-semibold shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    title={isCollapsed && !isMobile ? item.label : ''}
                  >
                    <ItemIcon
                      className={`w-5 h-5 flex-shrink-0 ${
                        isActive ? 'text-blue-600' : 'text-gray-400'
                      }`}
                    />
                    {(!isCollapsed || isMobile) && <span>{item.label}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className={`px-6 py-4 border-t text-xs text-gray-400 ${
          (!isCollapsed || isMobile) ? 'block' : 'hidden'
        }`}>
          © {new Date().getFullYear()} Desa Benteng Gajah
        </div>
      </aside>

      {/* Overlay saat sidebar terbuka di mobile */}
      {isMobile && isMobileMenuOpen && (
        <div
          className='fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden'
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}