"use client";

import { useState } from "react";

interface YouTubePlayerProps {
  url: string;
  width?: string | number;
  height?: string | number;
  className?: string;
}

export default function YouTubePlayer({
  url,
  width = "100%",
  height = "100%",
  className = "",
}: YouTubePlayerProps) {
  const [videoError, setVideoError] = useState<string | null>(null);
  const [videoReady, setVideoReady] = useState(false);

  // Konversi URL YouTube ke format embed
  const getEmbedUrl = (url: string) => {
    // Jika URL sudah dalam format embed, kembalikan apa adanya
    if (url.includes("youtube.com/embed/")) {
      return url;
    }

    // Konversi URL YouTube biasa ke format embed
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = (match && match[2].length === 11) ? match[2] : null;

    if (!videoId) {
      console.error("Invalid YouTube URL:", url);
      return null;
    }

    return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
  };

  const embedUrl = getEmbedUrl(url);

  // Jika URL tidak valid, tampilkan error
  if (!embedUrl) {
    return (
      <div className={`relative ${className}`} style={{ width, height }}>
        <div className="absolute inset-0 flex items-center justify-center bg-white z-10 rounded-lg">
          <div className="text-center p-4">
            <p className="text-red-600 font-medium mb-2">URL video tidak valid</p>
            <p className="text-gray-600 text-sm">Pastikan URL YouTube yang diberikan benar</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      <div className="aspect-video relative">
        {!videoError ? (
          <iframe
            src={embedUrl}
            width="100%"
            height="100%"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onLoad={() => setVideoReady(true)}
            onError={() => setVideoError("Video tidak dapat dimuat")}
            className="rounded-lg"
            title="YouTube video player"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-white z-10 rounded-lg">
            <div className="text-center p-4">
              <p className="text-red-600 font-medium mb-2">{videoError}</p>
              <button
                onClick={() => {
                  setVideoError(null);
                  setVideoReady(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        )}


        {/* Loading Overlay */}
        {!videoReady && !videoError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10 rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-700 mx-auto mb-3"></div>
              <p className="text-gray-600 text-sm">Memuat video...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}