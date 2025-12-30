export function ErrorState({ error, onRetry }: { error: string; onRetry?: () => void }) {
  return (
    <div className="text-center py-12">
      <p className="text-red-600 mb-4">{error}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-primary">
          Coba Lagi
        </button>
      )}
    </div>
  )
}