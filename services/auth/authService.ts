import { httpClient } from "@/lib/httpClient";

/**
 * Authenticate a user.
 * 
 * Realiza o login do usuário enviando as credenciais para o backend.
 * 
 * @param {string} email - O e-mail do usuário.
 * @param {string} password - A senha do usuário.
 * @returns {Promise<any>} A resposta da API contendo o token e dados do usuário.
 */
export async function loginUser(email: string, password: string) {
  return httpClient.post("/auth/login", { email, password });
}

/**
 * Register a new user.
 * 
 * Cria uma nova conta de usuário (paciente ou profissional) no sistema.
 * 
 * @param {Object} data - Os dados de registro do usuário.
 * @param {string} data.name - Nome completo.
 * @param {string} data.email - Endereço de e-mail.
 * @param {string} data.password - Senha escolhida.
 * @param {string} data.confirmPassword - Confirmação da senha.
 * @param {"patient" | "professional"} data.role - Papel do usuário no sistema.
 * @param {string} [data.dateOfBirth] - Data de nascimento no formato YYYY-MM-DD (opcional).
 * @param {string} [data.licenseNumber] - Número do registro profissional (obrigatório para profissionais).
 * @param {string} [data.phone] - Número de telefone opcional.
 * @returns {Promise<any>} A resposta da API confirmando o registro.
 */
export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: "patient" | "professional";
  dateOfBirth?: string;
  licenseNumber?: string;
  phone?: string;
  diabetesType?: string;
  gender?: string;
  specialty?: string;
  professional_email?: string;
  professional_phone?: string;
  clinic_address?: string;
  bio?: string;
}) {
  return httpClient.post("/auth/register", data);
}

/**
 * Request password recovery.
 * 
 * Solicita o envio de um e-mail de recuperação de senha para o endereço informado.
 * 
 * @param {string} email - O e-mail associado à conta.
 * @returns {Promise<any>} A resposta da API confirmando o envio da solicitação.
 */
export async function requestPasswordRecovery(email: string) {
  return httpClient.post("/auth/forgot-password/request", { email });
}

/**
 * Reset user password.
 * 
 * Redefine a senha do usuário utilizando o token de recuperação recebido por e-mail.
 * 
 * @param {string} token - O token de recuperação validado.
 * @param {string} newPassword - A nova senha a ser definida.
 * @returns {Promise<any>} A resposta da API confirmando a alteração da senha.
 */
export async function resetPassword(token: string, newPassword: string) {
  return httpClient.post("/auth/forgot-password/reset", { token, new_password: newPassword });
}
