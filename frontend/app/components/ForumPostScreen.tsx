"use client";

import React, { useState, useEffect, useRef } from 'react';
import { MdCheckCircle, MdSend, MdThumbUp } from 'react-icons/md';
import Header from './Header';
import { getForumTopicById, replyToForumTopic, likeForumTopic } from '../../services/api';

interface Reply {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  users?: { name: string; avatar_url?: string; role: string };
}

interface Topic {
  id: string;
  title: string;
  is_moderated: boolean;
  likes_count: number;
  created_at: string;
  users?: { name: string; avatar_url?: string; role: string };
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
  const isProfessional = role === 'professional';
  const [topic, setTopic] = useState<Topic | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    const token = localStorage.getItem('token');
    if (!token) { setError('Você precisa estar logado para responder.'); return; }

    try {
      setIsSending(true);
      const data = await replyToForumTopic(id, replyText, token);
      setReplies(prev => [...prev, data.reply]);
      setReplyText('');
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar resposta.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white min-h-screen flex flex-col font-sans relative">
      <Header title="Tópico" variant="page" showNotification={true} />

      <main 
        ref={scrollRef}
        className="flex-1 px-4 overflow-y-auto pb-32 bg-[#F8F9FA] pt-6"
      >
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-400 text-sm font-medium">Carregando conversa...</span>
          </div>
        )}

        {topic && (
          <div className="mb-8 px-2">
            <h1 className="text-3xl font-extrabold text-gray-900 leading-tight mb-4 tracking-tight">
              {topic.title}
            </h1>
            
            <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600"></div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-full overflow-hidden bg-white border border-gray-100 shadow-sm">
                  {topic.users?.avatar_url ? (
                    <img src={topic.users.avatar_url} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-600 text-[10px] font-bold">
                      {topic.users?.name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-[12px] font-bold text-gray-900">{topic.users?.name}</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{timeAgo(topic.created_at)}</span>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed text-[16px] font-medium mb-4">
                {topic.preview}
              </p>

              <div className="flex justify-start">
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
                  className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-xs font-bold border border-blue-100 active:scale-95 transition-all hover:bg-blue-100"
                >
                  <MdThumbUp size={16} /> Curtir ({topic.likes_count})
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-8 mt-12 px-2 pb-10">
          <div className="flex items-center justify-center gap-4">
            <div className="h-[1px] bg-gray-200 flex-1"></div>
            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-[2px]">Respostas</span>
            <div className="h-[1px] bg-gray-200 flex-1"></div>
          </div>

          {replies.map((reply) => {
            const isExpert = reply.users?.role === 'PROFESSIONAL';
            const isMe = reply.author_id === currentUserId;
            
            return (
              <div key={reply.id} className={`flex flex-col gap-2 ${isMe ? 'items-end' : isExpert ? 'items-center' : 'items-start'}`}>
                {!isMe && (
                  <div className={`flex items-center gap-2 ${isExpert ? 'flex-col mb-1' : 'mb-1'}`}>
                    <div className={`w-8 h-8 rounded-full overflow-hidden border shadow-sm ${isExpert ? 'w-12 h-12 border-blue-100' : 'border-gray-50'}`}>
                      {reply.users?.avatar_url ? (
                        <img src={reply.users.avatar_url} className="w-full h-full object-cover" />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center text-[10px] font-bold ${isExpert ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                          {reply.users?.name?.substring(0, 2).toUpperCase() || '??'}
                        </div>
                      )}
                    </div>
                    <div className={`flex flex-col ${isExpert ? 'items-center' : 'items-start'}`}>
                      <span className="text-[11px] font-bold text-gray-900">{reply.users?.name}</span>
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{timeAgo(reply.created_at)}</span>
                    </div>
                  </div>
                )}

                {isMe && (
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest px-2">{timeAgo(reply.created_at)}</span>
                )}

                <div className={`relative max-w-[85%] p-4 rounded-[24px] ${
                  isMe 
                    ? 'bg-blue-600 text-white shadow-md rounded-tr-none' 
                    : isExpert
                    ? 'bg-white text-blue-700 shadow-xl shadow-blue-100/50 text-center italic font-medium border-2 border-blue-100'
                    : 'bg-white text-gray-600 border border-gray-100 shadow-sm rounded-tl-none'
                }`}>
                  {isExpert && (
                     <div className="flex justify-center mb-2">
                        <span className="bg-blue-50 text-blue-600 text-[8px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-blue-100">
                          Especialista
                        </span>
                     </div>
                  )}
                  <p className="text-[14px] leading-relaxed">
                    {reply.content}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <footer className="fixed bottom-0 w-full max-w-4xl left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-xl border-t border-gray-100 p-4 pb-8 flex items-center gap-3 z-50 shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
        <div className="flex-1 bg-gray-50 border border-gray-100 rounded-[28px] flex items-center px-6 py-3.5 focus-within:bg-white focus-within:border-blue-200 focus-within:ring-4 focus-within:ring-blue-50 transition-all duration-300">
          <input
            type="text"
            placeholder={isProfessional ? "Responder como especialista..." : "Escreva sua resposta..."}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
            className="bg-transparent w-full focus:outline-none text-[15px] text-gray-700 placeholder-gray-400 font-medium"
          />
        </div>
        <button
          onClick={handleSendReply}
          disabled={isSending || !replyText.trim()}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-lg ${
            isSending || !replyText.trim() 
              ? 'bg-gray-200 text-gray-400 shadow-none' 
              : 'bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700'
          }`}
        >
          {isSending ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <MdSend size={22} />
          )}
        </button>
      </footer>
    </div>
  );
}