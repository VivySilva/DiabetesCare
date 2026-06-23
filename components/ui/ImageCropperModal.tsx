"use client";

import React, { useState, useRef, useEffect } from "react";
import { MdZoomIn, MdZoomOut, MdCrop } from "react-icons/md";

interface ImageCropperModalProps {
  imageSrc: string;
  onCrop: (croppedImageBase64: string) => void;
  onClose: () => void;
}

export default function ImageCropperModal({ imageSrc, onCrop, onClose }: ImageCropperModalProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // Viewport dimensions (fixed 16:9 ratio)
  const viewWidth = 480;
  const viewHeight = 270;

  // Mouse handlers for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    setPosition({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  // Touch handlers for mobile support
  const handleTouchStart = (e: React.TouchEvent) => {
    isDragging.current = true;
    const touch = e.touches[0];
    dragStart.current = { x: touch.clientX - position.x, y: touch.clientY - position.y };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const touch = e.touches[0];
    setPosition({
      x: touch.clientX - dragStart.current.x,
      y: touch.clientY - dragStart.current.y,
    });
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
  };

  // Perform crop on canvas
  const handleConfirm = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 450;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      // Background color
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, 800, 450);

      // Scale factor from viewport coordinates to canvas coordinates
      const scaleFactor = 800 / viewWidth;

      const cx = 800 / 2;
      const cy = 450 / 2;

      ctx.save();
      // Translate to canvas center
      ctx.translate(cx, cy);
      // Translate by user position offset scaled
      ctx.translate(position.x * scaleFactor, position.y * scaleFactor);
      // Scale by zoom
      ctx.scale(zoom, zoom);

      // Compute display bounds covering the viewport (no white borders)
      const imgRatio = img.width / img.height;
      const viewRatio = viewWidth / viewHeight;
      let drawWidth = viewWidth;
      let drawHeight = viewHeight;

      if (imgRatio > viewRatio) {
        drawHeight = viewHeight;
        drawWidth = viewHeight * imgRatio;
      } else {
        drawWidth = viewWidth;
        drawHeight = viewWidth / imgRatio;
      }

      // Draw centered
      ctx.drawImage(
        img,
        -(drawWidth * scaleFactor) / 2,
        -(drawHeight * scaleFactor) / 2,
        drawWidth * scaleFactor,
        drawHeight * scaleFactor
      );

      ctx.restore();

      const croppedBase64 = canvas.toDataURL("image/jpeg", 0.9);
      onCrop(croppedBase64);
    };
  };

  // Add event listener to stop dragging if mouse leaves window
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      isDragging.current = false;
    };
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl flex flex-col border border-gray-100">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-texto font-bold text-base flex items-center gap-2 m-0" style={{ fontFamily: "var(--font-manrope)" }}>
            <MdCrop size={20} className="text-azul" />
            Ajustar e Recortar Capa
          </h3>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 font-bold text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full transition-colors"
          >
            Fechar
          </button>
        </div>

        {/* Viewport Container */}
        <div className="p-6 bg-gray-50 flex flex-col items-center justify-center gap-4">
          
          <div 
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="relative bg-black rounded-2xl overflow-hidden shadow-inner border border-gray-200 select-none cursor-grab active:cursor-grabbing flex items-center justify-center"
            style={{ width: `${viewWidth}px`, height: `${viewHeight}px`, maxWidth: "100%", aspectRatio: "16/9" }}
          >
            {/* Aspect Ratio Dashed Crop Guide Box */}
            <div className="absolute inset-2 border-2 border-dashed border-white/50 rounded-xl pointer-events-none z-10" />

            <img
              src={imageSrc}
              alt="Preview"
              draggable={false}
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                transformOrigin: "center",
                maxHeight: "none",
                maxWidth: "none",
                width: "100%",
                height: "100%",
                objectFit: "cover",
                pointerEvents: "none"
              }}
            />
          </div>

          <p className="text-[11px] text-cinza-claro-texto text-center font-medium m-0">
            💡 Clique e arraste na imagem acima para centralizar a área desejada.
          </p>
        </div>

        {/* Controls and Slider */}
        <div className="px-6 py-5 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <span className="text-gray-400">
              <MdZoomOut size={20} />
            </span>
            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="flex-1 h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-azul focus:outline-none"
            />
            <span className="text-gray-400">
              <MdZoomIn size={20} />
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-sm font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 active:scale-98 rounded-2xl transition-all border border-gray-100"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 py-3 text-sm font-bold text-white bg-azul hover:bg-azul-escuro active:scale-98 rounded-2xl shadow-md shadow-blue-100 transition-all"
            >
              Confirmar Corte
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
