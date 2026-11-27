"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "@phosphor-icons/react";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import PageState from "@/components/ui/PageState/PageState";
import Card from "@/components/ui/Card/Card";
import InfoCardGrid from "@/components/ui/InfoCardGrid/InfoCardGrid";
import InfoField from "@/components/ui/InfoField/InfoField";
import Button from "@/components/ui/Button/Button";
import IconButton from "@/components/ui/IconButton/IconButton";
import Modal from "@/components/ui/Modal/Modal";
import UnitConnectivityDrawer from "@/features/units/components/UnitConnectivityDrawer/UnitConnectivityDrawer";
import { useUnit } from "@/contexts/UnitContext";
import { useAuth } from "@/contexts/AuthContext";
import { useDrawer } from "@/hooks/useDrawer";
import { useToast } from "@/contexts/ToastContext";
import { PERMISSIONS } from "@/constants/enums/permissions";
import { unitConnectivitiesApi } from "@/services/api/unit-connectivities/unit-connectivities.api";
import type { UnitConnectivity } from "@/services/api/unit-connectivities/unit-connectivities.types";
import { getConnectivityTechnologyLabel } from "@/features/units/schemas/unit-connectivity-form.schema";
import ContactActions from "@/components/ui/ContactActions/ContactActions";
import {
  toUnitConnectivityPayload,
  getUnitConnectivityErrorMessage,
} from "@/features/units/unit-connectivity";

