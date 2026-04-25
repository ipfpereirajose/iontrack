'use server';

import { getServiceSupabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function updateUserRole(userId: string, newRole: string) {
  const supabase = getServiceSupabase();
  
  const { error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId);

  if (error) throw new Error(error.message);
  
  revalidatePath('/admin/users');
  return { success: true };
}

export async function updateUserStatus(userId: string, newStatus: string) {
  const supabase = getServiceSupabase();
  
  const { error } = await supabase
    .from('profiles')
    .update({ status: newStatus })
    .eq('id', userId);

  if (error) throw new Error(error.message);
  
  revalidatePath('/admin/users');
  return { success: true };
}

export async function resetUserPassword(email: string) {
  const supabase = getServiceSupabase();
  
  const { error } = await supabase.auth.admin.generateLink({
    type: 'recovery',
    email: email
  });

  if (error) throw new Error(error.message);
  
  return { success: true };
}

export async function deleteUser(userId: string) {
  const supabase = getServiceSupabase();
  
  // This deletes from Auth, which triggers profile deletion via cascade (if configured)
  const { error } = await supabase.auth.admin.deleteUser(userId);

  if (error) throw new Error(error.message);
  
  revalidatePath('/admin/users');
  return { success: true };
}
