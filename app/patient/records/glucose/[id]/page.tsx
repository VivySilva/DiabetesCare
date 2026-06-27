"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { httpClient } from "@/lib/httpClient";
import GlucoseRecordForm from "@/components/features/glucose/GlucoseRecordForm";

export default function EditGlicemiaPage() {
  const router = useRouter();
  const params = useParams();
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecord = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }
      
      const id = params?.id as string;
      if (!id) return;

      try {
        const response = await httpClient.get(`/glucose/${id}`, token);
        if (response?.record) {
          setInitialData(response.record);
        } else {
          alert("Registro não encontrado.");
          router.push("/patient");
        }
      } catch (err) {
        console.error("Erro ao buscar registro:", err);
        alert("Não foi possível carregar o registro.");
        router.push("/patient");
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();
  }, [params, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8F9FA]">
        <p className="text-gray-500 font-medium">Carregando registro...</p>
      </div>
    );
  }

  return <GlucoseRecordForm initialData={initialData} />;
}
