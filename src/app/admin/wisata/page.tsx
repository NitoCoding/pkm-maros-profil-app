"use client";

import Link from "next/link";
import { useState } from "react";
import { Edit, Trash, Plus, EyeIcon, Loader2 } from "lucide-react";
import { useWisataAdmin } from "@/hooks/useWisata";
import { toast } from "react-hot-toast";
import { formatDateLong } from "@/libs/utils/date";
import Image from "next/image";

export default function AdminWisataPage() {
  const { wisata, loading, error, refresh } = useWisataAdmin({ pageSize: 20 });
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string, nama: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus wisata "${nama}"?`)) return;

    try {
      setDeleting(id);
      const response = await fetch(`/api/wisata?id=${id}`, { method: "DELETE" });
      const result = await response.json();

      if (!response.ok) throw new Error(result.message || "Gagal menghapus wisata");

      toast.success("Wisata berhasil dihapus");
      refresh();
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan saat menghapus wisata");
      console.error("Error deleting wisata:", error);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Wisata</h1>
          <p className="text-gray-600">Kelola destinasi wisata Desa</p>
        </div>
        <Link
          href="/admin/wisata/add"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Tambah Wisata
        </Link>
      </div>

      {/* ERROR HANDLER */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <p className="font-medium">Gagal memuat data wisata</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={refresh}
            className="mt-2 text-sm bg-red-100 hover:bg-red-200 px-3 py-1 rounded transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* LOADING */}
      {loading && wisata.length === 0 ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
          <span className="ml-2 text-gray-600">Memuat data wisata...</span>
        </div>
      ) : wisata.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-lg mb-4">Belum ada wisata yang dibuat</p>
          <Link
            href="/admin/wisata/add"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Buat Wisata Pertama
          </Link>
        </div>
      ) : (
        // TABEL WISATA
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-2xl overflow-hidden border-separate border-spacing-0">
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th className="p-3 text-left font-semibold uppercase tracking-wider">Wisata</th>
                  <th className="p-3 text-left font-semibold uppercase tracking-wider">Lokasi</th>
                  <th className="p-3 text-left font-semibold uppercase tracking-wider">Tags</th>
                  <th className="p-3 text-left font-semibold uppercase tracking-wider">Dibuat</th>
                  <th className="p-3 text-center font-semibold uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {wisata.map((item) => (
                  <tr key={item.id} className="hover:bg-blue-50 transition">
                    {/* Nama & Gambar */}
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        {item.gambar && item.gambar.length > 0 && (
                          <Image
                            src={item.gambar[0]}
                            alt={item.nama}
                            width={60}
                            height={40}
                            className="rounded-md object-cover"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900 line-clamp-2">{item.nama}</div>
                          <div className="text-xs text-gray-500">{item.slug}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3 text-sm text-gray-900">
                      {item.lokasiLink ? (
                        <a
                          href={item.lokasiLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-900 underline"
                        >
                          Lihat Maps
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>

                    <td className="p-3 text-sm text-gray-700">
                      {Array.isArray(item.tags) && item.tags.length > 0
                        ? item.tags.slice(0, 3).join(", ") + (item.tags.length > 3 ? "..." : "")
                        : "-"}
                    </td>

                    <td className="p-3 text-sm text-gray-500">
                      {formatDateLong(item.createdAt || "")}
                    </td>

                    {/* Aksi */}
                    <td className="p-3 text-sm font-medium w-[10%]">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/potensi/wisata/${item.slug}`}
                          target="_blank"
                          className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                          title="Lihat wisata"
                        >
                          <EyeIcon size={16} />
                        </Link>
                        <Link
                          href={`/admin/wisata/edit/${item.id}`}
                          className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded"
                          title="Edit wisata"
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(item.id, item.nama)}
                          disabled={deleting === item.id}
                          className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded disabled:opacity-50"
                          title="Hapus wisata"
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

      {/* LOADING SAAT REFRESH */}
      {loading && wisata.length > 0 && (
        <div className="flex justify-center items-center py-4">
          <Loader2 className="animate-spin h-6 w-6 text-blue-600" />
          <span className="ml-2 text-gray-600">Memuat data...</span>
        </div>
      )}
    </div>
  );
}