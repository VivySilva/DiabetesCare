"use client";
import { useState, useRef } from "react";
import Image from "next/image";
import { MdEdit, MdPhotoCamera, MdPerson } from "react-icons/md";

interface AvatarProps {
  src?: string | null;
  mode: "view" | "edit";
  size?: number;
  onImageSelected?: (file: File) => void;
}

export default function Avatar({
  src,
  mode,
  size = 100,
  onImageSelected,
}: AvatarProps) {
  const [preview, setPreview] = useState<string | null>(src || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      if (onImageSelected) {
        onImageSelected(file);
      }
    }
  };

  const triggerFileInput = () => {
    if (mode === "edit") {
      fileInputRef.current?.click();
    }
  };

  // 👇 AQUI ESTÁ A CORREÇÃO:
  // Só consideramos a imagem válida se o preview existir e não for a palavra "null"
  const hasValidImage = preview && preview !== "null";

  return (
    <div className="relative flex justify-center">
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      <div
        className={`rounded-full overflow-hidden border-4 border-white shadow-sm flex items-center justify-center bg-gray-100 ${
          mode === "edit"
            ? "cursor-pointer hover:opacity-90 transition-opacity"
            : ""
        }`}
        style={{ width: size, height: size }}
        onClick={triggerFileInput}
      >
        {/* 👇 SE TIVER IMAGEM VÁLIDA, MOSTRA A FOTO. SENÃO, MOSTRA O ÍCONE */}
        {hasValidImage ? (
          <Image
            src={preview}
            alt="Foto de perfil"
            width={size}
            height={size}
            className="object-cover w-full h-full"
          />
        ) : (
          <MdPerson size={size * 0.6} className="text-gray-400" />
        )}
      </div>

      {mode === "edit" ? (
        <button
          type="button"
          onClick={triggerFileInput}
          className="absolute bottom-0 right-1/2 translate-x-[40px] bg-blue-600 w-9 h-9 rounded-full flex items-center justify-center border-2 border-white text-white shadow-md transition-transform hover:scale-105 z-10"
        >
          <MdPhotoCamera size={18} />
        </button>
      ) : (
        <div className="absolute bottom-0 right-1/2 translate-x-[40px] bg-blue-600 w-9 h-9 rounded-full flex items-center justify-center border-2 border-white text-white shadow-md">
          <MdEdit size={18} />
        </div>
      )}
    </div>
  );
}
