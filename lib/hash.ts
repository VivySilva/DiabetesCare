import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

/**
 * Hash a password.
 * 
 * Gera um hash seguro para uma senha utilizando bcrypt.
 * 
 * @param {string} password - A senha em texto simples a ser criptografada.
 * @returns {Promise<string>} Uma promessa que resolve com o hash da senha.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare a password with a hash.
 * 
 * Compara uma senha em texto simples com um hash criptografado para verificar se coincidem.
 * 
 * @param {string} password - A senha em texto simples fornecida.
 * @param {string} hash - O hash armazenado no banco de dados.
 * @returns {Promise<boolean>} Uma promessa que resolve com true se a senha for válida, ou false caso contrário.
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
