// CKEditorWrapper.tsx
"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

interface CKEditorWrapperProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

// Menggunakan dynamic import untuk memuat komponen CKEditor DAN build editor-nya
// dalam satu blok. Ini adalah pola yang disarankan untuk menghindari masalah SSR
// dan memastikan konstruktor editor tersedia dengan benar.
const Editor = dynamic(
  async () => {
    // Memuat komponen CKEditor dari @ckeditor/ckeditor5-react
    const editorModule = await import("@ckeditor/ckeditor5-react");
    // Memuat build ClassicEditor dari @ckeditor/ckeditor5-build-classic
    const editorBuildModule = await import("@ckeditor/ckeditor5-build-classic");

    // Mengembalikan komponen React yang akan merender CKEditor.
    // Penting: 'editorModule.CKEditor' adalah komponen React-nya,
    // dan 'editorBuildModule.default' adalah konstruktor editor CKEditor 5 itu sendiri.
    return ({ value, onChange }: CKEditorWrapperProps) => (
      <editorModule.CKEditor
        // @ts-ignore - Ignore type mismatch between CKEditor versions
        editor={editorBuildModule.default}
        data={value}
        onChange={(_, editor: any) => {
          const data = editor.getData();
          onChange(data);
        }}
      />
    );
  },
  {
    // Pastikan komponen ini hanya dirender di sisi klien (browser).
    ssr: false,
    // Menampilkan pesan loading saat editor sedang dimuat.
    loading: () => <div>Loading editor...</div>,
  }
);

/**
 * Komponen wrapper untuk CKEditor 5 yang menangani pemuatan dinamis
 * dan integrasi dengan React Hook Form.
 *
 * @param value Konten HTML saat ini untuk editor.
 * @param onChange Fungsi callback yang dipanggil saat konten editor berubah.
 */
export default function CKEditorWrapper({
  value,
  onChange,
  placeholder,
}: CKEditorWrapperProps) {
  // Sekarang, CKEditorWrapper hanya perlu merender komponen 'Editor' yang sudah dimuat secara dinamis.
  // State 'ClassicEditor' dan useEffect untuk memuatnya tidak lagi diperlukan di sini.
  return <Editor value={value} onChange={onChange} />;
}
