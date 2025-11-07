// src/app/admin/umkm/page.tsx
'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Trash, Plus, Edit, Loader2, MapPin, Phone, DollarSign, ExternalLink } from 'lucide-react'
import { IProdukUMKM } from '@/types/umkm' // Menggunakan tipe baru
import { toast } from 'react-hot-toast'
import PreviewImageButton from '@/components/PreviewImageModal'
import { useProdukUMKM } from '@/hooks/useProdukUMKM'

export default function AdminUmkmPage() {
    // Menggunakan hook baru untuk produk UMKM
    const { umkm = [], loading, error, refresh } = useProdukUMKM({ pageSize: 20 });
    const [deleting, setDeleting] = useState<string | null>(null);

	console.log('UMKM Data:', umkm);

    // --- PERBAIKAN: Fungsi delete menggunakan fetch biasa ---
    const handleDelete = async (id: string, nama: string) => {
        if (!confirm(`Apakah Anda yakin ingin menghapus produk "${nama}"?`)) {
            return;
        }

        try {
            setDeleting(id);

            const response = await fetch(`/api/produk-umkm?id=${id}`, {
                method: "DELETE",
            });

            const result = await response.json();

            if (!response.ok) {
                // Jika token tidak valid, middleware akan redirect ke login
                if (response.status === 401) {
                    toast.error('Sesi Anda telah berakhir. Silakan login kembali.');
                    return;
                }
                throw new Error(result.error || "Gagal menghapus produk");
            }

            toast.success("Produk berhasil dihapus");
            refresh();
        } catch (error: any) {
            toast.error(error.message || "Terjadi kesalahan saat menghapus produk");
            console.error("Error deleting produk:", error);
        } finally {
            setDeleting(null);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price)
    }

    // --- PERBAIKAN: Fungsi untuk menampilkan harga ---
    const getPriceRange = (harga: { awal: number; akhir: number }) => {
        if (!harga) return 'Harga tidak tersedia';
        if (harga.awal === harga.akhir || !harga.akhir) {
            return formatPrice(harga.awal);
        }
        return `${formatPrice(harga.awal)} - ${formatPrice(harga.akhir)}`;
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Kelola Produk UMKM</h1>
                    <p className="text-gray-600">
                        Kelola data produk UMKM Desa Benteng Gajah
                    </p>
                </div>
                <Link
                    href="/admin/umkm/add"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
                >
                    <Plus size={20} />
                    Tambah Produk
                </Link>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                    <p className="font-medium">Gagal memuat data produk</p>
                    <p className="text-sm">{error}</p>
                    <button
                        onClick={refresh}
                        className="mt-2 text-sm bg-red-100 hover:bg-red-200 px-3 py-1 rounded transition-colors"
                    >
                        Coba Lagi
                    </button>
                </div>
            )}

            {loading && umkm.length === 0 ? (
                <div className="flex justify-center items-center py-12">
                    <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
                    <span className="ml-2 text-gray-600">Memuat data produk...</span>
                </div>
            ) : umkm.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 text-lg mb-4">
                        Belum ada produk yang ditambahkan
                    </p>
                    <Link
                        href="/admin/umkm/add"
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Tambah Produk Pertama
                    </Link>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white rounded-2xl overflow-hidden border-separate border-spacing-0">
                            <thead>
                                <tr className="bg-blue-600 text-white">
                                    <th className="p-3 font-semibold text-left uppercase tracking-wider">Produk UMKM</th>
                                    <th className="p-3 font-semibold text-left uppercase tracking-wider">Kategori</th>
                                    <th className="p-3 font-semibold text-left uppercase tracking-wider">Gambar</th>
                                    <th className="p-3 font-semibold text-left uppercase tracking-wider">Harga</th>
                                    <th className="p-3 font-semibold text-left uppercase tracking-wider">Kontak</th>
                                    <th className="p-3 font-semibold text-left uppercase tracking-wider">Lokasi</th>
                                    <th className="p-3 font-semibold text-center uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {umkm.map((item, idx) => (
                                    <tr
                                        key={item.id}
                                        className={`hover:bg-blue-50 transition ${
                                            idx === umkm.length - 1
                                                ? ""
                                                : "border-b border-gray-200"
                                        }`}
                                    >
                                        {/* --- PERBAIKAN: Menampilkan nama produk dan UMKM --- */}
                                        <td className="p-3 align-middle">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900 line-clamp-2">
                                                    {item.namaProduk }
                                                </div>
                                                <div className="text-xs text-gray-500 line-clamp-2 mt-1">
                                                    oleh {item.namaUMKM}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-3 align-middle">
                                            <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                                                {item.kategori}
                                            </span>
                                        </td>
                                        <td className="p-3 align-middle">
                                            <PreviewImageButton gambarUrl={item.gambar} />
                                        </td>
                                        {/* --- PERBAIKAN: Menggunakan fungsi harga baru --- */}
                                        <td className="p-3 align-middle">
                                            <div className="flex items-center gap-1">
                                                <DollarSign size={14} className="text-green-600" />
                                                <span className="text-green-600 text-sm">
                                                    {getPriceRange(item.harga)}
                                                </span>
                                            </div>
                                        </td>
                                        {/* --- PERBAIKAN: Mengambil dari objek kontak --- */}
                                        <td className="p-3 align-middle">
                                            <div className="flex items-center gap-1">
                                                <Phone size={14} className="text-gray-500" />
                                                <span className="text-sm text-gray-700">
                                                    {item.kontak.telepon}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-3 align-middle">
                                            <div className="flex items-start gap-1">
                                                <MapPin size={14} className="text-gray-500 mt-0.5" />
                                                <span className="text-sm text-gray-700 line-clamp-2 max-w-[200px]">
                                                    {item.lokasi.alamat}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium w-[10%]">
                                            <div className="flex items-center gap-2">
                                                {/* --- PERBAIKAN: Link ke edit produk --- */}
                                                <Link
                                                    href={`/admin/umkm/edit/${item.id}`}
                                                    className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded transition-colors"
                                                    title="Edit Produk"
                                                >
                                                    <Edit size={16} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(item.id, item.namaProduk)}
                                                    disabled={deleting === item.id}
                                                    className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                                                    title="Hapus Produk"
                                                >
                                                    {deleting === item.id ? (
                                                        <Loader2 size={16} className="animate-spin" />
                                                    ) : (
                                                        <Trash size={16} />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {loading && umkm.length > 0 && (
                <div className="flex justify-center items-center py-4">
                    <Loader2 className="animate-spin h-6 w-6 text-blue-600" />
                    <span className="ml-2 text-gray-600">Memuat data...</span>
                </div>
            )}
        </div>
    )
}