import { Loader2 } from "lucide-react";

export function LoadMoreButton({ loading, hasMore, onClick, label }: { loading: boolean; hasMore: boolean; onClick: () => void , label?: string}) {
  if (!hasMore) return <p className="text-center text-gray-500 mt-8">Semua data telah dimuat</p>
  
  return (
    <div className="text-center mt-12">
      <button
        onClick={onClick}
        disabled={loading}
        type="button"
        className="btn-primary inline-flex items-center gap-2 disabled:opacity-50"
      >
        {loading && <Loader2 className="h-5 w-5 animate-spin" />}
        {loading ? "Memuat..." : label || "Muat Lagi"}
      </button>
    </div>
  )
}