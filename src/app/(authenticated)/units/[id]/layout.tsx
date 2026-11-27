"use client";

import { useEffect, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";

import { PageContainer } from "@/components/layout/PageContainer/PageContainer";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import Tabs from "@/components/ui/Tabs/Tabs";
import type { PageStateType } from "@/components/ui/PageState/PageState";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";

import { UnitProvider } from "@/contexts/UnitContext";

import { unitsApi } from "@/services/api/units/units.api";
import { ApiError } from "@/services/api/api-client";

import {
  UnitStatusLabel,
  UnitStatusColor,
} from "@/constants/enums/units/unit-status.enum";

import type { Unit } from "@/services/api/units/units.types";

const unitTabs = [
  { value: "general", label: "Geral" },
  { value: "installations", label: "Implantações" },
  { value: "connectivity", label: "Conectividade" },
  { value: "documents", label: "Documentos" },
  { value: "history", label: "Histórico" },
];

function getPageState(statusCode?: number): PageStateType {
  if (!statusCode) return "error";

  switch (statusCode) {
    case 403:
      return "forbidden";
    case 404:
      return "not-found";
    default:
      return "error";
  }
}

export default function UnitDetailsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams<{ id: string }>();
  const pathname = usePathname();
  const router = useRouter();

  const [unit, setUnit] = useState<Unit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusCode, setStatusCode] = useState<number | undefined>();
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadUnit() {
      try {
        const response = await unitsApi.findById(params.id);

        if (isMounted) {
          setUnit(response.data);
          setStatusCode(undefined);
        }
      } catch (error) {
        if (!isMounted) return;

        setUnit(null);
        setStatusCode(error instanceof ApiError ? error.status : 500);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadUnit();

    return () => {
      isMounted = false;
    };
  }, [params.id, retryCount]);

  const activeTab =
    unitTabs.find((tab) => pathname.endsWith(`/${tab.value}`))?.value ??
    "general";

  function handleTabChange(value: string) {
    router.push(`/units/${params.id}/${value}`);
  }

  const page = (
    <PageContainer
      state={
        isLoading ? "loading" : !unit ? getPageState(statusCode) : undefined
      }
      stateAction={
        !isLoading && !unit
          ? {
              label: "Tentar novamente",
              onClick: () => setRetryCount((count) => count + 1),
            }
          : undefined
      }
    >
      {unit && (
        <>
          <PageHeader
            title={unit.name}
            description={`${unit.company.tradeName} · Detalhes da unidade`}
            action={
              <StatusBadge
                label={UnitStatusLabel[unit.status]}
                color={UnitStatusColor(unit.status) as "green" | "red"}
              />
            }
          />

          <Tabs items={unitTabs} value={activeTab} onChange={handleTabChange} />

          {children}
        </>
      )}
    </PageContainer>
  );

  return unit ? (
    <UnitProvider unit={unit} updateUnit={setUnit}>
      {page}
    </UnitProvider>
  ) : (
    page
  );
}
