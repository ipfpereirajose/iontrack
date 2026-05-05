-- ============================================================
-- MIGRATION: Add dosimetric report fields to companies & tenants
-- IonTrack - Formato Informe Mensual Physion
-- Run this in the Supabase SQL Editor
-- ============================================================

-- 1. Add new fields to companies table
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS departamento VARCHAR(200),          -- Ej: RADIOLOGIA
  ADD COLUMN IF NOT EXISTS tipo_radiacion VARCHAR(200),        -- Ej: PENETRANTE Y NO PENETRANTE
  ADD COLUMN IF NOT EXISTS ubicacion_dosimetro VARCHAR(200),   -- Ej: TORAX
  ADD COLUMN IF NOT EXISTS fecha_inicio_servicio DATE;         -- Ej: 2023-09-01

-- 2. Add new fields to tenants table (lab signature / MPPS info)
ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS mpps_auth VARCHAR(100),             -- Ej: 0012-2022
  ADD COLUMN IF NOT EXISTS rep_title VARCHAR(100),             -- Ej: Ing.
  ADD COLUMN IF NOT EXISTS rep_cargo VARCHAR(100);             -- Ej: Presidente

-- Verification
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'companies'
  AND column_name IN ('departamento', 'tipo_radiacion', 'ubicacion_dosimetro', 'fecha_inicio_servicio');

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'tenants'
  AND column_name IN ('mpps_auth', 'rep_title', 'rep_cargo');
