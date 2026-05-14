import { NextResponse } from "next/server";

/**
 * Send a success API response.
 * 
 * Envia uma resposta de sucesso padronizada para a API.
 * 
 * @param {any} data - Os dados que serão retornados no corpo da resposta.
 * @param {number} status - O código de status HTTP (padrão: 200).
 * @returns {NextResponse} Um objeto NextResponse configurado.
 */
export function successResponse(data: any, status: number = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  );
}

/**
 * Send an error API response.
 * 
 * Envia uma resposta de erro padronizada para a API.
 * 
 * @param {string} error - A mensagem de erro que será retornada.
 * @param {number} status - O código de status HTTP (padrão: 400).
 * @returns {NextResponse} Um objeto NextResponse configurado.
 */
export function errorResponse(error: string, status: number = 400) {
  return NextResponse.json(
    {
      success: false,
      error,
    },
    { status }
  );
}