export default function UnitConnectivityPage() {
  const { unit } = useUnit();
  const { hasPermission } = useAuth();
  const { openDrawer, closeDrawer } = useDrawer();
  const toast = useToast();
  const client = useQueryClient();
  const [pendingDelete, setPendingDelete] = useState<UnitConnectivity | null>(
    null,
  );
  const allowed = hasPermission(PERMISSIONS.UNITS);
  const canEdit = allowed;
  const query = useQuery({
    queryKey: ["unit-connectivities", unit.id],
    queryFn: () => unitConnectivitiesApi.findByUnitId(unit.id),
    enabled: allowed,
  });
  const items = query.data?.data ?? [];
  const refresh = () =>
    client.invalidateQueries({ queryKey: ["unit-connectivities", unit.id] });

  function openCreate() {
    openDrawer(
      <UnitConnectivityDrawer
        open
        mode="create"
        onClose={closeDrawer}
        onSubmit={async (data) => {
          await unitConnectivitiesApi.create({
            unitId: unit.id,
            ...toUnitConnectivityPayload(data),
          });
          await refresh();
          closeDrawer();
          toast.success("A conexão foi cadastrada com sucesso.");
        }}
      />,
    );
  }
  function openEdit(item: UnitConnectivity) {
    openDrawer(
      <UnitConnectivityDrawer
        open
        mode="edit"
        connectivity={item}
        onClose={closeDrawer}
        onSubmit={async (data) => {
          await unitConnectivitiesApi.update(
            item.id,
            toUnitConnectivityPayload(data),
          );
          await refresh();
          closeDrawer();
          toast.success("A conexão foi atualizada com sucesso.");
        }}
      />,
    );
  }
  async function remove() {
    if (!pendingDelete) return;
    try {
      await unitConnectivitiesApi.delete(pendingDelete.id);
      await refresh();
      setPendingDelete(null);
      toast.success("A conectividade foi excluída desta unidade.");
    } catch (error) {
      toast.error(getUnitConnectivityErrorMessage(error));
    }
  }

  return (
    <section className="headerTitle">
      <PageHeader
        title="Conectividade"
        description="Serviços de conectividade vinculados à unidade."
        action={
          canEdit ? (
            <Button
              text={
                <>
                  <Plus size={18} /> Adicionar conexão
                </>
              }
              onClick={openCreate}
            />
          ) : undefined
        }
      />
      {!allowed ? (
        <PageState type="forbidden" />
      ) : query.isError ? (
        <PageState
          type="error"
          title="Não foi possível carregar as conexões"
          action={{
            label: "Tentar novamente",
            onClick: () => void query.refetch(),
          }}
        />
      ) : query.isLoading ? (
        <PageState type="loading" />
      ) : items.length === 0 ? (
        <PageState
          type="empty"
          title="Nenhuma conexão cadastrada"
          description="Ainda não há conectividade vinculada a esta unidade."
        />
      ) : (
        <InfoCardGrid>
          {items.map((item) => (
            <Card
              key={item.id}
              title={item.name || item.provider?.name || "Conexão"}
              actions={
                canEdit ? (
                  <>
                    <IconButton
                      action="edit"
                      label="Editar conexão"
                      onClick={() => openEdit(item)}
                    />
                    <IconButton
                      action="delete"
                      label="Excluir conexão"
                      onClick={() => setPendingDelete(item)}
                    />
                  </>
                ) : undefined
              }
            >
              <>
                <InfoField
                  label="Status"
                  value={item.status === "ACTIVE" ? "Ativa" : "Inativa"}
                />
                <InfoField label="Provedor" value={item.provider?.name} />
                <ContactActions
                  phone={item.provider?.phone}
                  label="Telefone do provedor"
                />
                <InfoField
                  label="Tecnologia"
                  value={getConnectivityTechnologyLabel(item.technology)}
                />
                <InfoField label="IP público" value={item.publicIp} />
                <InfoField label="IP WAN" value={item.wanIp} />
                <InfoField label="Gateway" value={item.gatewayIp} />
                <InfoField label="IP local" value={item.localIp} />
                <InfoField label="Rede" value={item.networkName} />
                <InfoField
                  label="Download"
                  value={
                    item.downloadCapacityMbps != null
                      ? `${item.downloadCapacityMbps} Mbps`
                      : null
                  }
                />
                <InfoField
                  label="Upload"
                  value={
                    item.uploadCapacityMbps != null
                      ? `${item.uploadCapacityMbps} Mbps`
                      : null
                  }
                />
                <InfoField
                  label="Latência cadastrada"
                  value={
                    item.responseTimeMs != null
                      ? `${item.responseTimeMs} ms`
                      : null
                  }
                />
                <InfoField
                  label="Throughput"
                  value={
                    item.throughputMbps != null
                      ? `${item.throughputMbps} Mbps`
                      : null
                  }
                />
                <InfoField
                  label="Sinal RX"
                  value={
                    item.rxSignalDbm != null ? `${item.rxSignalDbm} dBm` : null
                  }
                />
                <InfoField
                  label="SLA"
                  value={
                    item.slaPercentage != null ? `${item.slaPercentage}%` : null
                  }
                />
                <InfoField
                  label="MTTR"
                  value={item.mttrHours != null ? `${item.mttrHours} h` : null}
                />
                <InfoField
                  label="Início do serviço"
                  value={
                    item.serviceStartDate
                      ? new Intl.DateTimeFormat("pt-BR").format(
                          new Date(item.serviceStartDate),
                        )
                      : null
                  }
                />
                <InfoField
                  label="Fim do serviço"
                  value={
                    item.serviceEndDate
                      ? new Intl.DateTimeFormat("pt-BR").format(
                          new Date(item.serviceEndDate),
                        )
                      : null
                  }
                />
                <InfoField
                  label="Monitoramento habilitado"
                  value={item.monitoringEnabled ? "Sim" : "Não"}
                />
                <InfoField
                  label="Observações"
                  value={item.observations ?? "Não informado"}
                />
              </>
            </Card>
          ))}
        </InfoCardGrid>
      )}
      <Modal
        open={pendingDelete !== null}
        variant="danger"
        title="Excluir conectividade?"
        description="A conexão deixará de aparecer nesta unidade."
        confirmText="Excluir conectividade"
        cancelText="Cancelar"
        onConfirm={() => void remove()}
        onClose={() => setPendingDelete(null)}
      />
    </section>
  );
}
