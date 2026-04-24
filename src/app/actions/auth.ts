'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  // Clear the role hint cookie
  const cookieStore = await cookies();
  cookieStore.delete('iontrack_role');
  redirect('/');
}
