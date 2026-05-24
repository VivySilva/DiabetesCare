import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, history } = body;

    if (!message) {
      return NextResponse.json({ error: 'A mensagem é obrigatória.' }, { status: 400 });
    }
    
    // URL do serviço API Diabetica (Python Flask)
    const DIABETICA_API_URL = process.env.DIABETICA_API_URL || 'http://localhost:5000/predict';

    const response = await fetch(DIABETICA_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        message: message,
        history: history || []
      }),
      signal: AbortSignal.timeout(180000) // 3 minutos de timeout pois a LLM pode demorar
    });

    if (!response.ok) {
       const errorText = await response.text();
       throw new Error(`Erro na LLM: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    // Retornamos no mesmo formato que o frontend espera: { response: "texto..." }
    return NextResponse.json({ response: data.response });
  } catch (error: any) {
    console.error('Erro ao comunicar com a API Diabetica (Flask):', error.message);

    if (error.name === 'AbortError' || error.name === 'TimeoutError') {
      return NextResponse.json({ error: 'O serviço Diabetica demorou muito para responder.' }, { status: 504 });
    }

    if (error.message.includes('fetch failed') || error.code === 'ECONNREFUSED') {
      return NextResponse.json({ 
        error: 'A API Diabetica não está em execução ou está inacessível. Verifique se o servidor Python (app.py) está rodando na porta 5000.',
        details: error.message 
      }, { status: 503 });
    }

    return NextResponse.json({ 
      error: 'Erro interno ao processar a requisição com a LLM.',
      details: error.message 
    }, { status: 500 });
  }
}
