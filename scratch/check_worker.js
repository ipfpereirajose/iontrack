const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gjdxaejbqibwemotyvto.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqZHhhZWpicWlid2Vtb3R5dnRvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjgyODU5MSwiZXhwIjoyMDkyNDA0NTkxfQ.YiclyRBpr3-wQGeVBLh4TIdUbWGwh9csd6h8nHIa2uw';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log('--- Checking for CI: 24370632 ---');
  const { data: workers, error } = await supabase
    .from('toe_workers')
    .select('id, ci, first_name, last_name, birth_date, birth_year')
    .eq('ci', '24370632');

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Workers found:', JSON.stringify(workers, null, 2));
  
  if (workers.length > 0) {
      const worker = workers[0];
      console.log(`Checking matching for 15 MAYO 1996...`);
      // Target date: 1996-05-15
      const target = '1996-05-15';
      if (worker.birth_date === target) {
          console.log('SUCCESS: Full birth_date matches!');
      } else if (!worker.birth_date && worker.birth_year == 1996) {
          console.log('SUCCESS: Birth year matches (and date is null)!');
      } else {
          console.log('FAILURE: No match found for this date.');
          console.log(`DB Date: ${worker.birth_date}, DB Year: ${worker.birth_year}`);
      }
  }
}

check();
