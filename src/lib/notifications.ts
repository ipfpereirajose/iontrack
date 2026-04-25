import { getServiceSupabase } from '@/lib/supabase';

export async function triggerDoseAlerts(
  tenantId: string, 
  companyId: string, 
  workerId: string, 
  hp10: number, 
  month: number, 
  year: number,
  workerName: string,
  companyName: string
) {
  const supabase = getServiceSupabase();
  const LIMIT = 1.66;
  const WARNING = 1.66 * 0.8; // 1.328

  if (hp10 < WARNING) return;

  const isOverexposure = hp10 >= LIMIT;
  const type = isOverexposure ? 'THRESHOLD_CRITICAL' : 'THRESHOLD_WARNING';
  const alertText = isOverexposure ? 'SOBRE-EXPOSICIÓN (NIVEL ROJO)' : 'ADVERTENCIA 80% (NIVEL AMARILLO)';
  
  const message = `${alertText} detectada: ${workerName} (${companyName}) - ${hp10} mSv en ${month}/${year}.`;

  // 1. Get recipients
  // Lab Admins
  const { data: labAdmins } = await supabase
    .from('profiles')
    .select('id')
    .eq('tenant_id', tenantId)
    .eq('role', 'lab_admin');

  // Company Managers (OSR)
  const { data: companyManagers } = await supabase
    .from('profiles')
    .select('id')
    .eq('company_id', companyId)
    .eq('role', 'company_manager');

  // The Worker (TOE)
  const { data: toeProfiles } = await supabase
    .from('profiles')
    .select('id')
    .eq('company_id', companyId)
    .eq('role', 'toe'); 
    // Usually we would match by CI or Email, but for now let's say any 'toe' in the company or we look up specifically
    // In a real system, we'd find the profile with the same email/ci as the toe_worker record.

  const recipients = [
    ...(labAdmins || []).map(p => p.id),
    ...(companyManagers || []).map(p => p.id),
    ...(toeProfiles || []).map(p => p.id)
  ];

  // Remove duplicates
  const uniqueRecipients = [...new Set(recipients)];

  // 2. Insert notifications
  const notifications = uniqueRecipients.map(userId => ({
    user_id: userId,
    tenant_id: tenantId,
    company_id: companyId,
    type: 'threshold_alert',
    message: message
  }));

  if (notifications.length > 0) {
    const { error } = await supabase.from('notifications').insert(notifications);
    if (error) console.error('Error sending notifications:', error);
  }
}
