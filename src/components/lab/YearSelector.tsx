
"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function YearSelector({ currentYear }: { currentYear: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleYearChange = (year: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("year", year);
    router.push(`?${params.toString()}`);
  };

  return (
    <select
      value={currentYear.toString()}
      onChange={(e) => handleYearChange(e.target.value)}
      className="glass-card"
      style={{
        padding: "0.6rem 1rem",
        borderRadius: "10px",
        border: "1px solid var(--border)",
        background: "rgba(255,255,255,0.05)",
        color: "inherit",
        cursor: "pointer",
        fontWeight: 600
      }}
    >
      {[2024, 2025, 2026].map((y) => (
        <option key={y} value={y.toString()}>
          Año {y}
        </option>
      ))}
    </select>
  );
}
