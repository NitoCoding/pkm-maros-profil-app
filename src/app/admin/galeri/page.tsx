"use client";

import Link from "next/link";
import { useState } from "react";
import { IGaleri } from "@/types/galeri";
import { Edit, Trash, Plus, EyeIcon, Loader2 } from "lucide-react";
import { useGaleri } from "@/hooks/useGaleri";
import { getAuthToken } from "@/libs/auth/token";
import { toast } from "react-hot-toast";
import { formatDate } from "@/libs/utils/date";
import PreviewImageButton from "@/components/PreviewImageModal";

export default function AdminGaleriPage() {
  const pageSize = 10;
  const { galeri, loading, error, hasMore, loadMore, refresh } = useGaleri({ pageSize: pageSize });
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string, caption: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus galeri "${caption}"?`)) {
      return;
    }

    try {
      setDeleting(id);
      const token = getAuthToken();

      if (!token) {
        toast.error("Sesi login telah berakhir. Silakan login ulang.");
        return;
      }

      const response = await fetch(`/api/galeri?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal menghapus galeri");
      }

      toast.success("Galeri berhasil dihapus");
      refresh(); // Refresh the list
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan saat menghapus galeri");
      console.error("Error deleting galeri:", error);
    } finally {
      setDeleting(null);
    }
  };

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
      {/* {!loading && !error && ...} */}
      {!loading && !error && galeri.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-lg mb-4">Belum ada galeri yang dibuat</p>
          <Link
            href="/admin/galeri/add"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Buat Galeri Pertama
          </Link>
        </div>
      )}

      {/* TABEL GALERI + LOAD MORE */}
      {galeri.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-2xl overflow-hidden border-separate border-spacing-0">
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th className="p-3 text-center font-semibold uppercase tracking-wider w-12">
                    #
                  </th>
                  <th className="p-3 text-left font-semibold uppercase tracking-wider">Caption</th>
                  <th className="p-3 text-left font-semibold uppercase tracking-wider">Preview</th>
                  <th className="p-3 text-left font-semibold uppercase tracking-wider">Tanggal</th>
                  <th className="p-3 text-left font-semibold uppercase tracking-wider">Tags</th>
                  <th className="p-3 text-center font-semibold uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {galeri.map((item, index) => (
                  <tr key={item.id} className="hover:bg-blue-50 transition">
                    <td className="p-3 text-center text-sm text-gray-600 font-medium">
                      {index + 1}
                    </td>
                    <td className="p-3">
                      <div className="text-sm font-medium text-gray-900 line-clamp-2">
                        {item.caption || "-"}
                      </div>
                      <div className="text-xs text-gray-500">{item.alt}</div>
                    </td>
                    <td className="p-3">
                      <PreviewImageButton gambarUrl={item.src} />
                    </td>
                    <td className="p-3 text-sm text-gray-500">
                      {formatDate(item.createdAt)}
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {item.tags?.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                        {item.tags && item.tags.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{item.tags.length - 3} lainnya
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <Link
                          href="/galeri"
                          target="_blank"
                          className="text-blue-600 hover:text-blue-900"
                          title="Lihat di publik"
                        >
                          <EyeIcon size={18} />
                        </Link>
                        <Link
                          href={`/admin/galeri/edit/${item.id}`}
                          className="text-green-600 hover:text-green-900"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </Link>
                        <button
                          onClick={() => handleDelete(item.id, item.caption || "Galeri ini")}
                          disabled={deleting === item.id}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          title="Hapus"
                        >
                          {deleting === item.id ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <Trash size={18} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* FOOTER: LOADING + TOMBOL LOAD MORE */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            {/* Loading saat ambil data tambahan */}
            {loading && galeri.length > 0 && (
              <div className="flex justify-center items-center py-4">
                <Loader2 className="animate-spin h-6 w-6 text-blue-600" />
                <span className="ml-2 text-gray-600">Memuat galeri lainnya...</span>
              </div>
            )}

            {/* Tombol Load More */}
            {hasMore && !loading && (
              <div className="text-center">
                <button
                  onClick={loadMore}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
                >
                  <Plus size={20} />
                  Muat Galeri Lainnya
                </button>
              </div>
            )}

            {/* Semua data sudah dimuat */}
            {!hasMore && galeri.length > pageSize && (
              <p className="text-center text-gray-500 text-sm py-4">
                Semua galeri telah dimuat
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
