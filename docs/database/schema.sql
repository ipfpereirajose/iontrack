-- I.O.N.T.R.A.C.K. DATABASE SCHEMA
-- Multi-tenant Dosimetry System

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TENANTS (Laboratories)
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    rif VARCHAR(50) UNIQUE,
    address TEXT,
    state VARCHAR(100),
    municipality VARCHAR(100),
    parish VARCHAR(100),
    rep_first_name VARCHAR(100),
    rep_last_name VARCHAR(100),
    rep_ci VARCHAR(50),
    mobile_phone VARCHAR(50),
    office_phone VARCHAR(50),
    email VARCHAR(255),
    rep_phone VARCHAR(50),
    rep_email VARCHAR(255),
    billing_status VARCHAR(20) DEFAULT 'active' CHECK (billing_status IN ('active', 'past_due', 'suspended')),
    monthly_fee DECIMAL(10, 2) DEFAULT 300.00,
    logo_url TEXT,
    config JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. COMPANIES (Clients of the Labs)
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL, -- ENTIDAD
    tipo_rif VARCHAR(10), -- TIPO RIF
    tax_id VARCHAR(50), -- RIF (Número)
    tipo VARCHAR(100), -- TIPO
    sector VARCHAR(100), -- SECTOR
    company_code VARCHAR(100), -- Código único interno
    address TEXT, -- DIRECCIÓN
    state VARCHAR(100), -- ESTADO
    municipality VARCHAR(100), -- MUNICIPIO
    parish VARCHAR(100), -- PARROQUIA
    email VARCHAR(255), -- EMAIL
    phone_local VARCHAR(50), -- TELF LOCAL
    phone_mobile VARCHAR(50), -- TELF MÓVIL
    -- OSR Info
    rep_first_name VARCHAR(100), -- OSR NOM
    rep_last_name VARCHAR(100), -- OSR APE
    osr_nac VARCHAR(10), -- OSR NAC
    rep_ci VARCHAR(50), -- OSR CI
    rep_email VARCHAR(255), -- OSR EMAIL
    rep_phone VARCHAR(50), -- OSR TELF
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, tax_id, address, state, municipality, parish),
    UNIQUE(tenant_id, company_code)
);

-- 4. USER PROFILES (RBAC)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id),
    company_id UUID REFERENCES public.companies(id),
    role VARCHAR(20) NOT NULL CHECK (role IN ('superadmin', 'lab_admin', 'lab_tech', 'company_manager', 'toe')),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TOE WORKERS (Occupational Exposed Workers)
CREATE TABLE IF NOT EXISTS public.toe_workers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    worker_code VARCHAR(100), -- Código interno
    first_name VARCHAR(100) NOT NULL, -- Nombre
    last_name VARCHAR(100) NOT NULL, -- Apellido
    ci VARCHAR(20) NOT NULL, -- CI
    sex VARCHAR(10), -- Sexo (M/F)
    birth_year INTEGER, -- Año de nacimiento (DEPRECATED: Use birth_date)
    birth_date DATE, -- Fecha de nacimiento (DD/MM/AAAA)
    position VARCHAR(100), -- Cargo
    practice VARCHAR(255), -- Práctica que realiza
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, ci)
);

