"use client";
import Avatar from "@/app/components/profile/avatar";
import { MdEdit } from "react-icons/md";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";

export default function EditPatientProfile() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-white">
      <Header title="Editar Perfil" variant="page" />
      <div className="max-w-md mx-auto w-full min-h-screen flex flex-col px-6 py-6 pb-8">

        <div className="flex flex-col items-center mb-8">
          <Avatar src="null" mode="edit" />
          <span className="text-blue-500 text-sm font-medium mt-3">
            Alterar Foto de Perfil
          </span>
        </div>

        <form
          className="flex-1 flex flex-col gap-5"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-600">
              Nome Completo
            </label>
            <div className="relative">
              <input
                type="text"
                defaultValue="Ricardo Oliveira"
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
              <MdEdit
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex flex-col gap-2 flex-1">
              <label className="text-sm font-semibold text-gray-600">
                Idade
              </label>
              <input
                type="number"
                defaultValue={42}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <label className="text-sm font-semibold text-gray-600">
                Gênero
              </label>
              <select className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 text-gray-900 font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-blue-100">
                <option>Masculino</option>
                <option>Feminino</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-2">
            <label className="text-sm font-semibold text-gray-600">
              Tipo de Diabetes
            </label>
            {/* Componentização dos Radios para manter o código limpo */}
            {["Tipo 1", "Tipo 2", "Gestacional", "Pré-diabetes"].map((tipo) => (
              <label
                key={tipo}
                className="flex items-center gap-3 p-4 rounded-2xl border border-gray-100 bg-white cursor-pointer hover:bg-gray-50"
              >
                <input
                  type="radio"
                  name="diabetesType"
                  value={tipo}
                  defaultChecked={tipo === "Tipo 2"}
                  className="w-5 h-5 accent-blue-600"
                />
                <span className="text-gray-900 font-medium">{tipo}</span>
              </label>
            ))}
          </div>

          <div className="mt-auto pt-6">
            <button className="w-full bg-blue-600 text-white font-bold py-4 rounded-full shadow-lg shadow-blue-600/20 active:scale-[0.98] transition-transform">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
