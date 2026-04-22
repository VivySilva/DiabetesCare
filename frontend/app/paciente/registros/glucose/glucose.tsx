"use client";

import { useRouter } from "next/navigation";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";

export default function CadastroGlicemia() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-white pb-[91px]">
      <Header
        title="Glicemia"
        variant="page"
        onIconClick={() => router.back()}
      />

      <section className="flex flex-col items-start px-[33px] pt-6 gap-6 w-full">
        <div className="flex flex-col gap-2 w-full">
          <h1>Cadastro de Glicemia</h1>
          <p className="m-0 text-cinza-claro-texto">
            Registre seu nível de açúcar no sangue.
          </p>
        </div>

        {/* Formulário de cadastro de glicemia — em breve */}
      </section>

      <Footer />
    </main>
  );
}
