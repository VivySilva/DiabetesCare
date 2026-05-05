'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from './Header';
import {
  MdMedication,
  MdVaccines,
  MdWaterDrop,
  MdDirectionsWalk,
} from 'react-icons/md';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type NotificationType = 'medication' | 'insulin' | 'glucose' | 'hydration' | 'walk';

interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  confirmed?: boolean;
  hasConfirmAction?: boolean;
  hasRegisterAction?: boolean;
  actionLabel?: string;
}

interface Suggestion {
  id: string;
  type: 'walk' | 'hydration';
  title: string;
  description: string;
  boldPart?: string;
  progress?: number;
  progressLabel?: string;
}

// ─── Dados mockados ───────────────────────────────────────────────────────────

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: '1',
    type: 'medication',
    title: 'Hora da Metformina',
    description: '500mg. Tomar com água após o café.',
    hasConfirmAction: true,
    confirmed: false,
  },
  {
    id: '2',
    type: 'insulin',
    title: 'Lembrete de Insulina',
    description: 'Aplicação de Insulina Basal agendada para daqui a 15 min.',
  },
  {
    id: '3',
    type: 'glucose',
    title: 'Medição Glicêmica',
    description: 'Não esqueça de medir sua glicemia pós-prandial (2h após o almoço).',
    hasRegisterAction: true,
    actionLabel: 'Registrar Agora',
  },
];

const SUGGESTIONS: Suggestion[] = [
  {
    id: 's1',
    type: 'walk',
    title: 'Sugestão de Atividade',
    description:
      '"Parece que sua glicemia tende a subir às quartas. Que tal uma caminhada leve hoje?"',
  },
  {
    id: 's2',
    type: 'hydration',
    title: 'Dica de Hidratação',
    description: 'Beber mais água ajuda no controle glicêmico.',
    boldPart: 'Já bebeu hoje?',
    progress: 60,
    progressLabel: '1.2L / 2.0L',
  },
];

// ─── Ícone por tipo ───────────────────────────────────────────────────────────

