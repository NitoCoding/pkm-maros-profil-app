"use client";

import Link from "next/link";
import { useState } from "react";
import { IGaleri } from "@/types/galeri";
import { Edit, Trash, Plus, EyeIcon, Loader2, Search, X, ChevronLeft, ChevronRight, Tag } from "lucide-react";
import { useGaleriAdminPaginated } from "@/hooks/useGaleri";
import { toast } from "react-hot-toast";
import { formatDate } from "@/libs/utils/date";
import Image from 'next/image'
import { GaleriAdminFilters, galeriPageSizeOptions } from "@/libs/constant/galeriFilter";

export default function AdminGaleriPage() {
  const [pageSize, setPageSize] = useState(12);
  const [filters, setFilters] = useState<GaleriAdminFilters>({
    search: '',
    tanggalMulai: '',
    tanggalAkhir: ''
  });
  const [deleting, setDeleting] = useState<string | null>(null);

  const { galeri, loading, error, total, page, totalPages, setPage, refresh } =
    useGaleriAdminPaginated({
      pageSize: pageSize,
      filters: filters
    });

  const handleDelete = async (id: string, caption: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus galeri "${caption}"?`)) {
      return;
    }

    try {
      setDeleting(id);
      const response = await fetch(`/api/galeri?id=${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal menghapus galeri");
      }

      toast.success("Galeri berhasil dihapus");
      refresh();
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan saat menghapus galeri");
      console.error("Error deleting galeri:", error);
    } finally {
      setDeleting(null);
    }
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      tanggalMulai: '',
      tanggalAkhir: ''
    });
    setPage(1)
  };

  const hasActiveFilters = filters.search || filters.tanggalMulai || filters.tanggalAkhir;

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Galeri</h1>
          <p className="text-gray-600">Kelola foto dan dokumentasi Desa Benteng Gajah</p>
        </div>
        <Link
          href="/admin/galeri/add"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Tambah Galeri
        </Link>
      </div>

      {/* FILTER SECTION */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        {/* HEADER */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="text-sm font-semibold text-gray-700">
            Filter Galeri
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
                placeholder="Cari caption galeri…"
                value={filters.search}
                onChange={(e) => {
                  setFilters({ ...filters, search: e.target.value })
                  setPage(1)
                }}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* EMPTY untuk layout */}
            <div className="hidden md:block"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2 border-t">
            {/* TANGGAL MULAI */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Tanggal Mulai
              </label>
              <input
                type="date"
                value={filters.tanggalMulai}
                onChange={(e) => {
                  setFilters({ ...filters, tanggalMulai: e.target.value })
                  setPage(1)
                }}
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
                onChange={(e) => {
                  setFilters({ ...filters, tanggalAkhir: e.target.value })
                  setPage(1)
                }}
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
                onChange={(e) => {
                  setPageSize(Number(e.target.value))
                  setPage(1)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {galeriPageSizeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* EMPTY */}
            <div></div>
          </div>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <p className="font-medium">Gagal memuat data galeri</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={refresh}
            className="mt-2 text-sm bg-red-100 hover:bg-red-200 px-3 py-1 rounded transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* LOADING PERTAMA KALI */}
      {loading && galeri.length === 0 && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
          <span className="ml-2 text-gray-600">Memuat data galeri...</span>
        </div>
      )}

      {/* DATA KOSONG */}
      {!loading && !error && galeri.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-lg mb-4">
            {hasActiveFilters ? 'Tidak ada galeri yang cocok dengan filter' : 'Belum ada galeri yang dibuat'}
          </p>
          <Link
            href="/admin/galeri/add"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Buat Galeri Pertama
          </Link>
        </div>
      )}

      {/* GRID GALERI - CARD LAYOUT */}
      {galeri.length > 0 && (
        <>
          {/* Total Info */}
          <div className="mb-4 text-sm text-gray-600">
            Menampilkan <span className="font-semibold">{(page - 1) * pageSize + 1}</span> sampai{' '}
            <span className="font-semibold">{Math.min(page * pageSize, total)}</span> dari{' '}
            <span className="font-semibold">{total}</span> galeri
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            {galeri.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Image */}
                <div className="relative h-48 bg-gray-100">
                  {item.src ? (
                    <Image
                      src={item.src}
                      alt={item.caption || item.alt || 'Galeri'}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      Tidak ada gambar
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  {/* Caption */}
                  <div>
                    <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">
                      {item.caption || '-'}
                    </h3>
                    {item.alt && (
                      <p className="text-xs text-gray-500 line-clamp-1">{item.alt}</p>
                    )}
                  </div>

                  {/* Tags */}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium px-2 py-1 rounded"
                        >
                          <Tag size={10} />
                          {tag}
                        </span>
                      ))}
                      {item.tags.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{item.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Date */}
                  <div className="text-xs text-gray-500">
                    {formatDate(item.createdAt)}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Link
                      href="/galeri"
                      target="_blank"
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      title="Lihat di publik"
                    >
                      <EyeIcon size={14} />
                      Lihat
                    </Link>
                    <Link
                      href={`/admin/galeri/edit/${item.id}`}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      title="Edit"
                    >
                      <Edit size={14} />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(item.id, item.caption || "Galeri ini")}
                      disabled={deleting === item.id}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm disabled:opacity-50"
                      title="Hapus"
                    >
                      {deleting === item.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Trash size={14} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* PAGINATION */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            {/* Loading */}
            {loading && galeri.length > 0 && (
              <div className="flex justify-center items-center py-4">
                <Loader2 className="animate-spin h-5 w-5 text-blue-600" />
                <span className="ml-2 text-gray-600 text-sm">Memuat...</span>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && !loading && (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <p className="text-sm text-gray-600">
                  Halaman <span className="font-semibold">{page}</span> dari {totalPages}
                </p>

                <div className="flex items-center gap-2">
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
                          className={`min-w-[40px] px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            page === pageNum
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
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
