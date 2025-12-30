import { Loader2 } from "lucide-react";

export function LoadingState({ message = "Memuat..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      <p className="mt-3 text-gray-600">{message}</p>
    </div>
  )
}