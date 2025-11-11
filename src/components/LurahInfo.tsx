"use client";
import { useLurah } from "@/hooks/useDashboard";
import Image from "next/image";
import { User } from "lucide-react";

export default function LurahInfo() {
  const { lurah, loading, error } = useLurah();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Gagal memuat informasi lurah</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-4">
        {lurah.photo ? (
          <Image
            src={lurah.photo || 'default-image.png'}
            alt={lurah.name || 'Lurah'}
            className="w-20 h-20 object-cover rounded-full border border-gray-200"
          />
        ) : (
          <div className="w-20 h-20 bg-gray-100 rounded-full border border-gray-200 flex items-center justify-center">
            <User className="w-8 h-8 text-gray-400" />
          </div>
        )}
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800">{lurah.name}</h3>
          <p className="text-gray-600">{lurah.position}</p>
        </div>
      </div>
    </div>
  );
} 