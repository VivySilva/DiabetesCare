"use client";
import React, { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const DiabeticaChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Formatar histórico para o formato esperado pela API [user, assistant]
      const history: [string, string][] = [];
      for (let i = 0; i < messages.length; i += 2) {
        if (messages[i] && messages[i + 1]) {
          history.push([messages[i].content, messages[i + 1].content]);
        }
      }

      const response = await fetch('/api/diabetica/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, history }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao receber resposta');
      }

      if (data.response) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.response }]);
      } else {
        throw new Error(data.error || 'Erro ao receber resposta');
      }
    } catch (error) {
      console.error('Erro no chat:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Desculpe, ocorreu um erro ao processar sua solicitação.';
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: errorMessage },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] w-full max-w-2xl mx-auto border rounded-lg shadow-lg bg-white">
      <div className="p-4 border-b bg-blue-600 text-white rounded-t-lg">
        <h2 className="text-xl font-bold">Diabetica</h2>
        <p className="text-sm opacity-80">Especialista em cuidados com o diabetes</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-10">
            Olá! Como posso ajudar você hoje com suas dúvidas sobre diabetes?
          </div>
        )}
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-blue-500 text-white rounded-br-none'
                  : 'bg-gray-200 text-gray-800 rounded-bl-none'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-800 p-3 rounded-lg rounded-bl-none animate-pulse">
              Pensando...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Digite sua dúvida sobre diabetes..."
          className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <button
          onClick={handleSend}
          disabled={isLoading}
          className="bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          Enviar
        </button>
      </div>
      <div className="p-3 text-[10px] text-center text-gray-500 italic border-t bg-gray-50">
        © 2026 DiabetesCare - Diabetica.<br />
        Modelo Diabetica desenvolvido por WaltonFuture (https://github.com/waltonfuture/Diabetica).<br />
        Nota: Este chat é alimentado por um modelo de Inteligência Artificial e pode cometer erros. As informações fornecidas não substituem o aconselhamento de um especialista médico.
      </div>
    </div>
  );
};

export default DiabeticaChat;
