"use client";

import { useState, useEffect } from "react";
import venezuelaData from "@/data/venezuela.json";

interface Municipio {
  municipio: string;
  parroquias: string[];
}

interface Estado {
  estado: string;
  municipios: Municipio[];
}

interface Props {
  inputStyle: any;
}

export default function TerritorialSelector({ inputStyle }: Props) {
  const [selectedEstado, setSelectedEstado] = useState("");
  const [selectedMunicipio, setSelectedMunicipio] = useState("");
  const [selectedParroquia, setSelectedParroquia] = useState("");

  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [parroquias, setParroquias] = useState<string[]>([]);

  // Update municipios when estado changes
  useEffect(() => {
    const estado = (venezuelaData as Estado[]).find(
      (e) => e.estado === selectedEstado,
    );
    if (estado) {
      setMunicipios(estado.municipios);
      setSelectedMunicipio("");
      setParroquias([]);
      setSelectedParroquia("");
    } else {
      setMunicipios([]);
    }
  }, [selectedEstado]);

  // Update parroquias when municipio changes
  useEffect(() => {
    const municipio = municipios.find((m) => m.municipio === selectedMunicipio);
    if (municipio) {
      setParroquias(municipio.parroquias);
      setSelectedParroquia("");
    } else {
      setParroquias([]);
    }
  }, [selectedMunicipio, municipios]);

  return (
    <>
      <div className="input-group">
        <label style={labelStyle}>Estado</label>
        <select
          name="state"
          required
          value={selectedEstado}
          onChange={(e) => setSelectedEstado(e.target.value)}
          style={inputStyle}
        >
          <option value="">Seleccione Estado...</option>
          {(venezuelaData as Estado[]).map((e) => (
            <option key={e.estado} value={e.estado}>
              {e.estado}
            </option>
          ))}
        </select>
      </div>

      <div className="input-group">
        <label style={labelStyle}>Municipio</label>
        <select
          name="municipality"
          required
          value={selectedMunicipio}
          onChange={(e) => setSelectedMunicipio(e.target.value)}
          style={inputStyle}
          disabled={!selectedEstado}
        >
          <option value="">Seleccione Municipio...</option>
          {municipios.map((m) => (
            <option key={m.municipio} value={m.municipio}>
              {m.municipio}
            </option>
          ))}
        </select>
      </div>

      <div className="input-group">
        <label style={labelStyle}>Parroquia</label>
        <select
          name="parish"
          required
          value={selectedParroquia}
          onChange={(e) => setSelectedParroquia(e.target.value)}
          style={inputStyle}
          disabled={!selectedMunicipio}
        >
          <option value="">Seleccione Parroquia...</option>
          {parroquias.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}

const labelStyle = {
  display: "block",
  fontSize: "0.75rem",
  fontWeight: 800,
  color: "var(--text-muted)",
  marginBottom: "0.5rem",
  textTransform: "uppercase",
} as any;
