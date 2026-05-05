'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from './Header';
import {
  MdPersonAdd,
  MdArticle,
  MdEvent,
  MdQuestionAnswer,
  MdCheck,
  MdClose,
} from 'react-icons/md';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type ProfNotifType = 'new_patient' | 'article' | 'appointment' | 'question';

interface ProfNotification {
  id: string;
  type: ProfNotifType;
  title: string;
  description: string;
  time: string;
  hasActions?: boolean;
  actionConfirmLabel?: string;
  actionDismissLabel?: string;
  dismissed?: boolean;
  confirmed?: boolean;
}

interface ProfActivity {
  id: string;
  type: 'like' | 'comment' | 'share';
  description: string;
  time: string;
}

// ─── Dados mockados ───────────────────────────────────────────────────────────

const INITIAL_NOTIFICATIONS: ProfNotification[] = [
  {
    id: '1',
    type: 'new_patient',
    title: 'Novo pedido de vínculo',
    description: 'Ana Lima quer te adicionar como profissional de saúde dela.',
    time: 'Agora',
    hasActions: true,
    actionConfirmLabel: 'Aceitar',
    actionDismissLabel: 'Recusar',
  },
  {
    id: '2',
    type: 'appointment',
    title: 'Lembrete de consulta',
    description: 'Consulta com Carlos Souza amanhã às 14h. Prepare o histórico glicêmico.',
    time: 'Há 30 min',
  },
  {
    id: '3',
    type: 'question',
    title: 'Pergunta no Fórum',
    description: 'Maria Fernanda perguntou: "O que fazer quando a glicemia passa de 300?"',
    time: 'Há 1h',
    hasActions: true,
    actionConfirmLabel: 'Responder',
    actionDismissLabel: 'Ignorar',
  },
];

const RECENT_ACTIVITIES: ProfActivity[] = [
  {
    id: 'a1',
    type: 'like',
    description: '12 pessoas curtiram seu artigo "Controle Glicêmico no Dia a Dia".',
    time: 'Há 2h',
  },
  {
    id: 'a2',
    type: 'comment',
    description: 'João Alves comentou no seu artigo sobre Insulina Basal.',
    time: 'Há 3h',
  },
  {
    id: 'a3',
    type: 'share',
    description: 'Seu artigo foi compartilhado 5 vezes esta semana.',
    time: 'Ontem',
  },
];

// ─── Ícone por tipo ───────────────────────────────────────────────────────────

function NotifIcon({ type }: { type: ProfNotifType }) {
  const map: Record<ProfNotifType, { bg: string; text: string; icon: React.ReactNode }> = {
    new_patient: {
      bg: 'bg-[#DBE1FF]',
      text: 'text-azul',
      icon: <MdPersonAdd size={22} />,
    },
    article: {
      bg: 'bg-[#ECFDF5]',
      text: 'text-verde',
      icon: <MdArticle size={22} />,
    },
    appointment: {
      bg: 'bg-[#FFF3E6]',
      text: 'text-[#F97316]',
      icon: <MdEvent size={22} />,
    },
    question: {
      bg: 'bg-[#F3E8FF]',
      text: 'text-roxo',
      icon: <MdQuestionAnswer size={22} />,
    },
  };

  const { bg, text, icon } = map[type];
  return (
    <div className={`${bg} ${text} p-3 rounded-full flex items-center justify-center flex-shrink-0`}>
      {icon}
    </div>
  );
}

// ─── Ícone de atividade ───────────────────────────────────────────────────────

function activityEmoji(type: ProfActivity['type']) {
  return type === 'like' ? '❤️' : type === 'comment' ? '💬' : '↗️';
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function ProfessionalNotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<ProfNotification[]>(INITIAL_NOTIFICATIONS);

  function confirm(id: string) {
    const notif = notifications.find((n) => n.id === id);
    if (notif?.type === 'question') {
      // Remove a notificação e navega para o post específico do fórum
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      router.push('/professional/forum/1');
      return;
    }
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, confirmed: true } : n))
    );
  }

  function dismiss(id: string) {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  return (
    <div className="min-h-screen bg-azul-fundo pb-8">
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
              {/* Topo */}
              <div className="flex items-start gap-4">
                <NotifIcon type={notif.type} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-texto">{notif.title}</h3>
                    <span className="text-xs text-cinza-claro-texto whitespace-nowrap flex-shrink-0 mt-0.5">
                      {notif.time}
                    </span>
                  </div>
                  <p className="text-cinza-claro-texto mt-0.5">{notif.description}</p>
                </div>
              </div>

              {/* Ações */}
              {notif.hasActions && !notif.confirmed && (
                <div className="flex gap-3 pl-[52px]">
                  <button
                    id={`btn-confirm-${notif.id}`}
                    onClick={() => confirm(notif.id)}
                    className="flex items-center gap-1.5 bg-azul hover:bg-azul-escuro active:scale-95 text-white text-sm font-semibold py-2 px-5 rounded-full transition-all"
                  >
                    <MdCheck size={16} />
                    {notif.actionConfirmLabel}
                  </button>
                  <button
                    id={`btn-dismiss-${notif.id}`}
                    onClick={() => dismiss(notif.id)}
                    className="flex items-center gap-1.5 bg-azul-fundo hover:bg-[#DBE1FF] active:scale-95 text-cinza-fundo text-sm font-semibold py-2 px-5 rounded-full transition-all"
                  >
                    <MdClose size={16} />
                    {notif.actionDismissLabel}
                  </button>
                </div>
              )}

              {notif.confirmed && (
                <div className="pl-[52px]">
                  <span className="inline-flex items-center gap-1.5 text-verde text-sm font-semibold">
                    ✓ Aceito
                  </span>
                </div>
              )}
            </div>
          ))}
        </section>

        {/* ── Atividade Recente ─────────────────────────────────────── */}
        <section className="flex flex-col gap-3">
          <h2 className="text-texto">Atividade Recente</h2>

          {RECENT_ACTIVITIES.map((act) => (
            <div
              key={act.id}
              className="bg-white rounded-3xl p-5 flex items-start gap-4"
              style={{ boxShadow: '0 1px 8px rgba(25,28,30,0.07)' }}
            >
              <div className="bg-azul-fundo p-3 rounded-full flex items-center justify-center flex-shrink-0 text-lg leading-none">
                {activityEmoji(act.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-texto font-medium leading-snug">{act.description}</p>
                  <span className="text-xs text-cinza-claro-texto whitespace-nowrap flex-shrink-0 mt-0.5">
                    {act.time}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </section>

      </main>
    </div>
  );
}
