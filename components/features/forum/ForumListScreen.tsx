"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MdSearch, MdChatBubbleOutline, MdThumbUp, MdCheckCircle, MdAdd, MdDelete } from 'react-icons/md';
import { getForumTopics, likeForumTopic, unlikeForumTopic, deleteForumTopic } from "@/services/forum/forumService";
import { useForumTopicsRealtime } from "@/lib/hooks/useForumRealtime";
import DeleteConfirmationModal from "@/components/ui/modals/delete-confirmation-modal";

interface ForumTopic {
  id: string;
  title: string;
  preview: string;
  time?: string;
  replies_count: number;
  likes_count: number;
  is_moderated: boolean;
  created_at: string;
  author_id?: string;
  users?: { id?: string | null; name: string; avatar_url?: string | null; role: string; specialty?: string | null; is_professional?: boolean };
}

interface ForumListProps {
  onTopicClick: (id: string) => void;
  onCreateClick?: () => void;
  role: 'patient' | 'professional';
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m atrás`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  return `${days}d atrás`;
}

export default function ForumListScreen({ onTopicClick, onCreateClick, role }: ForumListProps) {
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [filtered, setFiltered] = useState<ForumTopic[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [topicToDelete, setTopicToDelete] = useState<string | null>(null);
  const [isDeletingTopic, setIsDeletingTopic] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(payload.id);
      } catch (e) {
        console.error("Erro ao decodificar token", e);
      }
    }
  }, []);

  useEffect(() => {
    async function fetchTopics() {
      try {
        const data = await getForumTopics();
        setTopics(data.topics || []);
        setFiltered(data.topics || []);
      } catch (err: any) {
        setError('Erro ao carregar tópicos do fórum.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchTopics();
  }, []);

  const refreshTopics = async () => {
    try {
      const data = await getForumTopics();
      setTopics(data.topics || []);
    } catch (err) {
      console.error("Erro ao recarregar tópicos em tempo real", err);
    }
  };

  // Real-time listener for forum topics
  useForumTopicsRealtime(
    () => {
      // Novo tópico inserido - recarrega para buscar as fotos/nomes de autor
      refreshTopics();
    },
    () => {
      // Tópico atualizado (likes, respostas, etc) - recarrega para dados precisos
      refreshTopics();
    },
    (topicId) => {
      // Tópico deletado
      setTopics(prev => prev.filter(t => t.id !== topicId));
    }
  );

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(topics);
    } else {
      setFiltered(
        topics.filter(t =>
          t.title.toLowerCase().includes(search.toLowerCase()) ||
          t.preview?.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [search, topics]);

  const handleLike = async (e: React.MouseEvent, topicId: string) => {
    e.stopPropagation(); // Não abre o tópico ao clicar no like
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await likeForumTopic(topicId, token);
      setTopics(prev => prev.map(t =>
        t.id === topicId ? { ...t, likes_count: res.likes_count } : t
      ));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, topicId: string) => {
    e.stopPropagation();
    setTopicToDelete(topicId);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!topicToDelete) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setIsDeletingTopic(true);
      await deleteForumTopic(topicToDelete, token);
      setTopics(prev => prev.filter(t => t.id !== topicToDelete));
      setIsDeleteModalOpen(false);
      setTopicToDelete(null);
    } catch (err: any) {
      setError(err.message || 'Erro ao apagar tópico.');
    } finally {
      setIsDeletingTopic(false);
    }
  };

  return (
    <div className="w-full flex flex-col font-sans">
      {/* Create Topic Button - Now above Search */}
      {onCreateClick && (
        <div className="px-6 pt-6 pb-2">
          <button
            onClick={onCreateClick}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-[20px] shadow-lg shadow-blue-200 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <MdAdd size={24} />
            <span>Criar Novo Tópico</span>
          </button>
        </div>
      )}

      {/* Search */}
      <div className="px-6 py-4">
        <div className="relative">
          <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar tópicos no fórum..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-100 rounded-full py-3.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder-gray-400 shadow-sm"
          />
        </div>
      </div>

      {/* States */}
      {isLoading && (
        <div className="px-6 py-12 text-center text-gray-400 text-sm">Carregando tópicos...</div>
      )}
      {error && (
        <div className="px-6 py-4 text-red-500 text-sm text-center bg-red-50 mx-6 rounded-2xl">{error}</div>
      )}

      {/* List */}
      {!isLoading && !error && (
        <main className="px-8 flex-1 space-y-4">
          {filtered.length === 0 && (
            <div className="py-12 text-center text-gray-400 text-sm">
              {search ? 'Nenhum tópico encontrado.' : 'Seja o primeiro a criar um tópico!'}
            </div>
          )}
          {filtered.map((topic) => (
            <div
              key={topic.id}
              onClick={() => onTopicClick(topic.id)}
              className="group bg-white border border-gray-100 rounded-[28px] p-5 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 hover:border-blue-100 active:scale-[0.98] transition-all duration-300 cursor-pointer"
            >
              <div className="flex justify-between items-start mb-4">                  <div className="flex items-center gap-3">
                  {(topic.users?.is_professional || topic.users?.role?.toLowerCase() === 'professional') ? (
                    <Link
                      href={`/profissionais/${topic.users?.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className={`w-10 h-10 rounded-2xl overflow-hidden bg-blue-50 border border-blue-50 transition-transform group-hover:scale-105 hover:ring-2 hover:ring-blue-300 block shrink-0`}
                    >
                      {topic.users?.avatar_url ? (
                        <img src={topic.users.avatar_url} alt={topic.users.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-blue-600 text-xs font-bold">
                          {topic.users?.name ? topic.users.name.substring(0, 2).toUpperCase() : '??'}
                        </div>
                      )}
                    </Link>
                  ) : (
                    <div className="w-10 h-10 rounded-2xl overflow-hidden bg-blue-50 border border-blue-50 transition-transform group-hover:scale-105 shrink-0">
                      {topic.users?.avatar_url ? (
                        <img src={topic.users.avatar_url} alt={topic.users.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-blue-600 text-xs font-bold">
                          {topic.users?.name ? topic.users.name.substring(0, 2).toUpperCase() : '??'}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      {(topic.users?.is_professional || topic.users?.role?.toLowerCase() === 'professional') ? (
                        <Link
                          href={`/profissionais/${topic.users?.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-[12px] text-gray-900 font-bold leading-tight hover:text-azul hover:underline"
                        >
                          {topic.users?.name}
                        </Link>
                      ) : (
                        <span className="text-[12px] text-gray-900 font-bold leading-tight">
                          {topic.users?.name}
                        </span>
                      )}
                      {(topic.users?.is_professional || topic.users?.role?.toLowerCase() === 'professional') && (
                        <span className="bg-blue-100 text-blue-800 text-[8px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider border border-blue-200">
                          Especialista
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-0.5">
                      {(topic.users?.is_professional || topic.users?.role?.toLowerCase() === 'professional') ? 'Profissional de Saúde' : 'Paciente'}
                    </span>
                  </div>
                </div>

                <span className="bg-gray-50 text-gray-400 text-[9px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest border border-gray-100">
                  {timeAgo(topic.created_at)}
                </span>
              </div>

              <div className="mb-4">
                <h2 className="font-bold text-gray-900 text-[17px] leading-snug group-hover:text-blue-600 transition-colors mb-1 line-clamp-1">
                  {topic.title}
                </h2>
                <p className="text-[13px] text-gray-500 line-clamp-2 leading-relaxed">
                  {topic.preview}
                </p>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                <div className="flex gap-3">
                  <div className="flex items-center gap-1.5 bg-blue-50/50 text-blue-600 px-3 py-1.5 rounded-full text-[11px] font-bold border border-blue-50">
                    <MdChatBubbleOutline size={14} /> {topic.replies_count}
                  </div>
                  <div
                    onClick={(e) => handleLike(e, topic.id)}
                    className="flex items-center gap-1.5 bg-gray-50 text-gray-500 px-3 py-1.5 rounded-full text-[11px] font-bold border border-gray-100 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    <MdThumbUp size={14} /> {topic.likes_count}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {topic.is_moderated && (
                    <div className="flex items-center gap-1.5 text-blue-500 text-[10px] font-bold bg-blue-50 px-2 py-1 rounded-lg">
                      <MdCheckCircle size={12} /> VERIFICADO
                    </div>
                  )}
                  {topic.author_id === currentUserId && (
                    <button
                      onClick={(e) => handleDeleteClick(e, topic.id)}
                      className="flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors p-1.5 rounded-full cursor-pointer"
                      title="Apagar tópico"
                    >
                      <MdDelete size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </main>
      )}

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setTopicToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Apagar Tópico?"
        message="Tem certeza que deseja apagar este tópico e todas as suas respostas permanentemente?"
        confirmText="Sim, Apagar Tópico"
        isDeleting={isDeletingTopic}
      />
    </div>
  );
}