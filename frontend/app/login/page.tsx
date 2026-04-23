'use client';

import React from 'react';
import Link from 'next/link';
import { Input } from '../components/Input';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulação de login para demonstração
    router.push('/patient');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-12">
      {/* Logo Section */}
      <div className="flex flex-col items-center mb-12">
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
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="text-texto">Bem-vindo de volta</h2>
          <p className="text-cinza-claro-texto mt-1">Acesse sua conta para monitorar seus níveis</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <Input 
            label="Usuário" 
            placeholder="Seu nome de usuário"
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            }
          />

          <div className="space-y-1">
            <div className="flex justify-between items-center px-1">
              <label className="text-sm font-medium text-cinza-claro-texto">Senha</label>
              <button type="button" className="text-xs font-semibold text-azul hover:underline">Esqueceu a senha?</button>
            </div>
            <div className="relative flex items-center">
              <div className="absolute left-4 text-cinza-claro-fundo">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-azul-fundo border-none rounded-3xl py-3.5 pl-12 pr-12 text-texto placeholder-cinza-claro-fundo focus:ring-2 focus:ring-azul outline-none transition-all"
              />
              <div className="absolute right-4 text-cinza-claro-fundo cursor-pointer">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-azul hover:bg-azul-escuro text-white font-bold py-4 rounded-3xl shadow-lg shadow-azul-claro flex items-center justify-center gap-2 transition-all transform active:scale-[0.98]"
          >
            Entrar
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </form>

        <p className="text-center text-cinza-claro-texto">
          Não tem conta? <Link href="/register" className="text-azul font-bold hover:underline">Cadastre-se</Link>
        </p>
      </div>
    </div>
  );
}