"use client";

import React, { useState, useEffect } from "react";
import { MdClose, MdDelete } from "react-icons/md";
import { httpClient } from "@/lib/httpClient";

interface Medication {
  id: string;
  medication_name: string;
  category: string;
  time: string;
  notify: boolean;
}

interface MedicationsModalProps {
  onClose: () => void;
}

export default function MedicationsModal({ onClose }: MedicationsModalProps) {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMedications = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await httpClient.get("/medications", token);
      // API retorna { records: [...] }
      setMedications(res.records || []);
    } catch (err: any) {
      setError("Erro ao buscar medicamentos.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedications();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      await httpClient.delete(`/medications/${id}`, token);
      setMedications((prev) => prev.filter((m) => m.id !== id));
    } catch (err: any) {
      alert("Erro ao remover medicamento.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0">
          <h2 className="text-xl font-bold text-gray-800 m-0">Meus Remédios</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
          >
            <MdClose size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {isLoading ? (
            <p className="text-center text-sm text-gray-400 py-8">Carregando...</p>
          ) : error ? (
            <p className="text-center text-sm text-red-500 py-8">{error}</p>
          ) : medications.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-300">
                💊
              </div>
              <p className="text-gray-500 text-sm font-medium">Você ainda não cadastrou nenhum remédio.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {medications.map((med) => (
                <div
                  key={med.id}
                  className="bg-white border border-gray-100 rounded-[24px] p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 text-xl">
                      💊
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 m-0 text-base">{med.medication_name}</h3>
                      <p className="text-sm text-gray-500 m-0 mt-0.5">
                        {med.category} • {med.time}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(med.id)}
                    className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    title="Remover remédio"
                  >
                    <MdDelete size={22} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
