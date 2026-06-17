"use client";

import Sidebar from "@/components/ui/Sidebar";
import MedicationWatcher from "@/components/features/medications/MedicationWatcher";

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-row">
      {/* Monitoramento global de remédios do paciente */}
      <MedicationWatcher />

      {/* Responsive Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen md:pl-[260px] transition-all duration-300">
        {children}
      </div>
    </div>
  );
}
