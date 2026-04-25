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

export async function updateAdminUser(userId: string, data: { 
  email?: string, 
  role?: string, 
  password?: string,
  firstName?: string,
  lastName?: string
}) {
  const supabase = getServiceSupabase();
  
  // 1. Update Auth data if provided
  const authUpdates: any = {};
  if (data.email) authUpdates.email = data.email;
  if (data.password) authUpdates.password = data.password;
  
  if (Object.keys(authUpdates).length > 0) {
    const { error: authError } = await supabase.auth.admin.updateUserById(userId, authUpdates);
    if (authError) throw new Error(authError.message);
  }

  // 2. Update Profile data
  const profileUpdates: any = {};
  if (data.role) profileUpdates.role = data.role;
  if (data.firstName) profileUpdates.first_name = data.firstName;
  if (data.lastName) profileUpdates.last_name = data.lastName;

  if (Object.keys(profileUpdates).length > 0) {
    const { error: profileError } = await supabase
      .from('profiles')
      .update(profileUpdates)
      .eq('id', userId);
    if (profileError) throw new Error(profileError.message);
  }

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
