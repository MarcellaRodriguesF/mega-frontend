"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { Provider } from "@/services/api/providers/providers.types";

interface ProviderContextProps {
  provider: Provider;
  updateProvider: (provider: Provider) => void;
}

interface ProviderContextProviderProps {
  provider: Provider;
  updateProvider: (provider: Provider) => void;
  children: ReactNode;
}

const ProviderContext = createContext<ProviderContextProps | undefined>(
  undefined,
);

export function ProviderContextProvider({
  provider,
  updateProvider,
  children,
}: ProviderContextProviderProps) {
  return (
    <ProviderContext.Provider value={{ provider, updateProvider }}>
      {children}
    </ProviderContext.Provider>
  );
}

export function useProvider() {
  const context = useContext(ProviderContext);

  if (!context) {
    throw new Error(
      "useProvider deve ser utilizado dentro de ProviderContextProvider.",
    );
  }

  return context;
}
