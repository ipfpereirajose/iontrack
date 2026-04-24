import { createClient } from '@supabase/supabase-js';

async function checkSchema() {
  const supabase = createClient(
    'https://gjdxaejbqibwemotyvto.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqZHhhZWpicWlid2Vtb3R5dnRvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjgyODU5MSwiZXhwIjoyMDkyNDA0NTkxfQ.YiclyRBpr3-wQGeVBLh4TIdUbWGwh9csd6h8nHIa2uw'
  );

  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error selecting from companies:', error);
  } else {
    console.log('Columns in companies:', Object.keys(data[0] || {}));
  }
}

checkSchema();
