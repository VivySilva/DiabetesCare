"use client";
import { useRouter } from "next/navigation";
import Avatar from "@/app/components/profile/avatar";
import {
  MdArrowBack,
  MdPersonOutline,
  MdWorkOutline,
  MdOutlineContacts,
  MdSave,
} from "react-icons/md";

export default function EditProfessionalProfile() {
  const router = useRouter();

  // Função para simular o salvamento e voltar para a tela de perfil
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui entraria a lógica de enviar para o seu backend futuramente
    console.log("Alterações salvas!");
    router.push("/professional/profile"); // Redireciona de volta para o perfil
  };

  return (
    <main className="min-h-screen bg-white pb-24">
      <div className="max-w-md mx-auto w-full min-h-screen flex flex-col px-6 py-6">
        {/* Header com Botão de Voltar */}
        <header className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="text-gray-900 p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <MdArrowBack size={24} />
          </button>
          <div className="flex-1 flex flex-col items-center mr-8">
            <Avatar mode="edit" size={80} />
            <h1 className="font-bold text-gray-900 mt-3">
              Dr. Ricardo Oliveira
            </h1>
          </div>
        </header>

        <form className="flex flex-col gap-8" onSubmit={handleSave}>
          {/* Seção: Informações Pessoais */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-blue-900 font-bold">
              <MdPersonOutline size={22} className="text-blue-600" />
              <h2 className="text-sm uppercase tracking-wide">
                Informações Pessoais
              </h2>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 ml-1">
                Nome Completo
              </label>
              <input
                type="text"
                defaultValue="Ricardo Oliveira"
                className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-gray-900 font-medium outline-none focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-xs font-bold text-gray-400 ml-1">
                  Idade
                </label>
                <input
                  type="number"
                  defaultValue="42"
                  className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-gray-900 font-medium outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-xs font-bold text-gray-400 ml-1">
                  Gênero
                </label>
                <select className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-gray-900 font-medium outline-none focus:ring-2 focus:ring-blue-100 appearance-none">
                  <option>Masculino</option>
                  <option>Feminino</option>
                  <option>Outro</option>
                </select>
              </div>
            </div>
          </section>

          {/* Seção: Informações Profissionais */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-blue-900 font-bold">
              <MdWorkOutline size={22} className="text-blue-600" />
              <h2 className="text-sm uppercase tracking-wide">
                Informações Profissionais
              </h2>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 ml-1">
                Formação Acadêmica
              </label>
              <textarea
                defaultValue="USP - Residência em endocrinologia"
                className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-gray-900 font-medium outline-none focus:ring-2 focus:ring-blue-100 resize-none h-24"
              />
            </div>
          </section>

          {/* Seção: Contato e Localização */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-blue-900 font-bold">
              <MdOutlineContacts size={22} className="text-blue-600" />
              <h2 className="text-sm uppercase tracking-wide">
                Contato e Localização
              </h2>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 ml-1">
                E-mail Profissional
              </label>
              <input
                type="email"
                defaultValue="ricardo.med@diabetescare.com"
                className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-gray-900 font-medium outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 ml-1">
                Telefone / WhatsApp
              </label>
              <input
                type="text"
                defaultValue="(11) 98888-7777"
                className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-gray-900 font-medium outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 ml-1">
                Endereço da Clínica
              </label>
              <input
                type="text"
                defaultValue="Av. Paulista, 1500 - Conj. 12 - Bela Vista, São Paulo"
                className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-gray-900 font-medium outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </section>

          {/* Botão Salvar Fixo no Rodapé */}
          <div className="fixed bottom-6 left-0 right-0 px-6 flex justify-center pointer-events-none">
            <button
              type="submit"
              className="w-full max-w-md bg-blue-600 text-white font-bold py-4 rounded-full shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 pointer-events-auto active:scale-95 transition-transform"
            >
              <MdSave size={20} />
              <span>Salvar Alterações</span>
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
