'use server';

import { createClient } from '@/utils/supabase/server';
import { getCurrentProfile } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createCompany(formData: FormData) {
  const supabase = await createClient();
  const { user, profile } = await getCurrentProfile();
  if (!user) throw new Error('No autenticado');
  if (!profile?.tenant_id) throw new Error('Usuario sin laboratorio asignado');

  // 2. Extract form data
  const name = formData.get('name') as string;
  const tax_id = formData.get('tax_id') as string;
  const address = formData.get('address') as string;
  const contact_phone = formData.get('contact_phone') as string;

  // 3. Insert into database
  const { error } = await supabase
    .from('companies')
    .insert([
      {
        name,
        tax_id,
        address,
        contact_phone,
        tenant_id: profile.tenant_id,
      },
    ]);

  if (error) {
    console.error('Error creating company:', error);
    throw new Error(error.message);
  }

  // 4. Revalidate and redirect
  revalidatePath('/lab/companies');
  redirect('/lab/companies');
}