function NotifIcon({ type }: { type: NotificationType }) {
  const map: Record<NotificationType, { bg: string; text: string; icon: React.ReactNode }> = {
    medication: {
      bg: 'bg-[#DBE1FF]',
      text: 'text-azul',
      icon: <MdMedication size={22} />,
    },
    insulin: {
      bg: 'bg-[#EEF0FF]',
      text: 'text-[#6366F1]',
      icon: <MdVaccines size={22} />,
    },
    glucose: {
      bg: 'bg-[#FFF3E6]',
      text: 'text-[#F97316]',
      icon: <MdWaterDrop size={22} />,
    },
    hydration: {
      bg: 'bg-[#DBE1FF]',
      text: 'text-azul',
      icon: <MdWaterDrop size={22} />,
    },
    walk: {
      bg: 'bg-white/20',
      text: 'text-white',
      icon: <MdDirectionsWalk size={22} />,
    },
  };

  const { bg, text, icon } = map[type];
  return (
    <div className={`${bg} ${text} p-3 rounded-full flex items-center justify-center flex-shrink-0`}>
      {icon}
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);

  function confirmDose(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, confirmed: true } : n))
    );
  }

  function dismissNotification(id: string) {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  return (
    <div className="min-h-screen bg-azul-fundo pb-8">
      {/* Header padrão do projeto */}
      <Header
        title="Notificações"
        variant="page"
        onIconClick={() => router.back()}
      />

      <main className="px-[33px] pt-4 flex flex-col gap-8">

        {/* ── Hoje ─────────────────────────────────────────────────── */}
        <section className="flex flex-col gap-3">
          <h2 className="text-texto">Hoje</h2>

          {notifications.map((notif) => (
            <div
              key={notif.id}
              className="bg-white rounded-3xl p-5 flex flex-col gap-4"
              style={{ boxShadow: '0 1px 8px rgba(25,28,30,0.07)' }}
            >
              {/* Topo: ícone + textos */}
              <div className="flex items-start gap-4">
                <NotifIcon type={notif.type} />
                <div className="flex-1 min-w-0">
                  <h3
                    className={
                      notif.type === 'medication' ? 'text-azul-escuro' : 'text-texto'
                    }
                  >
                    {notif.title}
                  </h3>
                  <p className="text-cinza-claro-texto mt-0.5">{notif.description}</p>
                </div>
              </div>

              {/* Ações */}
              {notif.hasConfirmAction && !notif.confirmed && (
                <div className="flex gap-3 pl-[52px]">
                  <button
                    id={`btn-confirmar-${notif.id}`}
                    onClick={() => confirmDose(notif.id)}
                    className="bg-azul hover:bg-azul-escuro active:scale-95 text-white text-sm font-semibold py-2 px-5 rounded-full transition-all"
                  >
                    Confirmar Dose
                  </button>
                  <button
                    id={`btn-adiar-${notif.id}`}
                    onClick={() => dismissNotification(notif.id)}
                    className="bg-azul-fundo hover:bg-[#DBE1FF] active:scale-95 text-azul text-sm font-semibold py-2 px-5 rounded-full transition-all border border-transparent"
                  >
                    Adiar
                  </button>
                </div>
              )}

              {notif.hasConfirmAction && notif.confirmed && (
                <div className="pl-[52px]">
                  <span className="inline-flex items-center gap-1.5 text-verde text-sm font-semibold">
                    ✓ Dose confirmada
                  </span>
                </div>
              )}

              {notif.hasRegisterAction && (
                <div className="pl-[52px]">
                  <button
                    id={`btn-registrar-${notif.id}`}
                    onClick={() => router.push('/patient/records')}
                    className="border border-cinza-claro-fundo text-cinza-fundo hover:bg-cinza-escuro-fundo active:scale-95 text-sm font-semibold py-2 px-5 rounded-full transition-all"
                  >
                    {notif.actionLabel}
                  </button>
                </div>
              )}
            </div>
          ))}
        </section>

        {/* ── Sugestões Personalizadas ──────────────────────────────── */}
        <section className="flex flex-col gap-3">
          <h2 className="text-texto">Sugestões Personalizadas</h2>

          {SUGGESTIONS.map((sug) => {
            if (sug.type === 'walk') {
              return (
                <div
                  key={sug.id}
                  className="relative rounded-3xl overflow-hidden"
                  style={{ minHeight: '160px' }}
                >
                  {/* Imagem de fundo */}
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage:
                        "url('https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600')",
                    }}
                  />
                  {/* Overlay azul escuro */}
                  <div className="absolute inset-0 bg-azul-escuro/80" />

                  {/* Conteúdo */}
                  <div className="relative z-10 p-6 flex flex-col gap-3">
                    <div className="bg-white/20 backdrop-blur-sm p-2.5 rounded-full inline-flex w-fit text-white">
                      <MdDirectionsWalk size={20} />
                    </div>
                    <p className="text-white font-semibold leading-snug w-4/5">
                      {sug.description}
                    </p>
                  </div>
                </div>
              );
            }

            if (sug.type === 'hydration') {
              return (
                <div
                  key={sug.id}
                  className="bg-white rounded-3xl p-5 flex flex-col gap-3 relative overflow-hidden"
                  style={{ boxShadow: '0 1px 8px rgba(25,28,30,0.07)' }}
                >
                  {/* Ícone decorativo de fundo */}
                  <MdWaterDrop className="absolute -bottom-6 -right-4 text-azul-fundo opacity-60 w-28 h-28" />

                  <div className="flex items-center gap-3">
                    <div className="bg-[#DBE1FF] text-azul p-2.5 rounded-full flex-shrink-0">
                      <MdWaterDrop size={20} />
                    </div>
                    <h3 className="text-texto">{sug.title}</h3>
                  </div>

                  <p className="text-cinza-claro-texto text-sm relative z-10">
                    {sug.description}{' '}
                    {sug.boldPart && (
                      <strong className="text-texto">{sug.boldPart}</strong>
                    )}
                  </p>

                  {sug.progress !== undefined && (
                    <div className="flex items-center gap-2 relative z-10">
                      <div className="flex-1 h-1.5 bg-[#DBE1FF] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-azul rounded-full transition-all"
                          style={{ width: `${sug.progress}%` }}
                        />
                      </div>
                      <span className="text-azul text-xs font-bold whitespace-nowrap">
                        {sug.progressLabel}
                      </span>
                    </div>
                  )}
                </div>
              );
            }

            return null;
          })}
        </section>
      </main>
    </div>
  );
}