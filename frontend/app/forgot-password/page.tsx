'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Input } from '../components/Input';
import { useRouter } from 'next/navigation';
import { MdEmail, MdArrowBack } from 'react-icons/md';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    // Simulação de envio
    setIsSent(true);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-12">
      {/* Back Button */}
      <div className="absolute top-8 left-6">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-azul-fundo text-texto active:scale-90 transition-all"
        >
          <MdArrowBack size={24} />
        </button>
      </div>

      {/* Logo Section */}
      <div className="flex flex-col items-center mb-10">
        <div className="w-16 h-16 bg-azul-escuro rounded-2xl flex items-center justify-center shadow-lg mb-4">
           <MdEmail size={32} color="white" />
        </div>
        <h1 className="text-azul-escuro text-2xl font-bold">Recuperar Senha</h1>
        <p className="text-cinza-claro-texto mt-1 text-center max-w-[280px]">
          {isSent 
            ? "Instruções enviadas para o seu e-mail cadastrado." 
            : "Insira seu e-mail para receber as instruções de recuperação."}
        </p>
      </div>

      {/* Form Section */}
      {!isSent ? (
        <div className="w-full max-w-md space-y-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input 
              label="E-mail" 
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<MdEmail size={20} />}
            />

            <button
              type="submit"
              disabled={!email}
              className={`w-full py-4 rounded-3xl font-bold text-white text-base shadow-lg transition-all transform active:scale-[0.98]
                ${!email ? "bg-gray-300 shadow-none" : "bg-azul hover:bg-azul-escuro shadow-azul-claro"}`}
            >
              Enviar Link de Recuperação
            </button>
          </form>

          <p className="text-center text-cinza-claro-texto text-sm">
            Lembrou a senha? <Link href="/login" className="text-azul font-bold hover:underline">Fazer Login</Link>
          </p>
        </div>
      ) : (
        <div className="w-full max-w-md flex flex-col items-center gap-6">
           <div className="bg-green-50 text-green-700 p-4 rounded-2xl text-center text-sm font-medium">
             Se o e-mail <strong>{email}</strong> estiver em nossa base, você receberá um link em instantes.
           </div>
           
           <button
             onClick={() => router.push('/login')}
             className="w-full py-4 rounded-3xl font-bold text-white bg-azul hover:bg-azul-escuro shadow-lg shadow-azul-claro transition-all"
           >
             Voltar para o Login
           </button>

           <button 
             onClick={() => setIsSent(false)}
             className="text-azul font-bold text-sm hover:underline"
           >
             Tentar outro e-mail
           </button>
        </div>
      )}
    </div>
  );
}
