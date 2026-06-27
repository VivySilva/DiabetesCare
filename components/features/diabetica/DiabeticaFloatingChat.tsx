"use client";

import React, { useState } from 'react';
import DiabeticaChat from './DiabeticaChat';

export default function DiabeticaFloatingChat() {
  const [showChat, setShowChat] = useState(false);

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setShowChat(!showChat)}
        className="fixed right-6 bottom-24 md:bottom-6 z-50 w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300"
        aria-label="Abrir Diabetica Chat"
      >
        {showChat ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <div className="relative">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              <line x1="12" y1="8" x2="12" y2="14" />
              <line x1="9" y1="11" x2="15" y2="11" />
            </svg>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse" style={{ animationDuration: "3s" }} />
          </div>
        )}
      </button>

      {/* Chat Popover */}
      {showChat && (
        <div className="fixed z-50 w-[92vw] md:w-[420px] bottom-40 md:bottom-24 right-4 md:right-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-100/80">
              <DiabeticaChat />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
