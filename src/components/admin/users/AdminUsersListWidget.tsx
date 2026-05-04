import { getServiceSupabase } from "@/lib/supabase";
import UserManager from "@/components/admin/UserManager";
import EditUserModal from "@/app/admin/users/EditUserModal";

export default async function AdminUsersListWidget() {
  const supabase = getServiceSupabase();

  // Fetch all profiles and auth users in parallel
  const [
    { data: profiles, error: pError },
    { data: { users: authUsers }, error: aError }
  ] = await Promise.all([
    supabase.from("profiles").select("*, tenants(name)").order("created_at", { ascending: false }),
    supabase.auth.admin.listUsers()
  ]);

  if (pError || aError) {
    return (
      <div className="p-8 text-red-500">Error al cargar administradores.</div>
    );
  }

  // Combine data
  const users = profiles.map((profile) => {
    const authUser = authUsers.find((u) => u.id === profile.id);
    return {
      ...profile,
      email: authUser?.email || "N/A",
      lastSignIn: authUser?.last_sign_in_at,
    };
  });

  return (
    <>
      <UserManager users={users} />
      <EditUserModal users={users} />
    </>
  );
}
