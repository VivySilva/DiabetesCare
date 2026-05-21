-- =====================================================
-- MIGRAÇÃO: Adicionar campos de perfil profissional
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =====================================================

-- Campos do Profissional de Saúde
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS cpf             TEXT,
  ADD COLUMN IF NOT EXISTS birth_date      DATE,
  ADD COLUMN IF NOT EXISTS specialty       TEXT,
  ADD COLUMN IF NOT EXISTS crm             TEXT,
  ADD COLUMN IF NOT EXISTS crm_uf          TEXT,
  ADD COLUMN IF NOT EXISTS education       TEXT,
  ADD COLUMN IF NOT EXISTS clinic_address  TEXT;

-- Campos do Paciente (caso não existam)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS age            INTEGER,
  ADD COLUMN IF NOT EXISTS gender         TEXT,
  ADD COLUMN IF NOT EXISTS diabetes_type  TEXT,
  ADD COLUMN IF NOT EXISTS phone          TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url     TEXT,
  ADD COLUMN IF NOT EXISTS updated_at     TIMESTAMPTZ DEFAULT NOW();

-- Verificar as colunas criadas
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
