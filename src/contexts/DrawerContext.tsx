"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

interface DrawerContextData {
  openDrawer: (content: ReactNode) => void;
  closeDrawer: () => void;
  isDrawerOpen: boolean;
}

const DrawerContext = createContext<DrawerContextData | undefined>(undefined);

export function DrawerProvider({ children }: { children: ReactNode }) {
  const [drawerContent, setDrawerContent] = useState<ReactNode | null>(null);

  const openDrawer = useCallback((content: ReactNode) => {
    setDrawerContent(content);
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerContent(null);
  }, []);

  return (
    <DrawerContext.Provider
      value={{
        openDrawer,
        closeDrawer,
        isDrawerOpen: drawerContent !== null,
      }}
    >
      {children}
      {drawerContent}
    </DrawerContext.Provider>
  );
}

export function useDrawerContext() {
  const context = useContext(DrawerContext);

  if (!context) {
    throw new Error(
      "useDrawerContext deve ser utilizado dentro de DrawerProvider.",
    );
  }

  return context;
}
