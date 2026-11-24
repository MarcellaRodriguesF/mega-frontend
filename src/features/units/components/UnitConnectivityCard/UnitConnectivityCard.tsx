"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { WifiHigh, PencilSimple, Plus, Prohibit, WifiSlash } from "@phosphor-icons/react";

import Card from "@/components/ui/Card/Card";
import Button from "@/components/ui/Button/Button";
import Modal from "@/components/ui/Modal/Modal";

import { unitConnectivitiesApi } from "@/services/api/unit-connectivities/unit-connectivities.api";
import { getConnectivityTechnologyLabel } from "@/features/units/schemas/unit-connectivity-form.schema";

import type { UnitConnectivity } from "@/services/api/unit-connectivities/unit-connectivities.types";

import styles from "./UnitConnectivityCard.module.css";

interface UnitConnectivityCardProps {
  unitId: string;
  onCreate: () => void;
  onEdit: (connectivity: UnitConnectivity) => void;
  onInactivate: (connectivity: UnitConnectivity) => void | Promise<void>;
}

export default function UnitConnectivityCard({
  unitId,
  onCreate,
  onEdit,
  onInactivate,
}: UnitConnectivityCardProps) {
  const [connectivityToInactivate, setConnectivityToInactivate] =
    useState<UnitConnectivity | null>(null);
  const [isInactivating, setIsInactivating] = useState(false);

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

  async function handleConfirmInactivate() {
    if (!connectivityToInactivate) return;

    try {
      setIsInactivating(true);
      await onInactivate(connectivityToInactivate);
      setConnectivityToInactivate(null);
    } catch {
      return;
    } finally {
      setIsInactivating(false);
    }
  }

  return (
    <>
      <Card
        title="Conectividade"
        icon={<WifiHigh size={20} />}
        actions={
          connectivities.length > 0 && (
            <Button
              text={
                <>
                  <Plus size={16} />
                  Nova conexão
                </>
              }
              onClick={onCreate}
            />
          )
        }
        display="default"
      >
        {isLoading ? (
          <div className={styles.feedback}>Carregando conectividades...</div>
        ) : isError ? (
          <div className={styles.feedback}>
            <span>Não foi possível carregar as conectividades.</span>

            <Button
              variant="secondary"
              text="Tentar novamente"
              onClick={() => refetch()}
            />
          </div>
        ) : connectivities.length === 0 ? (
          <div className={styles.empty}>
            <WifiSlash size={28} />

            <strong>Nenhuma conexão cadastrada</strong>

            <span>
              Cadastre a conexão de internet desta unidade para acompanhar suas
              informações.
            </span>

            <Button text="Cadastrar conexão" onClick={onCreate} />
          </div>
        ) : (
          <div className={styles.list}>
            {connectivities.map((connectivity) => (
              <div key={connectivity.id} className={styles.connectivity}>
                <div className={styles.header}>
                  <div className={styles.connectionTitle}>
                    <span className={styles.connectionIcon}>
                      <WifiHigh size={20} />
                    </span>

                    <div>
                      <strong>{connectivity.name}</strong>
                    </div>
                  </div>

                  <div className={styles.actions}>
                    <Button
                      variant="secondary"
                      text={
                        <>
                          <PencilSimple size={15} />
                          Editar
                        </>
                      }
                      onClick={() => onEdit(connectivity)}
                      disabled={isInactivating}
                    />

                    <Button
                      variant="secondary"
                      text={
                        <>
                          <Prohibit size={15} />
                          Inativar
                        </>
                      }
                      onClick={() => setConnectivityToInactivate(connectivity)}
                      disabled={isInactivating}
                    />
                  </div>
                </div>

                <div className={styles.fields}>
                  <div className={styles.field}>
                    <span>Provedor</span>
                    <strong>
                      {connectivity.provider?.name ?? "Não informado"}
                    </strong>
                  </div>

                  <div className={styles.field}>
                    <span>Tecnologia</span>
                    <strong>
                      {getConnectivityTechnologyLabel(connectivity.technology)}
                    </strong>
                  </div>

                  <div className={styles.field}>
                    <span>IP público</span>
                    <strong>{connectivity.publicIp || "Não informado"}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        open={connectivityToInactivate !== null}
        variant="danger"
        title="Inativar conexão?"
        description={
          connectivityToInactivate
            ? `A conexão ${connectivityToInactivate.name} será inativada e deixará de aparecer na lista desta unidade.`
            : ""
        }
        confirmText="Inativar conexão"
        cancelText="Cancelar"
        isLoading={isInactivating}
        onConfirm={handleConfirmInactivate}
        onClose={() => {
          if (!isInactivating) setConnectivityToInactivate(null);
        }}
      />
    </>
  );
}
