// CKEditorWrapper.tsx
"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

interface CKEditorWrapperProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

// Dynamic import untuk CKEditor (SSR-safe)
const CKEditorComponent = dynamic(
  async () => {
    const { CKEditor } = await import("@ckeditor/ckeditor5-react");
    const { ClassicEditor } = await import("@/libs/ckeditor"); // Sesuaikan path

    const EditorComponent = ({ value, onChange }: CKEditorWrapperProps) => (
      <CKEditor
        editor={ClassicEditor}
        data={value}
        onChange={(_, editor: any) => {
          const data = editor.getData();
          onChange(data);
        }}
        config={{
          licenseKey: 'GPL', // ← TAMBAHKAN INI
        }}
      />
    );

    EditorComponent.displayName = 'CKEditorComponent';
    
    return EditorComponent;
  },
  {
    ssr: false,
    loading: () => <p>Loading editor...</p>,
  }
);

export default function CKEditorWrapper({
  value,
  onChange,
  placeholder,
}: CKEditorWrapperProps) {
  return <CKEditorComponent value={value} onChange={onChange} />;
}