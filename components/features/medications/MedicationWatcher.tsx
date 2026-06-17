"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { httpClient } from "@/lib/httpClient";
import { motion, AnimatePresence } from "framer-motion";

interface Medication {
  id: string;
  medication_name: string;
  category: string;
  time: string;
  notify: boolean;
}

export default function MedicationWatcher() {
  const pathname = usePathname();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [activeReminder, setActiveReminder] = useState<Medication | null>(null);
  const [snoozedAlarms, setSnoozedAlarms] = useState<Record<string, string>>({}); // ID -> "HH:mm"

  // 1. Busca os medicamentos cadastrados toda vez que muda de página ou a cada 60s
  useEffect(() => {
    const fetchMedications = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await httpClient.get("/medications", token);
        setMedications(res.records || []);
      } catch (e) {
        console.error("Erro ao buscar medicamentos no Watcher:", e);
      }
    };

    fetchMedications();
    const fetchInterval = setInterval(fetchMedications, 60000);

    return () => clearInterval(fetchInterval);
  }, [pathname]);

  // 2. Compara a hora a cada 30 segundos
  useEffect(() => {
    if (medications.length === 0) return;

    const checkMedications = () => {
      const now = new Date();
      // Formatação robusta de HH:mm independente de locale do navegador/sistema operacional
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const currentHHmm = `${hours}:${minutes}`;

      // Formatação robusta de DD/MM/YYYY para a chave do localStorage
      const day = String(now.getDate()).padStart(2, "0");
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const year = now.getFullYear();
      const today = `${day}/${month}/${year}`;

      medications.forEach((med) => {
        const medHHmm = med.time?.substring(0, 5); 
        const snoozeTarget = snoozedAlarms[med.id];

        // Dispara se for o horário programado OU o horário da soneca configurada
        if (medHHmm === currentHHmm || snoozeTarget === currentHHmm) {
          const storageKey = `notified_${med.id}_${today}_${currentHHmm}`;
          
          if (!localStorage.getItem(storageKey)) {
            localStorage.setItem(storageKey, "true");
            
            // Se disparou por causa de uma soneca, limpa o agendamento temporário
            if (snoozeTarget === currentHHmm) {
              setSnoozedAlarms((prev) => {
                const copy = { ...prev };
                delete copy[med.id];
                return copy;
              });
            }

            // Exibe o modal customizado
            setActiveReminder(med);
            
            // Registra a notificação no banco de dados para o sininho
            const token = localStorage.getItem("token");
            if (token) {
               httpClient.post("/notifications", {
                 title: `Hora do Remédio: ${med.medication_name}`,
                 body: `Está na hora da sua dose de ${med.medication_name} (${medHHmm}).`,
                 type: "MEDICATION"
               }, token).catch(e => console.error("Erro ao registrar notificação:", e));
            }
          }
        }
      });
    };

    checkMedications();
    const interval = setInterval(checkMedications, 30000); // Checa a cada 30 segundos

    return () => clearInterval(interval);
  }, [medications, snoozedAlarms]);

  // Função para adiar o alarme por 5 minutos (Soneca)
  const handleSnooze = (med: Medication) => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const snoozeTime = `${hours}:${minutes}`;

    setSnoozedAlarms((prev) => ({
      ...prev,
      [med.id]: snoozeTime,
    }));
    setActiveReminder(null);
  };

  return (
    <AnimatePresence>
      {activeReminder && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveReminder(null)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="relative w-full max-w-sm bg-white rounded-[32px] p-8 flex flex-col items-center text-center shadow-2xl border border-gray-100 z-10"
          >
            {/* Animating Pulsing Pill Icon */}
            <div className="relative mb-6">
              <span className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping scale-150" />
              <div className="relative w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-4xl shadow-inner">
                💊
              </div>
            </div>

            <h3 className="text-2xl font-display font-extrabold text-gray-900 mb-2">
              Hora do Remédio!
            </h3>
            
            <p className="text-gray-500 font-medium text-sm mb-8">
              Está na hora da sua dose de: <br />
              <span className="text-blue-600 font-extrabold text-xl block mt-2 tracking-tight">
                {activeReminder.medication_name}
              </span>
              <span className="text-xs text-gray-400 block mt-2 bg-gray-50 py-1 px-3 rounded-full border border-gray-100 inline-block">
                {activeReminder.category} • Programado: {activeReminder.time?.substring(0, 5)}
              </span>
            </p>

            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={() => setActiveReminder(null)}
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 transition-colors active:scale-[0.98] shadow-lg shadow-blue-500/20 cursor-pointer text-sm"
              >
                Marcar como Tomado
              </button>

              <button
                onClick={() => handleSnooze(activeReminder)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-700 font-bold py-4 rounded-2xl hover:bg-gray-100 transition-colors active:scale-[0.98] cursor-pointer text-sm"
              >
                Soneca (5 min)
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
