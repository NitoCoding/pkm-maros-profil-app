"use client";
import { useHero } from "@/hooks/useDashboard";

export default function HeroImage() {
  const { hero, loading, error } = useHero();

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
        <p className="text-red-600">Gagal memuat gambar hero</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-64 md:h-96 overflow-hidden rounded-lg">
      {hero.image ? (
        <img
          src={hero.image}
          alt="Hero"
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{hero.title}</h1>
            <p className="text-lg md:text-xl opacity-90">{hero.subtitle}</p>
          </div>
        </div>
      )}
      
      {hero.image && (
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{hero.title}</h1>
            <p className="text-lg md:text-xl opacity-90">{hero.subtitle}</p>
          </div>
        </div>
      )}
    </div>
  );
} 