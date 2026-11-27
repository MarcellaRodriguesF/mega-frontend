"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { Company } from "@/services/api/companies/companies.types";
import { Unit } from "@/services/api/units/units.types";

interface UnitContextProps {
  unit: Unit;
  updateUnit: (unit: Unit) => void;
}

interface UnitProviderProps {
  unit: Unit;
  updateUnit: (unit: Unit) => void;
  children: ReactNode;
}

const UnitContext = createContext<UnitContextProps | undefined>(
  undefined,
);

export function UnitProvider({
  unit,
  updateUnit,
  children,
}: UnitProviderProps) {
  return (
    <UnitContext.Provider value={{ unit, updateUnit }}>
      {children}
    </UnitContext.Provider>
  );
}

export function useUnit() {
  const context = useContext(UnitContext);

  if (!context) {
    throw new Error("useUnit deve ser utilizado dentro de UnitProvider.");
  }

  return context;
}
