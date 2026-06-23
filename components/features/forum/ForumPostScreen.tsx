"use client";

import React, { useState, useEffect, useRef } from 'react';
import { MdCheckCircle, MdSend, MdThumbUp, MdDelete, MdPersonOff, MdPerson } from 'react-icons/md';
import Header from "@/components/ui/Header";
import { useRouter } from 'next/navigation';
import { getForumTopicById, replyToForumTopic, likeForumTopic, deleteForumReply, deleteForumTopic } from "@/services/forum/forumService";
import { useForumRepliesRealtime } from "@/lib/hooks/useForumRealtime";
import DeleteConfirmationModal from "@/components/ui/modals/delete-confirmation-modal";

interface Reply {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  users?: { name: string; avatar_url?: string; role: string; is_professional?: boolean };
}

interface Topic {
  id: string;
  title: string;
  preview: string;
  is_moderated: boolean;
  likes_count: number;
  created_at: string;
  author_id?: string;
  users?: { name: string; avatar_url?: string; role: string; is_professional?: boolean };
}

interface ForumPostProps {
  id: string;
  role: 'patient' | 'professional';
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.max(0, Math.floor(diff / 60000));
  if (minutes < 1) return `agora`;
  if (minutes < 60) return `${minutes}m atrás`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h atrás`;
  return `${Math.floor(hours / 24)}d atrás`;
}

export default function ForumPostScreen({ id, role }: ForumPostProps) {
  const router = useRouter();
  const isProfessional = role === 'professional';
  const [topic, setTopic] = useState<Topic | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [isDeleteTopicModalOpen, setIsDeleteTopicModalOpen] = useState(false);
  const [isDeletingTopic, setIsDeletingTopic] = useState(false);

  const [replyToDelete, setReplyToDelete] = useState<string | null>(null);
  const [isDeleteReplyModalOpen, setIsDeleteReplyModalOpen] = useState(false);
  const [isDeletingReply, setIsDeletingReply] = useState(false);

  useEffect(() => {
    // Get current user ID from token
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(payload.id);
      } catch (e) {
        console.error("Erro ao decodificar token", e);
      }
    }
    
    async function fetchTopic() {
      try {
        const data = await getForumTopicById(id);
        setTopic(data.topic);
        setReplies(data.replies || []);
      } catch {
        setError('Erro ao carregar o tópico.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchTopic();
  }, [id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [replies]);

  const refreshTopic = async () => {
    try {
      const data = await getForumTopicById(id);
      setTopic(data.topic);
      setReplies(data.replies || []);
    } catch (err) {
      console.error('Erro ao atualizar tópico em tempo real', err);
    }
  };

  // Real-time listener for forum replies
  useForumRepliesRealtime(
    id,
    () => {
      // Nova resposta inserida - recarrega para pegar foto/nome
      refreshTopic();
    },
    () => {
      // Resposta atualizada
      refreshTopic();
    },
    (replyId) => {
      // Resposta deletada
      setReplies(prev => prev.filter(r => r.id !== replyId));
    }
  );

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    const token = localStorage.getItem('token');
    if (!token) { setError('Você precisa estar logado para responder.'); return; }

    try {
      setIsSending(true);
      setError('');
      const data = await replyToForumTopic(id, replyText, token, isAnonymous);
      setReplies(prev => [...prev, data.reply]);
      setReplyText('');
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar resposta.');
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteReplyClick = (replyId: string) => {
    setReplyToDelete(replyId);
    setIsDeleteReplyModalOpen(true);
  };

  const handleConfirmDeleteReply = async () => {
    if (!replyToDelete) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setIsDeletingReply(true);
      await deleteForumReply(id, replyToDelete, token);
      setReplies(prev => prev.filter(r => r.id !== replyToDelete));
      setIsDeleteReplyModalOpen(false);
      setReplyToDelete(null);
    } catch (err: any) {
      setError(err.message || 'Erro ao apagar resposta.');
    } finally {
      setIsDeletingReply(false);
    }
  };

  const handleDeleteTopicClick = () => {
    setIsDeleteTopicModalOpen(true);
  };

  const handleConfirmDeleteTopic = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setIsDeletingTopic(true);
      await deleteForumTopic(id, token);
      setIsDeleteTopicModalOpen(false);
      router.back();
    } catch (err: any) {
      setError(err.message || 'Erro ao apagar tópico.');
    } finally {
      setIsDeletingTopic(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-[#F8F9FA] min-h-screen flex flex-col font-sans relative">
      <Header title="Tópico" variant="page" showNotification={true} />

      <main 
        ref={scrollRef}
        className="flex-1 px-4 overflow-y-auto pb-16 bg-[#F8F9FA] pt-6"
      >
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-400 text-sm font-medium">Carregando conversa...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-500 px-4 py-3 rounded-2xl mb-4 text-sm font-bold text-center">
            {error}
          </div>
        )}

        {topic && (
          <div className="w-full bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-8">
            {/* Título e Conteúdo do Tópico */}
            <div className="space-y-5">
              {/* Linha: autor + ações */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    if (topic.author_id && topic.author_id === currentUserId) {
                      const profileBase = role === 'professional' ? '/professional' : '/patient';
                      router.push(`${profileBase}/profile`);
                    }
                  }}
                  className={`flex items-center gap-3 bg-transparent border-none p-0 ${topic.author_id === currentUserId ? 'cursor-pointer group' : 'cursor-default'}`}
                >
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-white border border-gray-100 shadow-sm flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                    {topic.users?.avatar_url ? (
                      <img src={topic.users.avatar_url} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-600 text-[10px] font-bold">
                        {topic.users?.name ? topic.users.name.substring(0, 2).toUpperCase() : '??'}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-start">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[12px] font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{topic.users?.name}</span>
                      {(topic.users?.is_professional || topic.users?.role?.toLowerCase() === 'professional') && (
                        <span className="bg-blue-100 text-blue-800 text-[8px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider border border-blue-200">
                          Especialista
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{timeAgo(topic.created_at)}</span>
                  </div>
                </button>

                {/* Botão apagar tópico — ícone com tooltip */}
                {topic.author_id === currentUserId && (
                  <div className="relative group">
                    <button
                      onClick={handleDeleteTopicClick}
                      className="w-9 h-9 rounded-full flex items-center justify-center bg-red-50 text-red-400 border border-red-100 hover:bg-red-100 hover:text-red-600 active:scale-95 transition-all cursor-pointer"
                    >
                      <MdDelete size={17} />
                    </button>
                    <div className="absolute top-[calc(100%+10px)] right-0 w-48 pointer-events-none opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200 ease-out z-50">
                      <div className="w-3 h-3 rotate-45 absolute -top-1.5 right-3 bg-red-500" />
                      <div className="rounded-2xl px-4 py-3 shadow-xl text-white bg-gradient-to-br from-red-500 to-red-700">
                        <div className="flex items-center gap-2 mb-1">
                          <MdDelete size={14} />
                          <span className="text-[13px] font-bold">Apagar tópico</span>
                        </div>
                        <p className="text-[11px] leading-relaxed opacity-80">
                          Remove este tópico e todas as respostas permanentemente.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Título */}
              <h1 className="text-3xl font-extrabold text-gray-900 leading-tight tracking-tight">
                {topic.title}
              </h1>

              {/* Conteúdo */}
              <p className="text-gray-700 leading-relaxed text-[16px] font-medium">
                {topic.preview}
              </p>

              {/* Curtir */}
              <div>
                <button
                  onClick={async () => {
                    const token = localStorage.getItem('token');
                    if (!token || !topic) return;
                    try {
                      const res = await likeForumTopic(topic.id, token);
                      setTopic({ ...topic, likes_count: res.likes_count });
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                  className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-xs font-bold border border-blue-100 active:scale-95 transition-all hover:bg-blue-100 cursor-pointer"
                >
                  <MdThumbUp size={16} /> Curtir ({topic.likes_count})
                </button>
              </div>
            </div>

            {/* Linha Divisória */}
            <div className="h-[1px] bg-gray-100 w-full" />

            {/* Seção de Respostas */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-[2px]">Respostas ({replies.length})</span>
              </div>

              {replies.length === 0 ? (
                <div className="py-6 text-center text-gray-400 text-sm">
                  Nenhuma resposta ainda. Seja o primeiro a responder!
                </div>
              ) : (
                <div className="space-y-6">
                  {replies.map((reply) => {
                    const isExpert = reply.users?.is_professional || reply.users?.role?.toLowerCase() === 'professional';
                    const isMe = reply.author_id === currentUserId;
                    
                    return (
                      <div key={reply.id} className="flex flex-col gap-2 items-start w-full">
                        <div className="flex items-center gap-2.5 mb-1">
                          <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-100 shadow-sm bg-white flex items-center justify-center">
                            {reply.users?.avatar_url ? (
                              <img src={reply.users.avatar_url} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] font-bold bg-blue-50 text-blue-600">
                                {reply.users?.name ? reply.users.name.substring(0, 2).toUpperCase() : '??'}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-start">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-bold text-gray-900">
                                {reply.users?.name} {isMe && <span className="text-gray-400 font-normal">(Você)</span>}
                              </span>
                              {isExpert && (
                                <span className="bg-blue-100 text-blue-800 text-[8px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider border border-blue-200">
                                  Especialista
                                </span>
                              )}
                            </div>
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{timeAgo(reply.created_at)}</span>
                          </div>
                        </div>

                        <div className="relative max-w-[95%] p-5 rounded-[24px] bg-[#F8F9FA] text-gray-600 border border-gray-100/60 shadow-sm rounded-tl-none ml-1 flex justify-between items-start gap-4 w-full">
                          <p className="text-[15px] leading-relaxed flex-1 whitespace-pre-wrap">
                            {reply.content}
                          </p>
                          {isMe && (
                            <button
                              onClick={() => handleDeleteReplyClick(reply.id)}
                              className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50 cursor-pointer"
                              title="Apagar resposta"
                            >
                              <MdDelete size={18} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Linha Divisória */}
            <div className="h-[1px] bg-gray-100 w-full" />

            {/* Formulário de Envio de Resposta (Estático dentro do Card) */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 w-full">
                <div className="flex-1 bg-gray-50 border border-gray-100 rounded-[28px] h-14 flex items-center px-6 focus-within:bg-white focus-within:border-blue-200 focus-within:ring-4 focus-within:ring-blue-50 transition-all duration-300">
                  <input
                    type="text"
                    placeholder={isProfessional ? "Responder como especialista..." : "Escreva sua resposta..."}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                    className="h-14 w-full bg-transparent focus:outline-none text-[15px] text-gray-700 placeholder-gray-400 font-medium flex items-center"
                  />
                </div>
                {!isProfessional && (
                  <div className="relative group shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsAnonymous(!isAnonymous)}
                      className={`w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-95 border cursor-pointer ${
                        isAnonymous
                          ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200'
                          : 'bg-gray-50 text-gray-400 border-gray-200 hover:border-blue-300 hover:text-blue-500'
                      }`}
                    >
                      {isAnonymous ? <MdPersonOff size={22} /> : <MdPerson size={22} />}
                    </button>

                    {/* Tooltip customizado */}
                    <div className="absolute bottom-[calc(100%+10px)] right-0 w-56 pointer-events-none opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200 ease-out z-50">
                      <div className={`rounded-2xl px-4 py-3 shadow-xl text-white ${
                        isAnonymous
                          ? 'bg-gradient-to-br from-blue-600 to-blue-800'
                          : 'bg-gradient-to-br from-gray-700 to-gray-900'
                      }`}>
                        <div className="flex items-center gap-2 mb-1">
                          {isAnonymous ? <MdPersonOff size={15} /> : <MdPerson size={15} />}
                          <span className="text-[13px] font-bold">
                            {isAnonymous ? 'Modo anônimo ativo' : 'Responder anonimamente'}
                          </span>
                        </div>
                        <p className="text-[11px] leading-relaxed opacity-80">
                          {isAnonymous
                            ? 'Seu nome e foto estão ocultos. Clique para revelar sua identidade.'
                            : 'Sua identidade ficará oculta para todos neste tópico.'}
                        </p>
                      </div>
                      {/* Setinha */}
                      <div className={`w-3 h-3 rotate-45 absolute -bottom-1.5 right-6 ${
                        isAnonymous ? 'bg-blue-800' : 'bg-gray-900'
                      }`} />
                    </div>
                  </div>
                )}

                <div className="relative group shrink-0">
                  <button
                    onClick={handleSendReply}
                    disabled={isSending || !replyText.trim()}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-lg ${
                      isSending || !replyText.trim() 
                        ? 'bg-gray-100 text-gray-400 shadow-none border border-gray-200 cursor-not-allowed' 
                        : 'bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700 cursor-pointer'
                    }`}
                  >
                    {isSending ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <MdSend size={22} />
                    )}
                  </button>

                  {/* Tooltip do botão enviar */}
                  <div className="absolute bottom-[calc(100%+10px)] right-0 w-48 pointer-events-none opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200 ease-out z-50">
                    <div className={`rounded-2xl px-4 py-3 shadow-xl text-white ${
                      isSending
                        ? 'bg-gradient-to-br from-gray-500 to-gray-700'
                        : !replyText.trim()
                          ? 'bg-gradient-to-br from-gray-600 to-gray-800'
                          : 'bg-gradient-to-br from-blue-500 to-blue-700'
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <MdSend size={14} />
                        <span className="text-[13px] font-bold">
                          {isSending ? 'Enviando...' : !replyText.trim() ? 'Escreva algo' : 'Enviar resposta'}
                        </span>
                      </div>
                      <p className="text-[11px] leading-relaxed opacity-80">
                        {isSending
                          ? 'Sua resposta está sendo publicada.'
                          : !replyText.trim()
                            ? 'Digite sua mensagem para poder enviar.'
                            : 'Pressione Enter ou clique para publicar.'}
                      </p>
                    </div>
                    {/* Setinha */}
                    <div className={`w-3 h-3 rotate-45 absolute -bottom-1.5 right-6 ${
                      isSending ? 'bg-gray-700' : !replyText.trim() ? 'bg-gray-800' : 'bg-blue-700'
                    }`} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <DeleteConfirmationModal
        isOpen={isDeleteTopicModalOpen}
        onClose={() => setIsDeleteTopicModalOpen(false)}
        onConfirm={handleConfirmDeleteTopic}
        title="Apagar Tópico?"
        message="Tem certeza que deseja apagar este tópico e todas as suas respostas permanentemente?"
        confirmText="Sim, Apagar Tópico"
        isDeleting={isDeletingTopic}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteReplyModalOpen}
        onClose={() => {
          setIsDeleteReplyModalOpen(false);
          setReplyToDelete(null);
        }}
        onConfirm={handleConfirmDeleteReply}
        title="Apagar Resposta?"
        message="Tem certeza que deseja apagar esta resposta permanentemente?"
        confirmText="Sim, Apagar Resposta"
        isDeleting={isDeletingReply}
      />
    </div>
  );
}