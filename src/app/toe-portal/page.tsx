"use client";

import { useState } from "react";
import ToeLoginWidget from "@/components/toe-portal/ToeLoginWidget";
import ToeAccountsWidget from "@/components/toe-portal/ToeAccountsWidget";
import ToeReportWidget from "@/components/toe-portal/ToeReportWidget";

export default function ToePortal() {
  const [step, setStep] = useState<"login" | "accounts" | "report">("login");
  const [ci, setCi] = useState("");
  const [day, setDay] = useState("1");
  const [month, setMonth] = useState("1");
  const [year, setYear] = useState("1996");
  const [data, setData] = useState<any>(null);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // In this version, we use the year for validation as we don't have full birth_date yet in all records
      const res = await fetch(`/api/toe/check?ci=${ci}&birth_year=${year}&day=${day}&month=${month}`);
      const result = await res.json();

      if (result.error) {
        setError("Cédula o Fecha de Nacimiento no válidas.");
      } else {
        setData(result);
        if (result.accounts.length === 1) {
          setSelectedAccount(result.accounts[0]);
          setStep("report");
        } else {
          setStep("accounts");
        }
      }
    } catch (err) {
      setError("Error de conexión. Intente más tarde.");
    } finally {
      setLoading(false);
    }
  };

  if (step === "login") {
    return (
      <ToeLoginWidget 
        ci={ci} 
        setCi={setCi} 
        day={day} 
        setDay={setDay} 
        month={month} 
        setMonth={setMonth} 
        year={year} 
        setYear={setYear} 
        handleLogin={handleLogin} 
        loading={loading} 
        error={error} 
      />
    );
  }

  if (step === "accounts") {
    return (
      <ToeAccountsWidget 
        data={data} 
        ci={ci} 
        setSelectedAccount={setSelectedAccount} 
        setStep={setStep} 
      />
    );
  }

  if (step === "report") {
    return (
      <ToeReportWidget 
        selectedAccount={selectedAccount} 
        data={data} 
        day={day} 
        month={month} 
        year={year} 
        setStep={setStep} 
      />
    );
  }

  return null;
}
