"use client";

import Link from "next/link";
import { useState } from "react";
import { Edit, Trash, Plus, EyeIcon, Loader2 } from "lucide-react";
import { useBeritaAdmin } from "@/hooks/useBerita";
import { toast } from "react-hot-toast";
import { formatDateLong } from "@/libs/utils/date";
import Image from "next/image";

export default function AdminBeritaPage() {
  const { berita, loading, error, refresh } = useBeritaAdmin({ pageSize: 20 });
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
      console.error("Error deleting berita:", error);
    } finally {
      setDeleting(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const base = "px-2 py-1 rounded-full text-xs font-medium";
    return status === "published"
      ? `${base} bg-green-100 text-green-800`
      : `${base} bg-yellow-100 text-yellow-800`;
  };

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Berita</h1>
          <p className="text-gray-600">Kelola artikel dan berita Desa Bilokka</p>
        </div>
        <Link
          href="/admin/berita/add"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Tambah Berita
        </Link>
      </div>

      {/* ERROR HANDLER */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <p className="font-medium">Gagal memuat data berita</p>
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
      {loading && berita.length === 0 ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
          <span className="ml-2 text-gray-600">Memuat data berita...</span>
        </div>
      ) : berita.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-lg mb-4">Belum ada berita yang dibuat</p>
          <Link
            href="/admin/berita/add"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Buat Berita Pertama
          </Link>
        </div>
      ) : (
        // TABEL BERITA
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-2xl overflow-hidden border-separate border-spacing-0">
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th className="p-3 text-left font-semibold uppercase tracking-wider">Berita</th>
                  <th className="p-3 text-left font-semibold uppercase tracking-wider">Kategori</th>
                  {/* <th className="p-3 text-left font-semibold uppercase tracking-wider">Tags</th> */}
                  <th className="p-3 text-left font-semibold uppercase tracking-wider">Dibuat</th>
                  <th className="p-3 text-left font-semibold uppercase tracking-wider">Status</th>
                  <th className="p-3 text-center font-semibold uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {berita.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-blue-50 transition">
                    {/* Judul & Gambar */}
                    <td className="p-3 flex items-center gap-3">
                      {/* {item.gambar && (
                        <Image
                          src={item.gambar}
                          alt={item.judul}
                          width={60}
                          height={40}
                          className="rounded-md object-cover"
                        />
                      )} */}
                      <div>
                        <div className="text-sm font-medium text-gray-900 line-clamp-2">{item.judul}</div>
                        <div className="text-xs text-gray-500">{item.slug}</div>
                      </div>
                    </td>

                    <td className="p-3 text-sm text-gray-900">{item.kategori || "-"}</td>

                    {/* <td className="p-3 text-sm text-gray-700">
                      {Array.isArray(item.tags)
                        ? item.tags.join(", ")
                        : item.tags || "-"}
                    </td> */}

                    <td className="p-3 text-sm text-gray-500">
                      {formatDateLong(item.createdAt)}
                    </td>

                    <td className="p-3">
                      <span className={getStatusBadge(item.status)}>
                        {item.status === "published" ? "Dipublikasi" : "Draft"}
                      </span>
                    </td>

                    {/* Aksi */}
                    <td className="p-3 text-sm font-medium w-[10%]">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/berita/${item.slug}`}
                          target="_blank"
                          className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                          title="Lihat berita"
                        >
                          <EyeIcon size={16} />
                        </Link>
                        <Link
                          href={`/admin/berita/edit/${item.id}`}
                          className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded"
                          title="Edit berita"
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(item.id, item.judul)}
                          disabled={deleting === item.id}
                          className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded disabled:opacity-50"
                          title="Hapus berita"
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
      {loading && berita.length > 0 && (
        <div className="flex justify-center items-center py-4">
          <Loader2 className="animate-spin h-6 w-6 text-blue-600" />
          <span className="ml-2 text-gray-600">Memuat data...</span>
        </div>
      )}
    </div>
  );
}
