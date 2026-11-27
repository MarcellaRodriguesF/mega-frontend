"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { WifiHigh, WifiSlash } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";

import Card from "@/components/ui/Card/Card";
import Button from "@/components/ui/Button/Button";
import Modal from "@/components/ui/Modal/Modal";
import IconButton from "@/components/ui/IconButton/IconButton";
import ContactActions from "@/components/ui/ContactActions/ContactActions";
import InfoField from "@/components/ui/InfoField/InfoField";

import { unitConnectivitiesApi } from "@/services/api/unit-connectivities/unit-connectivities.api";
import { getConnectivityTechnologyLabel } from "@/features/units/schemas/unit-connectivity-form.schema";

import type { UnitConnectivity } from "@/services/api/unit-connectivities/unit-connectivities.types";

import styles from "./UnitConnectivityCard.module.css";

interface UnitConnectivityCardProps {
  unitId: string;
  onCreate: () => void;
  onEdit: (connectivity: UnitConnectivity) => void;
  onDelete: (connectivity: UnitConnectivity) => void | Promise<void>;
}

export default function UnitConnectivityCard({
  unitId,
  onCreate,
  onEdit,
  onDelete,
}: UnitConnectivityCardProps) {
  const [connectivityToDelete, setConnectivityToDelete] =
    useState<UnitConnectivity | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const router = useRouter();

  const {
    data: connectivities = [],
    isPending: isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["unit-connectivities", unitId],
    queryFn: async () => {
      const response = await unitConnectivitiesApi.findByUnitId(unitId);
      return response.data.filter(
        (connectivity) => connectivity.status === "ACTIVE",
      );
    },
    enabled: Boolean(unitId),
  });

  const connectivity = connectivities[0] ?? null;

  async function handleConfirmDelete() {
    if (!connectivityToDelete) return;

    try {
      setIsDeleting(true);
      await onDelete(connectivityToDelete);
      setConnectivityToDelete(null);
    } catch {
      return;
    } finally {
      setIsDeleting(false);
    }
  }

  function navigateToProvider(providerId: string) {
    if (!providerId) return;
    router.push(`/providers/${providerId}`);
  }

  function renderActions() {
    if (isLoading || isError) return undefined;

    if (!connectivity) {
      return (
        <IconButton
          action="add"
          label="Adicionar conectividade"
          onClick={onCreate}
          disabled={isDeleting}
        />
      );
    }

    return (
      <>
        <IconButton
          action="edit"
          label="Editar conectividade"
          onClick={() => onEdit(connectivity)}
          disabled={isDeleting}
        />

        <IconButton
          action="delete"
          label="Excluir conectividade"
          onClick={() => setConnectivityToDelete(connectivity)}
          disabled={isDeleting}
        />
      </>
    );
  }

  return (
    <>
      <Card
        title="Conectividade"
        icon={<WifiHigh size={20} />}
        actions={renderActions()}
        display="default"
      >
        {isLoading ? (
          <div className={styles.feedback}>Carregando conectividade...</div>
        ) : isError ? (
          <div className={styles.feedback}>
            <span>Não foi possível carregar a conectividade.</span>

            <Button
              variant="secondary"
              text="Tentar novamente"
              onClick={() => refetch()}
            />
          </div>
        ) : !connectivity ? (
          <div className={styles.empty}>
            <WifiSlash size={28} />
            <span>Nenhuma conectividade cadastrada.</span>
          </div>
        ) : (
          <div className={styles.fields}>
            <InfoField
              label="Provedor"
              value={connectivity.provider?.name ?? "Não informado"}
              onActionsClick={
                connectivity.provider?.id
                  ? () => navigateToProvider(connectivity.provider?.id ?? "")
                  : undefined
              }
            />

            <InfoField
              label="Tecnologia"
              value={getConnectivityTechnologyLabel(connectivity.technology)}
            />

            <InfoField
              label="IP público"
              value={connectivity.publicIp || "Não informado"}
            />

            <ContactActions
              phone={connectivity.provider?.phone}
              label="Telefone"
            />
          </div>
        )}
      </Card>

      <Modal
        open={connectivityToDelete !== null}
        variant="danger"
        title="Excluir conectividade?"
        description="A conectividade desta unidade será excluída e deixará de aparecer nesta tela."
        confirmText="Excluir conectividade"
        cancelText="Cancelar"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => {
          if (!isDeleting) setConnectivityToDelete(null);
        }}
      />
    </>
  );
}
