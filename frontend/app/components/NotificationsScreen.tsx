import React from 'react';
import { IoMdArrowBack } from 'react-icons/io';
import { MdMedication, MdVaccines, MdWaterDrop, MdMonitorHeart, MdDirectionsWalk } from 'react-icons/md';

export default function NotificationsScreen() {
  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen pb-10 font-sans">
      {/* Header */}
      <header className="flex items-center p-6 bg-white sticky top-0 z-10">
        <button className="text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors">
          <IoMdArrowBack size={20} />
        </button>
        <h1 className="text-lg font-semibold ml-4 text-gray-900">Notificações</h1>
      </header>

      <main className="px-6 py-4 space-y-8">
        {/* Seção Hoje */}
        <section>
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Hoje</h2>
          <div className="space-y-4">
            
            {/* Card Metformina */}
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-4">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                  <MdMedication size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-blue-700">Hora da Metformina</h3>
                  <p className="text-sm text-gray-500 mt-1">500mg. Tomar com água após o café.</p>
                </div>
              </div>
              <div className="flex gap-3 ml-16">
                <button className="bg-blue-700 text-white text-sm font-medium py-2 px-5 rounded-full hover:bg-blue-800 transition">
                  Confirmar Dose
                </button>
                <button className="bg-gray-100 text-blue-700 text-sm font-medium py-2 px-5 rounded-full hover:bg-gray-200 transition">
                  Adiar
                </button>
              </div>
            </div>

            {/* Card Insulina */}
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex items-start gap-4">
              <div className="bg-indigo-50 p-3 rounded-full text-indigo-400">
                <MdVaccines size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Lembrete de Insulina</h3>
                <p className="text-sm text-gray-500 mt-1">Aplicação de Insulina Basal agendada para daqui a 15 min.</p>
              </div>
            </div>

            {/* Card Medição */}
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-4">
              <div className="flex items-start gap-4">
                <div className="bg-orange-50 p-3 rounded-full text-orange-400">
                  <MdWaterDrop size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">Medição Glicêmica</h3>
                  <p className="text-sm text-gray-500 mt-1">Não esqueça de medir sua glicemia pós-prandial (2h após o almoço).</p>
                </div>
              </div>
              <div className="ml-16">
                <button className="border border-gray-300 text-gray-600 text-sm font-medium py-2 px-5 rounded-full hover:bg-gray-50 transition">
                  Registrar Agora
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* Seção Sugestões Personalizadas */}
        <section>
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Sugestões Personalizadas</h2>
          <div className="space-y-4">
            
            {/* Card Caminhada */}
            <div className="bg-gradient-to-r from-blue-700 to-blue-500 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
              <div className="absolute right-0 top-0 opacity-40 mix-blend-overlay w-1/2 h-full bg-[url('https://images.unsplash.com/photo-1536922246289-88c42f957773?auto=format&fit=crop&q=80&w=400')] bg-cover bg-center"></div>
              <div className="relative z-10">
                <div className="bg-white/20 p-2 rounded-full inline-block mb-3 backdrop-blur-sm">
                   <MdDirectionsWalk size={20} />
                </div>
                <p className="font-medium text-lg leading-tight w-3/4">
                  "Parece que sua glicemia tende a subir às quartas. Que tal uma caminhada leve hoje?"
                </p>
              </div>
            </div>

            {/* Card Hidratação */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
              <MdWaterDrop className="absolute -bottom-6 -right-6 text-gray-50 w-32 h-32" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-blue-50 p-2 rounded-full text-blue-400">
                    <MdWaterDrop size={20} />
                  </div>
                  <h3 className="font-bold text-gray-800 text-sm">Dica de Hidratação</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Beber mais água ajuda no controle glicêmico. <strong>Já bebeu hoje?</strong>
                </p>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-full bg-blue-100 rounded-full overflow-hidden">
                     <div className="h-full bg-blue-500 w-1/2 rounded-full"></div>
                  </div>
                  <span className="text-xs text-blue-500 font-semibold whitespace-nowrap">1.2L / 2.0L</span>
                </div>
              </div>
            </div>

          </div>
        </section>
      </main>
    </div>
  );
}