const LOCAL_DIABETICA_URL = 'http://localhost:5000/predict';

export function getDiabeticaApiUrl(): string | null {
  const configuredUrl = process.env.DIABETICA_API_URL?.trim();

  if (configuredUrl) {
    return configuredUrl;
  }

  const isProduction =
    process.env.NODE_ENV === 'production' ||
    process.env.VERCEL === '1' ||
    process.env.VERCEL === 'true';

  if (isProduction) {
    return null;
  }

  return LOCAL_DIABETICA_URL;
}

export const DIABETICA_NOT_CONFIGURED_MESSAGE =
  'A API Diabetica não está configurada em produção. Defina a variável DIABETICA_API_URL no painel de deploy (ex.: Vercel) apontando para o servidor Python (app.py) publicado na nuvem.';
