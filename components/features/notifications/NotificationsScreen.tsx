"use client";

import { IoMdArrowBack } from 'react-icons/io';
import { MdMedication, MdVaccines, MdWaterDrop, MdCheckCircle } from 'react-icons/md';
import Header from "@/components/ui/Header";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getNotifications, markAllNotificationsRead, markNotificationRead } from "@/services/notifications/notificationService";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  scheduled_for?: string;
  created_at: string;
}

interface NotificationsProps {
  onBack?: () => void;
}

const TYPE_ICON: Record<string, React.ReactNode> = {
  MEDICATION: <MdMedication size={24} />,
  SYSTEM: <MdVaccines size={24} />,
  GLUCOSE: <MdWaterDrop size={24} />,
  APPOINTMENT: <MdCheckCircle size={24} />,
};

const TYPE_COLOR: Record<string, { bg: string; text: string }> = {
  MEDICATION: { bg: 'bg-blue-100', text: 'text-blue-600' },
  SYSTEM: { bg: 'bg-indigo-50', text: 'text-indigo-400' },
  GLUCOSE: { bg: 'bg-orange-50', text: 'text-orange-400' },
  APPOINTMENT: { bg: 'bg-green-50', text: 'text-green-500' },
};

export default function NotificationsScreen({ onBack }: NotificationsProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setIsLoading(false); return; }

    getNotifications(token)
      .then((data) => setNotifications(data?.data?.notifications || data?.notifications || []))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleMarkRead = async (id: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    await markNotificationRead(id, token);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllRead = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    await markAllNotificationsRead(token);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unread = notifications.filter(n => !n.read);
  const read = notifications.filter(n => n.read);

  return (
    <div className="w-full max-w-5xl mx-auto bg-[#F8F9FA] min-h-screen pb-10 font-sans">
      <Header
        title="Notificações"
        variant="page"
        onBackClick={onBack ?? (() => router.back())}
        rightElement={
          unread.length > 0 ? (
            <button
              onClick={handleMarkAllRead}
              className="text-xs text-azul font-bold hover:underline"
            >
              Marcar todas
            </button>
          ) : undefined
        }
      />

      <main className="w-full max-w-5xl mx-auto px-6 md:px-8 mt-6 py-4 space-y-8">
        {isLoading && (
          <div className="py-12 text-center text-gray-400 text-sm">Carregando notificações...</div>
        )}

        {!isLoading && notifications.length === 0 && (
          <div className="py-12 text-center text-gray-400 text-sm">
            Nenhuma notificação por enquanto.
          </div>
        )}

        {unread.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Novas</h2>
            <div className="space-y-4">
              {unread.map((n) => {
                const colors = TYPE_COLOR[n.type] || { bg: 'bg-gray-100', text: 'text-gray-500' };
                return (
                  <div
                    key={n.id}
                    className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-3"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`${colors.bg} ${colors.text} p-3 rounded-full`}>
                        {TYPE_ICON[n.type] || <MdCheckCircle size={24} />}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800">{n.title}</h3>
                        {n.body && <p className="text-sm text-gray-500 mt-1">{n.body}</p>}
                      </div>
                    </div>
                    <div className="ml-16">
                      <button
                        onClick={() => handleMarkRead(n.id)}
                        className="bg-blue-700 text-white text-sm font-medium py-2 px-5 rounded-full hover:bg-blue-800 transition"
                      >
                        Marcar como lida
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {read.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-gray-400 mb-4">Anteriores</h2>
            <div className="space-y-3">
              {read.map((n) => {
                const colors = TYPE_COLOR[n.type] || { bg: 'bg-gray-100', text: 'text-gray-400' };
                return (
                  <div
                    key={n.id}
                    className="bg-white p-4 rounded-3xl border border-gray-50 flex items-start gap-4 opacity-60"
                  >
                    <div className={`${colors.bg} ${colors.text} p-3 rounded-full`}>
                      {TYPE_ICON[n.type] || <MdCheckCircle size={24} />}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-700 text-sm">{n.title}</h3>
                      {n.body && <p className="text-xs text-gray-400 mt-0.5">{n.body}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}