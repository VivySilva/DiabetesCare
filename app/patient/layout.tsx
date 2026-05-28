"use client";

import Sidebar from "@/components/ui/Sidebar";

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-row">
      {/* Responsive Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen md:pl-[260px] transition-all duration-300">
        {children}
      </div>
    </div>
  );
}