-- 6. DOSIMETRY RECORDS
CREATE TABLE IF NOT EXISTS public.doses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    toe_worker_id UUID REFERENCES public.toe_workers(id) ON DELETE CASCADE,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL,
    periodo VARCHAR(50), -- Periodo (ej: 01-2024)
    hp10 DECIMAL(10, 4) DEFAULT 0, -- Mes Hp(10)
    hp007 DECIMAL(10, 4) DEFAULT 0, -- Mes Hp(0.07)
    hp007_ext DECIMAL(10, 4) DEFAULT 0, -- Mes Hp(0.07) Extremidades
    hp3 DECIMAL(10, 4) DEFAULT 0, -- Mes Hp(3)
    hp10_neu DECIMAL(10, 4) DEFAULT 0, -- Mes Hp(10) Neutrones
    -- Cumulative (Vida) - Often calculated, but stored for migration
    vida_hp10 DECIMAL(12, 4) DEFAULT 0,
    vida_hp007 DECIMAL(12, 4) DEFAULT 0,
    vida_hp007_ext DECIMAL(12, 4) DEFAULT 0,
    vida_hp3 DECIMAL(12, 4) DEFAULT 0,
    vida_hp10_neu DECIMAL(12, 4) DEFAULT 0,
    observacion TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    approved_by UUID REFERENCES public.profiles(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    raw_data_json JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id),
    user_id UUID REFERENCES public.profiles(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id UUID,
    old_data JSONB,
    new_data JSONB,
    justification TEXT,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id),
    company_id UUID REFERENCES public.companies(id),
    user_id UUID REFERENCES public.profiles(id),
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8.5 INCIDENTS (Radiological overexposure tickets)
CREATE TABLE IF NOT EXISTS public.incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    toe_worker_id UUID REFERENCES public.toe_workers(id) ON DELETE CASCADE,
    dose_id UUID REFERENCES public.doses(id) ON DELETE CASCADE,
    severity VARCHAR(20) CHECK (severity IN ('warning', 'critical')),
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'closed')),
    corrective_action_text TEXT,
    closed_by UUID REFERENCES public.profiles(id),
    closed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. CHANGE REQUESTS (For Lab/Company Updates)
CREATE TABLE IF NOT EXISTS public.change_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    requested_by UUID REFERENCES public.profiles(id),
    entity_type VARCHAR(50) DEFAULT 'tenant', -- 'tenant' or 'company'
    entity_id UUID, -- ID of the record in tenants or companies
    old_data JSONB,
    new_data JSONB,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by UUID REFERENCES public.profiles(id),
    review_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. NATIONAL DOSE HISTORY VIEW (Consolidated by CI)
CREATE OR REPLACE VIEW public.national_dose_history AS
SELECT 
    w.ci,
    w.first_name,
    w.last_name,
    w.sex,
    w.birth_year,
    w.birth_date,
    COUNT(d.id) as total_reports,
    SUM(d.hp10) as total_hp10,
    SUM(d.hp007) as total_hp007,
    SUM(d.hp007_ext) as total_hp007_ext,
    SUM(d.hp3) as total_hp3,
    SUM(d.hp10_neu) as total_hp10_neu,
    MAX(d.year) as last_report_year,
    MAX(d.month) as last_report_month
FROM 
    public.toe_workers w
JOIN 
    public.doses d ON w.id = d.toe_worker_id
WHERE 
    d.status = 'approved'
GROUP BY 
    w.ci, w.first_name, w.last_name, w.sex, w.birth_year, w.birth_date;

-- 11. ROW LEVEL SECURITY (RLS) POLICIES

-- Enable RLS
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.toe_workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.change_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

-- Helper function to break recursion
CREATE OR REPLACE FUNCTION public.get_auth_tenant()
RETURNS UUID AS $$
  SELECT tenant_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.check_is_superadmin() 
RETURNS BOOLEAN AS $$
  SELECT role = 'superadmin' FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Tenants: Superadmin only
CREATE POLICY "Superadmin manages tenants" ON public.tenants 
    FOR ALL USING (check_is_superadmin());

-- Profiles: Own profile or same tenant (using non-recursive helper)
CREATE POLICY "Profiles access" ON public.profiles
    FOR SELECT USING (
        id = auth.uid() 
        OR tenant_id = get_auth_tenant()
        OR check_is_superadmin()
    );

-- TOE Workers: Isolation by tenant/company
CREATE POLICY "Worker access" ON public.toe_workers
    FOR ALL USING (
        company_id IN (
            SELECT id FROM public.companies 
            WHERE tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
        )
        OR company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
        OR check_is_superadmin()
    );

-- Doses: Multi-layer protection
CREATE POLICY "Dose access" ON public.doses
    FOR ALL USING (
        toe_worker_id IN (
            SELECT id FROM public.toe_workers 
            WHERE company_id IN (
                SELECT id FROM public.companies 
                WHERE tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
            )
            OR company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
        )
        OR check_is_superadmin()
    );

-- Incidents: Access by tenant (Lab) and company (B2B)
CREATE POLICY "Incident access" ON public.incidents
    FOR ALL USING (
        tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
        OR company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
        OR check_is_superadmin()
    );
