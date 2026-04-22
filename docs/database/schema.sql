-- I.O.N.T.R.A.C.K. DATABASE SCHEMA
-- Multi-tenant Dosimetry System

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TENANTS (Laboratories)
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
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
    name VARCHAR(255) NOT NULL,
    tax_id VARCHAR(50) UNIQUE,
    address TEXT,
    contact_phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
    ci VARCHAR(20) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    position VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, ci)
);

-- 6. DOSIMETRY RECORDS
CREATE TABLE IF NOT EXISTS public.doses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    worker_id UUID REFERENCES public.toe_workers(id) ON DELETE CASCADE,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL,
    hp10 DECIMAL(10, 4) DEFAULT 0, -- Deep dose
    hp3 DECIMAL(10, 4) DEFAULT 0,  -- Eye dose
    hp007 DECIMAL(10, 4) DEFAULT 0, -- Skin dose
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    approved_by UUID REFERENCES public.profiles(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    raw_data_json JSONB, -- Original data from agent
    sync_id VARCHAR(100), -- Reference to local agent record
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
    type VARCHAR(50) NOT NULL, -- 'threshold_alert', 'billing_alert', 'system'
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. ROW LEVEL SECURITY (RLS) POLICIES

-- Enable RLS
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.toe_workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- SuperAdmin Policy: Full Access
-- (Requires a custom function or check for superadmin role)
CREATE OR REPLACE FUNCTION public.is_superadmin() 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'superadmin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Tenants: Superadmin only
CREATE POLICY "Superadmin manages tenants" ON public.tenants 
    FOR ALL USING (is_superadmin());

-- Companies: Lab Admins can manage their own, Company Managers can view their own
CREATE POLICY "Lab Admin manages their companies" ON public.companies 
    FOR ALL USING (
        tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()) 
        OR is_superadmin()
    );

-- Profiles: Own profile or Lab Admin of the same tenant
CREATE POLICY "Profiles access" ON public.profiles
    FOR SELECT USING (
        id = auth.uid() 
        OR tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
        OR is_superadmin()
    );

-- TOE Workers: Isolation by tenant/company
CREATE POLICY "Worker access" ON public.toe_workers
    FOR ALL USING (
        company_id IN (
            SELECT id FROM public.companies 
            WHERE tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
        )
        OR company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
        OR is_superadmin()
    );

-- Doses: Multi-layer protection
CREATE POLICY "Dose access" ON public.doses
    FOR ALL USING (
        worker_id IN (
            SELECT id FROM public.toe_workers 
            WHERE company_id IN (
                SELECT id FROM public.companies 
                WHERE tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
            )
            OR company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
        )
        OR is_superadmin()
    );
