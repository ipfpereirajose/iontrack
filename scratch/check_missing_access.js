const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gjdxaejbqibwemotyvto.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqZHhhZWpicWlid2Vtb3R5dnRvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjgyODU5MSwiZXhwIjoyMDkyNDA0NTkxfQ.YiclyRBpr3-wQGeVBLh4TIdUbWGwh9csd6h8nHIa2uw';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log('--- Analizando Cobertura de Acceso ---');
  
  // 1. Get all companies
  const { data: companies, error: compError } = await supabase
    .from('companies')
    .select('id, name, company_code');

  if (compError) {
    console.error('Error fetching companies:', compError);
    return;
  }

  // 2. Get all company managers
  const { data: managers, error: userError } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('role', 'company_manager');

  if (userError) {
    console.error('Error fetching managers:', userError);
    return;
  }

  const companiesWithAccess = new Set(managers.map(m => m.company_id));
  
  console.log(`Total empresas: ${companies.length}`);
  console.log(`Empresas con acceso: ${companiesWithAccess.size}`);

  const missing = companies.filter(c => !companiesWithAccess.has(c.id));
  
  if (missing.length > 0) {
    console.log('\nEmpresas SIN acceso:');
    missing.forEach(c => {
      console.log(`- [${c.company_code}] ${c.name}`);
    });
  } else {
    console.log('\nTodas las empresas tienen acceso.');
  }
}

check();
