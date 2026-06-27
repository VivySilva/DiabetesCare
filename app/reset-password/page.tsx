'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from "@/components/forms/Input";
import { MdLock, MdVisibility, MdVisibilityOff, MdCheckCircle } from 'react-icons/md';
import { useSmartHomeHref } from "@/lib/hooks/useSmartHomeHref";
import { resetPassword } from "@/services/auth/authService";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const logoHref = useSmartHomeHref();
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Token de recuperação não encontrado ou inválido.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newPassword) return;

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      await resetPassword(token, newPassword);
      setIsSuccess(true);
      // Redireciona após 3 segundos
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Erro ao redefinir senha.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center text-center space-y-6">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
          <MdCheckCircle size={48} />
        </div>
        <h1 className="text-2xl font-bold text-texto">Senha Redefinida!</h1>
        <p className="text-cinza-claro-texto max-w-[280px]">
          Sua senha foi alterada com sucesso. Você será redirecionado para a tela de login em instantes.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-8">
      {/* DiabetesCare Logo (clicável) */}
      <div className="flex flex-col items-center">
        <Link href={logoHref} className="flex flex-col items-center mb-5 no-underline">
          <div className="w-14 h-14 bg-azul-escuro rounded-2xl flex items-center justify-center shadow-lg mb-3 transition-transform hover:scale-105 active:scale-95">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 11H13V5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5V11H5C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13H11V19C11 19.5523 11.4477 20 12 20C12.5523 20 13 19.5523 13 19V13H19C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11Z" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 12H17" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-sm font-extrabold text-azul-escuro tracking-tight hover:opacity-80 transition-opacity">DiabetesCare</span>
        </Link>
      </div>

      <div className="flex flex-col items-center mb-8">
        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-3">
           <MdLock size={28} className="text-blue-600" />
        </div>
        <h1 className="text-azul-escuro text-xl font-bold">Nova Senha</h1>
        <p className="text-cinza-claro-texto mt-1 text-center text-sm">
          Crie uma nova senha segura para a sua conta.
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-xl">{error}</div>}
        
        <Input 
          label="Nova Senha" 
          type="password"
          placeholder="••••••••"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          icon={<MdLock size={20} />}
        />

        <Input 
          label="Confirmar Nova Senha" 
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          icon={<MdLock size={20} />}
        />

        <button
          type="submit"
          disabled={!newPassword || !token || isLoading}
          className={`w-full py-4 rounded-3xl font-bold text-white text-base shadow-lg transition-all transform active:scale-[0.98]
            ${(!newPassword || isLoading) ? "bg-gray-300 shadow-none" : "bg-azul hover:bg-azul-escuro shadow-azul-claro"}`}
        >
          {isLoading ? 'Salvando...' : 'Salvar Nova Senha'}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    setShowContent(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center px-6 py-12">
      <Suspense fallback={<div>Carregando...</div>}>
        {showContent && <ResetPasswordContent />}
      </Suspense>
    </div>
  );
}
