"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Edit, Trash, Plus, EyeIcon, Loader2, Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useBeritaAdminPaginated } from "@/hooks/useBerita";
import { BeritaAdminFilters } from "@/libs/utils/filterBuilder";
import { toast } from "react-hot-toast";
import { formatDateLong } from "@/libs/utils/date";
import Image from "next/image";
import { beritaKategori } from "@/libs/constant/beritaKategori";
import { KategoriBadge, StatusBadge } from "@/libs/utils/kategoriBadge";

export default function AdminBeritaPage() {
  const [pageSize, setPageSize] = useState(25);

  // Filter state - simple state, no memoization needed!
  const [filters, setFilters] = useState<BeritaAdminFilters>({
    search: '',
    status: 'all',
    kategori: '',
    tanggalMulai: '',
    tanggalAkhir: ''
  });

  // Pass filters directly - hook handles optimization
  const { berita, loading, error, total, page, totalPages, setPage, refresh } = useBeritaAdminPaginated({
    pageSize: pageSize,
    filters: filters
  });

  const [deleting, setDeleting] = useState<number | null>(null);

  const handleDelete = async (id: number, judul: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus berita "${judul}"?`)) return;

    try {
      setDeleting(id);
      const response = await fetch(`/api/berita?id=${id}`, { method: "DELETE" });
      const result = await response.json();

      if (!response.ok) throw new Error(result.error || "Gagal menghapus berita");

      toast.success("Berita berhasil dihapus");
      refresh();
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan saat menghapus berita");
    } finally {
      setDeleting(null);
    }
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      kategori: '',
      tanggalMulai: '',
      tanggalAkhir: ''
    });
  };

  const hasActiveFilters = filters.search || filters.status !== 'all' || filters.kategori || filters.tanggalMulai || filters.tanggalAkhir;

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Berita</h1>
          <p className="text-gray-600">Kelola artikel dan berita Desa</p>
        </div>
        <Link
          href="/admin/berita/add"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Tambah Berita
        </Link>
      </div>

      {/* FILTER SECTION */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        {/* HEADER */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="text-sm font-semibold text-gray-700">
            Filter Berita
          </h3>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <X size={14} />
              Reset
            </button>
          )}
        </div>

        {/* MAIN FILTER */}
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* SEARCH */}
            <div className="relative md:col-span-2">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Cari judul atau ringkasan berita…"
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* STATUS */}
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  status: e.target.value as 'all' | 'published' | 'draft',
                })
              }
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2 border-t">
            {/* KATEGORI */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Kategori
              </label>
              <select
                value={filters.kategori}
                onChange={(e) =>
                  setFilters({ ...filters, kategori: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Semua Kategori</option>
                {beritaKategori.map((kat) => (
                  <option key={kat} value={kat}>
                    {kat}
                  </option>
                ))}
              </select>
            </div>

            {/* TANGGAL MULAI */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Tanggal Mulai
              </label>
              <input
                type="date"
                value={filters.tanggalMulai}
                onChange={(e) =>
                  setFilters({ ...filters, tanggalMulai: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* TANGGAL AKHIR */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Tanggal Akhir
              </label>
              <input
                type="date"
                value={filters.tanggalAkhir}
                onChange={(e) =>
                  setFilters({ ...filters, tanggalAkhir: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* PAGE SIZE */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Data per halaman
              </label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </div>
      </div>


      {/* ERROR */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <p className="font-medium">Gagal memuat data berita</p>
          <p className="text-sm">{error}</p>
          <button onClick={refresh} className="mt-2 text-sm bg-red-100 hover:bg-red-200 px-3 py-1 rounded">
            Coba Lagi
          </button>
        </div>
      )}

      {/* LOADING PERTAMA KALI */}
      {loading && berita.length === 0 && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
          <span className="ml-2 text-gray-600">Memuat data berita...</span>
        </div>
      )}

      {/* KOSONG */}
      {!loading && !error && berita.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-lg mb-4">Belum ada berita yang dibuat</p>
          <Link
            href="/admin/berita/add"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Buat Berita Pertama
          </Link>
        </div>
      )}

      {/* TABEL BERITA */}
      {berita.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-2xl overflow-hidden border-separate border-spacing-0">
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th className="p-3 text-center font-semibold uppercase tracking-wider w-12">
                    #
                  </th>
                  <th className="p-3 text-left font-semibold uppercase tracking-wider">Berita</th>
                  <th className="p-3 text-left font-semibold uppercase tracking-wider">Tags</th>
                  <th className="p-3 text-left font-semibold uppercase tracking-wider">Dibuat</th>
                  <th className="p-3 text-left font-semibold uppercase tracking-wider">Status</th>
                  <th className="p-3 text-center font-semibold uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {berita.map((item, index) => (
                  <tr key={item.id} className="hover:bg-blue-50 transition">
                    <td className="p-3 text-center text-sm text-gray-600 font-medium">
                      {index + 1}
                    </td>
                    <td className="p-3 flex items-center gap-3">
                      <div>
                        <div className="text-sm font-medium text-gray-900 line-clamp-2">{item.judul}</div>
                        <div className="text-xs text-gray-500">{item.slug}</div>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-gray-900">{Array.isArray(item.kategori) ? item.kategori.join(", ") : item.kategori || "-"}</td>
                    <td className="p-3 text-sm text-gray-500">{formatDateLong(item.createdAt)}</td>
                    <td className="p-3">
                      <StatusBadge
                        status={item.status}
                        style="solid"
                      />
                    </td>
                    <td className="p-3 text-sm font-medium w-[10%]">
                      <div className="flex items-center gap-2 justify-center">
                        <Link href={`/berita/${item.slug}`} target="_blank" className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded" title="Lihat">
                          <EyeIcon size={16} />
                        </Link>
                        <Link href={`/admin/berita/edit/${item.id}`} className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded" title="Edit">
                          <Edit size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(item.id, item.judul)}
                          disabled={deleting === item.id}
                          className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded disabled:opacity-50"
                          title="Hapus"
                        >
                          {deleting === item.id ? <Loader2 size={16} className="animate-spin" /> : <Trash size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION & TOTAL ROWS */}
          <div className="p-4 border-t border-gray-200">
            {/* Total Rows Info */}
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-600">
                Menampilkan <span className="font-semibold">{(page - 1) * pageSize + 1}</span> sampai{' '}
                <span className="font-semibold">{Math.min(page * pageSize, total)}</span> dari{' '}
                <span className="font-semibold">{total}</span> berita
              </p>
              <p className="text-sm text-gray-500">
                Halaman <span className="font-semibold">{page}</span> dari {totalPages}
              </p>
            </div>

            {/* Loading */}
            {loading && berita.length > 0 && (
              <div className="flex justify-center items-center py-4">
                <Loader2 className="animate-spin h-5 w-5 text-blue-600" />
                <span className="ml-2 text-gray-600 text-sm">Memuat...</span>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && !loading && (
              <div className="flex justify-center items-center gap-2">
                {/* Previous Button */}
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Halaman Sebelumnya"
                >
                  <ChevronLeft size={16} />
                </button>

                {/* Page Numbers */}
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`min-w-[40px] px-3 py-2 rounded-lg text-sm font-medium transition-colors ${page === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Halaman Selanjutnya"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}