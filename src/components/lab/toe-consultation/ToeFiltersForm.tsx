import { Search, Filter } from "lucide-react";
import { getServiceSupabase } from "@/lib/supabase";

export default async function ToeFiltersForm({ tenantId, currentQuery, currentCompany }: { tenantId: string, currentQuery?: string, currentCompany?: string }) {
  const adminSupabase = getServiceSupabase();
  
  const { data: companies } = await adminSupabase
    .from("companies")
    .select("id, name")
    .eq("tenant_id", tenantId)
    .order("name");

  return (
    <div className="glass-panel" style={{ padding: "1.5rem", marginBottom: "2rem", display: "flex", gap: "1rem", alignItems: "flex-end" }}>
      <form style={{ flex: 1, display: "flex", gap: "1rem" }}>
        <div style={{ flex: 2 }}>
          <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 900, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.5rem" }}>Buscar por Nombre o CI</label>
          <div style={{ position: "relative" }}>
            <Search size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input 
              name="query"
              defaultValue={currentQuery}
              placeholder="Ej: Juan Perez o 12.345.678" 
              style={{ width: "100%", height: "48px", padding: "0 1rem", paddingLeft: "3rem", background: "white", border: "1px solid var(--border)", borderRadius: "12px", fontSize: "0.95rem", fontWeight: 600 }} 
            />
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 900, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.5rem" }}>Filtrar por Empresa</label>
          <select name="company" defaultValue={currentCompany} style={{ width: "100%", height: "48px", padding: "0 1rem", background: "white", border: "1px solid var(--border)", borderRadius: "12px", fontSize: "0.95rem", fontWeight: 600 }}>
            <option value="">Todas las Empresas</option>
            {companies?.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn-primary" style={{ height: "48px", padding: "0 2rem" }}>
          <Filter size={18} /> Filtrar
        </button>
      </form>
    </div>
  );
}
