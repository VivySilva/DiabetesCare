'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Input } from "@/components/forms/Input";
import { useRouter } from 'next/navigation';
import { registerUser } from "@/services/auth/authService";
import SuccessModal from "@/components/ui/modals/success-modal";

export default function RegisterPage() {
  const [isProfessional, setIsProfessional] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('Masculino');
  const [diabetesType, setDiabetesType] = useState('Tipo 2');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      await registerUser({
        name,
        email,
        phone,
        password,
        confirmPassword,
        role: isProfessional ? 'professional' : 'patient',
        dateOfBirth: dateOfBirth || undefined,
        diabetesType: !isProfessional ? diabetesType : undefined,
        licenseNumber: isProfessional ? licenseNumber : undefined,
        gender,
      });
      
      setShowSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Erro ao realizar cadastro.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center px-6 py-12">
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
          {error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-xl">{error}</div>}
          <Input 
            label="Nome completo" 
            placeholder="Como deseja ser chamado?"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            }
          />

          <Input 
            label="Data de Nascimento" 
            type="date"
            placeholder="DD/MM/AAAA"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            }
          />

          <Input 
            label="Telefone" 
            type="tel"
            placeholder="(00) 00000-0000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l2.27-2.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
            }
          />

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">
              Gênero
            </label>
            <div className="relative">
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-gray-900 font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 focus:bg-white transition-all cursor-pointer"
              >
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
                <option value="Outro">Outro</option>
                <option value="Prefiro não informar">Prefiro não informar</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>

          <Input 
            label="Senha" 
            type="password"
            placeholder="Mínimo 8 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2.5 2v6h6M21.5 22v-6h-6"></path>
                <path d="M22 11.5A10 10 0 0 0 3.2 7.2M2 12.5a10 10 0 0 0 18.8 4.3"></path>
              </svg>
            }
          />

          {!isProfessional && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">
                Tipo de Diabetes
              </label>
              <select
                value={diabetesType}
                onChange={(e) => setDiabetesType(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-gray-900 font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 focus:bg-white transition-all cursor-pointer"
              >
                <option value="Tipo 1">Tipo 1</option>
                <option value="Tipo 2">Tipo 2</option>
                <option value="Gestacional">Gestacional</option>
                <option value="Pré-diabetes">Pré-diabetes</option>
              </select>
            </div>
          )}

          {isProfessional && (
            <Input 
              label="Registro no Conselho" 
              placeholder="CRM / CRN"
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
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
            disabled={isLoading}
            className={`w-full ${isLoading ? 'bg-gray-400' : 'bg-azul hover:bg-azul-escuro'} text-white font-bold py-4 rounded-3xl shadow-lg shadow-azul-claro transition-all transform active:scale-[0.98] mt-4`}
          >
            {isLoading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>

        <p className="text-center text-cinza-claro-texto">
          Já tem uma conta? <Link href="/login" className="text-azul font-bold hover:underline">Faça login</Link>
        </p>
      </div>

      <SuccessModal 
        isOpen={showSuccess} 
        message="Sua conta foi criada com sucesso! Agora você pode fazer login." 
        onClose={() => {
          setShowSuccess(false);
          router.push('/login');
        }} 
      />
    </div>
  );
}