"use client";
import { useContact } from "@/hooks/useDashboard";
import { Phone, Mail, MapPin } from "lucide-react";

export default function ContactInfo() {
  const { contact, loading, error } = useContact();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Gagal memuat informasi kontak</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
          <Phone className="w-4 h-4 text-purple-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800">Informasi Kontak</h3>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Phone className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-sm text-gray-600">Telepon</p>
            <p className="font-medium text-gray-800">{contact.phone}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Mail className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="font-medium text-gray-800">{contact.email}</p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
          <div>
            <p className="text-sm text-gray-600">Alamat</p>
            <p className="font-medium text-gray-800 text-sm">{contact.address}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 