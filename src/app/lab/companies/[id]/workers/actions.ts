'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createWorker(companyId: string, formData: FormData) {
  const supabase = await createClient();

  // 1. Verify access: Check if the company belongs to the user's tenant
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single();

  const { data: company } = await supabase
    .from('companies')
    .select('tenant_id')
    .eq('id', companyId)
    .single();

  if (!profile || !company || profile.tenant_id !== company.tenant_id) {
    throw new Error('No tienes permiso para agregar trabajadores a esta empresa');
  }

  // 2. Extract worker data
  const first_name = formData.get('first_name') as string;
  const last_name = formData.get('last_name') as string;
  const ci = formData.get('ci') as string;
  const email = formData.get('email') as string;
  const position = formData.get('position') as string;

  // 3. Insert into database
  const { error } = await supabase
    .from('toe_workers')
    .insert([
      {
        first_name,
        last_name,
        ci,
        email,
        position,
        company_id: companyId,
        status: 'active',
      },
    ]);

  if (error) {
    console.error('Error creating worker:', error);
    throw new Error(error.message);
  }

  // 4. Revalidate and redirect
  revalidatePath(`/lab/companies/${companyId}/workers`);
  redirect(`/lab/companies/${companyId}/workers`);
}
