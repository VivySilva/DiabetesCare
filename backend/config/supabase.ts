import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

/**
 * Carrega as variáveis de ambiente do arquivo .env
 */
dotenv.config();

/**
 * URL do projeto Supabase
 */
const supabaseUrl = process.env.SUPABASE_URL;

/**
 * Chave de acesso ao Supabase
 */
const supabaseKey = process.env.SUPABASE_KEY;

/**
 * Valida se as variáveis essenciais estão definidas.
 * Lança erro caso não estejam configuradas.
 */
if (!supabaseUrl || !supabaseKey) {
  throw new Error("Variáveis do Supabase não configuradas!");
}

/**
 * Instância do cliente Supabase utilizada para realizar
 * operações de banco de dados (CRUD) no sistema.
 */
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;