"use client";

import Sidebar from "@/components/ui/Sidebar";
import DiabeticaFloatingChat from "@/components/features/diabetica/DiabeticaFloatingChat";

export default function ProfessionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-row min-w-0">
      {/* Responsive Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen md:pl-[260px] transition-all duration-300 min-w-0">
        {children}
      </div>

      {/* Diabetica AI Floating Chat (accessible from all professional pages) */}
      <DiabeticaFloatingChat />
    </div>
  );
}
