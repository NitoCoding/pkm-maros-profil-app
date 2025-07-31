import { Metadata } from 'next'
import AdminLayoutClient from '@/components/admin/AdminLayoutClient'

// Metadata untuk semua halaman admin
export const metadata: Metadata = {
	title: 'Admin',
	description: 'Halaman Administrasi Web Kelurahan Bilokka',
	keywords: 'admin, kelurahan, bilokka, administrasi',
	robots: 'noindex, nofollow', // Admin pages tidak boleh di-index
}

export default function AdminLayout({children}: {children: React.ReactNode}) {
	return <AdminLayoutClient>{children}</AdminLayoutClient>
}