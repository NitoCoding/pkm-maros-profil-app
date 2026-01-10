"use client";
import { useWorkingHours } from "@/hooks/useDashboard";
import { Clock } from "lucide-react";

export default function WorkingHours() {
  const { workingHours, loading, error } = useWorkingHours();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Gagal memuat jam kerja</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
          <Clock className="w-4 h-4 text-orange-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800">Jam Kerja</h3>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Hari Kerja:</span>
          <span className="font-medium text-gray-800">{workingHours.days}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Jam Kerja:</span>
          <span className="font-medium text-gray-800">{workingHours.hours}</span>
        </div>
        {workingHours.note && (
          <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
            <p className="text-sm text-orange-700">{workingHours.note}</p>
          </div>
        )}
      </div>
    </div>
  );
} 