import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateDiabeticaResponse, mapDiabeticaError } from '@/lib/diabetica-client';

const chatSchema = z.object({
  message: z.string().min(1, 'A mensagem é obrigatória.').max(1000, 'A mensagem é muito longa.'),
  history: z.array(z.any()).optional().default([]),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = chatSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Dados inválidos.', detalhes: result.error.issues }, { status: 400 });
    }

    const { message, history } = result.data;
    const response = await generateDiabeticaResponse(message, history || []);

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Erro ao comunicar com a Diabetica:', error);
    const mapped = mapDiabeticaError(error);
    return NextResponse.json(
      { error: mapped.error, details: mapped.details },
      { status: mapped.status },
    );
  }
}
