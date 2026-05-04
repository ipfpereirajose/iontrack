"use server";

import { createClient } from "@/utils/supabase/server";
import { getServiceSupabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function requestChangeAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: profile } = await supabase
    .from("profiles")
    .select("tenant_id, company_id")
    .eq("id", user.id)
    .single();

  const newData = {
    name: formData.get("name"),
    tax_id: formData.get("tax_id"),
    address: formData.get("address"),
    phone_local: formData.get("phone_local"),
    phone_mobile: formData.get("phone_mobile"),
    email: formData.get("email"),
    rep_first_name: formData.get("rep_first_name"),
    rep_last_name: formData.get("rep_last_name"),
    rep_phone: formData.get("rep_phone"),
    rep_email: formData.get("rep_email"),
  };

  const { data: currentCompany } = await supabase
    .from("companies")
    .select("*")
    .eq("id", profile?.company_id)
    .single();

  const serviceSupabase = getServiceSupabase();
  await serviceSupabase.from("change_requests").insert({
    tenant_id: profile?.tenant_id,
    requested_by: user.id,
    entity_type: "company",
    entity_id: profile?.company_id,
    old_data: currentCompany,
    new_data: newData,
    status: "pending",
  });

  revalidatePath("/portal/settings");
}
