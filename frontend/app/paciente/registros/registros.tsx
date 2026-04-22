"use client";

import { useRouter } from "next/navigation";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default function Registros() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-white pb-[91px]">
      <Header
        title="Registros"
        variant="page"
        onIconClick={() => router.back()}
      />

      <section className="flex flex-col items-center px-[33px] pt-6 gap-6">
        {/* Título da tela */}
        <div className="flex flex-col items-start gap-2 w-[342px]">
          <h1>Central de Registros</h1>
          <p className="m-0 text-cinza-claro-texto">
            Selecione uma categoria para registrar seus dados de saúde.
          </p>
        </div>

        {/* Próximas telas:
            - Registro de glicemia
            - Registro de remédios
        */}
      </section>

      <Footer />
    </main>
  );
}
