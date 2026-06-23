import { DIABETICA_NOT_CONFIGURED_MESSAGE, getDiabeticaApiUrl } from '@/lib/diabetica-config';

export const DIABETICA_SYSTEM_PROMPT =
  'Você é um assistente especializado em diabetes, baseado no modelo Diabetica. Seja extremamente breve e conciso nas suas respostas (no máximo 2 a 3 frases curtas). Forneça informações precisas sobre diabetes, mas sempre recomende que o usuário consulte um médico para decisões clínicas.';

export const DIABETICA_EASY_SETUP_MESSAGE =
  'Configure GROQ_API_KEY no painel da Vercel (grátis em console.groq.com) para usar a Diabetica em produção sem servidor Python.';

type ChatHistory = [string, string][];

function buildGroqMessages(message: string, history: ChatHistory = []) {
  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: DIABETICA_SYSTEM_PROMPT },
  ];

  for (const [userText, assistantText] of history) {
    messages.push({ role: 'user', content: userText });
    messages.push({ role: 'assistant', content: assistantText });
  }

  messages.push({ role: 'user', content: message });
  return messages;
}

async function callPythonDiabetica(
  message: string,
  history: ChatHistory,
  apiUrl: string,
  timeoutMs: number,
) {
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history }),
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro na LLM: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  if (!data.response) {
    throw new Error(data.error || 'A Diabetica não retornou resposta.');
  }

  return data.response as string;
}

async function callGroqDiabetica(
  message: string,
  history: ChatHistory,
  timeoutMs: number,
) {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(DIABETICA_EASY_SETUP_MESSAGE);
  }

  const model = process.env.GROQ_MODEL?.trim() || 'llama-3.1-8b-instant';

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: buildGroqMessages(message, history),
      max_tokens: 256,
      temperature: 0.7,
    }),
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro na Groq: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error('A Diabetica não retornou resposta.');
  }

  return content as string;
}

export function hasDiabeticaBackendConfigured() {
  return Boolean(getDiabeticaApiUrl() || process.env.GROQ_API_KEY?.trim());
}

export async function generateDiabeticaResponse(
  message: string,
  history: ChatHistory = [],
  timeoutMs = 180000,
): Promise<string> {
  const pythonApiUrl = getDiabeticaApiUrl();

  if (pythonApiUrl) {
    return callPythonDiabetica(message, history, pythonApiUrl, timeoutMs);
  }

  if (process.env.GROQ_API_KEY?.trim()) {
    return callGroqDiabetica(message, history, timeoutMs);
  }

  throw new Error(`${DIABETICA_NOT_CONFIGURED_MESSAGE} ${DIABETICA_EASY_SETUP_MESSAGE}`);
}

export function mapDiabeticaError(error: unknown) {
  const message = error instanceof Error ? error.message : 'Erro desconhecido';

  if (error instanceof Error && (error.name === 'AbortError' || error.name === 'TimeoutError')) {
    return {
      status: 504,
      error: 'O serviço Diabetica demorou muito para responder.',
      details: message,
    };
  }

  if (
    message.includes('fetch failed') ||
    (error as NodeJS.ErrnoException)?.code === 'ECONNREFUSED'
  ) {
    return {
      status: 503,
      error:
        'A API Diabetica local não está acessível. Em produção, configure GROQ_API_KEY na Vercel.',
      details: message,
    };
  }

  if (
    message.includes('DIABETICA_API_URL') ||
    message.includes('GROQ_API_KEY') ||
    message.includes('não está configurada')
  ) {
    return {
      status: 503,
      error: message,
      details: message,
    };
  }

  return {
    status: 500,
    error: 'Erro interno ao processar a requisição com a LLM.',
    details: message,
  };
}
