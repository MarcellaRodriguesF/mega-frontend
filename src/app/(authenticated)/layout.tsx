"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";

import AppLayout from "@/components/layout/AppLayout/AppLayout";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import MegaLoader from "@/components/ui/MegaLoader/MegaLoader";
import { ToastProvider } from "@/contexts/ToastContext";
import QueryProvider from "@/providers/QueryProvider";
import { DrawerProvider } from "@/contexts/DrawerContext";

function ProtectedLayout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, user, router, pathname]);

  if (isLoading || !user) {
    return <MegaLoader />;
  }

  return <AppLayout>{children}</AppLayout>;
}

export default function AuthenticatedLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <QueryProvider>
      <AuthProvider>
        <ToastProvider>
          <DrawerProvider>
            <ProtectedLayout>{children}</ProtectedLayout>
          </DrawerProvider>
        </ToastProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
