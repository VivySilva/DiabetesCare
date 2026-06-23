import { useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";

/**
 * Hook para escutar mudanças em tempo real na tabela de tópicos do fórum.
 * Atualiza automaticamente quando tópicos são criados, atualizados ou deletados.
 */
export function useForumTopicsRealtime(
  onInsert?: (topic: any) => void,
  onUpdate?: (topic: any) => void,
  onDelete?: (topicId: string) => void
) {
  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    console.log("🔗 Conectando real-time listener para tópicos");

    const channel = supabase
      .channel("forum_topics_realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "forum_topics",
        },
        (payload) => {
          console.log("📨 Novo tópico recebido:", payload.new);
          if (onInsert) onInsert(payload.new);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "forum_topics",
        },
        (payload) => {
          console.log("✏️ Tópico atualizado:", payload.new);
          if (onUpdate) onUpdate(payload.new);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "forum_topics",
        },
        (payload) => {
          console.log("🗑️ Tópico deletado:", payload.old.id);
          if (onDelete) onDelete(payload.old.id);
        }
      )
      .subscribe((status) => {
        console.log("📡 Real-time status (topics):", status);
      });

    return () => {
      console.log("🔌 Desconectando real-time listener para tópicos");
      supabase.removeChannel(channel);
    };
  }, [onInsert, onUpdate, onDelete]);
}

/**
 * Hook para escutar mudanças em tempo real nas respostas de um tópico específico.
 * Atualiza automaticamente quando respostas são criadas, atualizadas ou deletadas.
 */
export function useForumRepliesRealtime(
  topicId: string,
  onInsert?: (reply: any) => void,
  onUpdate?: (reply: any) => void,
  onDelete?: (replyId: string) => void
) {
  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase || !topicId) {
      console.warn("⚠️ Supabase ou topicId não configurados. Real-time replies não funcionará.", { supabase: !!supabase, topicId });
      return;
    }

    console.log("🔗 Conectando real-time listener para topic:", topicId);

    const channel = supabase
      .channel(`forum_replies_${topicId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "forum_replies",
          filter: `topic_id=eq.${topicId}`,
        },
        (payload) => {
          console.log("📨 Nova resposta recebida:", payload.new);
          if (onInsert) onInsert(payload.new);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "forum_replies",
          filter: `topic_id=eq.${topicId}`,
        },
        (payload) => {
          console.log("✏️ Resposta atualizada:", payload.new);
          if (onUpdate) onUpdate(payload.new);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "forum_replies",
          filter: `topic_id=eq.${topicId}`,
        },
        (payload) => {
          console.log("🗑️ Resposta deletada:", payload.old.id);
          if (onDelete) onDelete(payload.old.id);
        }
      )
      .subscribe((status) => {
        console.log("📡 Real-time status:", status);
      });

    return () => {
      console.log("🔌 Desconectando real-time listener para topic:", topicId);
      supabase.removeChannel(channel);
    };
  }, [topicId, onInsert, onUpdate, onDelete]);
}
