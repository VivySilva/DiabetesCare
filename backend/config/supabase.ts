import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

/**
 * Loads environment variables from the .env file.
 */
dotenv.config();

/**
 * Supabase project URL.
 */
const supabaseUrl = process.env.SUPABASE_URL;

/**
 * Supabase access key.
 */
const supabaseKey = process.env.SUPABASE_KEY;

/**
 * Validates if the essential environment variables are defined.
 * Throws an error if they are not properly configured.
 */
if (!supabaseUrl || !supabaseKey) {
  throw new Error("Variáveis do Supabase não configuradas!");
}

/**
 * Supabase client instance used to perform
 * database operations (CRUD) across the system.
 */
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;