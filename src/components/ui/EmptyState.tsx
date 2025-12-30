export function EmptyState({ title, message, emoji = '📭' }: { title: string; message: string, emoji?: string }) {
  return (
    <div className="text-center py-16">
      <div className="text-6xl mb-4">{emoji}</div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600">{message}</p>
    </div>
  )
}