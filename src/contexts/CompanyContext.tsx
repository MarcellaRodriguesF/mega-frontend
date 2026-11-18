"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { Company } from "@/services/api/companies/companies.types";

interface CompanyContextProps {
  company: Company;
  updateCompany: (company: Company) => void;
}

interface CompanyProviderProps {
  company: Company;
  updateCompany: (company: Company) => void;
  children: ReactNode;
}

const CompanyContext = createContext<CompanyContextProps | undefined>(
  undefined,
);

export function CompanyProvider({
  company,
  updateCompany,
  children,
}: CompanyProviderProps) {
  return (
    <CompanyContext.Provider value={{ company, updateCompany }}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);

  if (!context) {
    throw new Error("useCompany deve ser utilizado dentro de CompanyProvider.");
  }

  return context;
}
