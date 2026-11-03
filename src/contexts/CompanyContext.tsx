"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { Company } from "@/services/api/companies/companies.types";

interface CompanyContextProps {
  company: Company;
}

interface CompanyProviderProps {
  company: Company;
  children: ReactNode;
}

const CompanyContext = createContext<CompanyContextProps | undefined>(
  undefined,
);

export function CompanyProvider({ company, children }: CompanyProviderProps) {
  return (
    <CompanyContext.Provider value={{ company }}>
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
