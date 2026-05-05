'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Input } from '../components/Input';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [isProfessional, setIsProfessional] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulação de cadastro para demonstração
    router.push('/register');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-12">
      {/* Logo Section */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-20 h-20 bg-azul-escuro rounded-2xl flex items-center justify-center shadow-lg mb-4">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 11H13V5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5V11H5C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13H11V19C11 19.5523 11.4477 20 12 20C12.5523 20 13 19.5523 13 19V13H19C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11Z" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7 12H17" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <h1 className="text-azul-escuro">DiabetesCare</h1>
        <p className="text-cinza-claro-texto mt-1">Sua saúde em equilíbrio</p>
      </div>

      {/* Form Section */}
      <div className="w-full max-w-md space-y-6">
        <div>
          <h2 className="text-texto">Crie sua conta</h2>
          <p className="text-cinza-claro-texto mt-1">Comece a monitorar sua saúde hoje</p>
        </div>

        {/* Toggle Professional/User */}
        <div className="flex bg-azul-fundo p-1 rounded-2xl">
          <button 
            onClick={() => setIsProfessional(false)}
            className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all ${!isProfessional ? 'bg-white shadow-sm text-azul' : 'text-cinza-claro-texto'}`}
          >
            Paciente
          </button>
          <button 
            onClick={() => setIsProfessional(true)}
            className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all ${isProfessional ? 'bg-white shadow-sm text-azul' : 'text-cinza-claro-texto'}`}
          >
            Profissional
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input 
            label="Nome completo" 
            placeholder="Como deseja ser chamado?"
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            }
          />

          <Input 
            label="E-mail" 
            type="email"
            placeholder="seu@email.com"
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            }
          />

          <Input
            label="Telefone"
            type="tel"
            placeholder="(00) 00000-0000"
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.45 2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.37a16 16 0 0 0 6 6l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16z"></path>
              </svg>
            }
          />

          <Input 
            label="Senha" 
            type="password"
            placeholder="Mínimo 8 caracteres"
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            }
            rightIcon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            }
          />

          <Input 
            label="Confirmar Senha" 
            type="password"
            placeholder="Repita sua senha"
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2.5 2v6h6M21.5 22v-6h-6"></path>
                <path d="M22 11.5A10 10 0 0 0 3.2 7.2M2 12.5a10 10 0 0 0 18.8 4.3"></path>
              </svg>
            }
          />

          {isProfessional && (
            <Input 
              label="Registro no Conselho" 
              placeholder="CRM / CRN"
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              }
            />
          )}

          <button
            type="submit"
            className="w-full bg-azul hover:bg-azul-escuro text-white font-bold py-4 rounded-3xl shadow-lg shadow-azul-claro transition-all transform active:scale-[0.98] mt-4"
          >
            Cadastrar
          </button>
        </form>

        <p className="text-center text-cinza-claro-texto">
          Já tem uma conta? <Link href="/login" className="text-azul font-bold hover:underline">Faça login</Link>
        </p>
      </div>
    </div>
  );
}