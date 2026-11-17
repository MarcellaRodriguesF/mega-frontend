"use client";

import { Buildings } from "@phosphor-icons/react";

import Card from "@/components/ui/Card/Card";
import { List } from "@/components/ui/List/List";

import { useProvider } from "@/contexts/ProviderContext";

import {
  ProviderStatus,
  ProviderStatusLabel,
} from "@/constants/enums/providers/provider-status.enum";

function isKnownStatus(value: string): value is ProviderStatus {
  return (
    value === ProviderStatus.ACTIVE || value === ProviderStatus.INACTIVE
  );
}

export default function ProviderUnitsPage() {
  const { provider } = useProvider();
  const connectivities = provider.connectivities ?? [];

  return (
    <Card
      title="Unidades"
      display="default"
      icon={<Buildings size={20} />}
      description={
        connectivities.length === 0
          ? "Nenhuma unidade vinculada a este provedor."
          : undefined
      }
    >
      {connectivities.length > 0 && (
        <List
          items={connectivities}
          keyExtractor={(connectivity) => connectivity.id}
          getItem={(connectivity) => {
            const status = isKnownStatus(connectivity.status)
              ? ProviderStatusLabel(connectivity.status)
              : connectivity.status;

            return {
              title: connectivity.unit?.name || "Unidade não identificada",
              subtitle: connectivity.name,
              description: `${connectivity.technology} · ${status}`,
            };
          }}
        />
      )}
    </Card>
  );
}
