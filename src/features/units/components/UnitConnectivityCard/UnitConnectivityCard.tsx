"use client";

import { useQuery } from "@tanstack/react-query";
import {
  WifiHigh,
  PencilSimple,
  Plus,
  Phone,
  WifiSlash,
} from "@phosphor-icons/react";

import Card from "@/components/ui/Card/Card";
import Button from "@/components/ui/Button/Button";

import { unitConnectivitiesApi } from "@/services/api/unit-connectivities/unit-connectivities.api";

import type { UnitConnectivity } from "@/services/api/unit-connectivities/unit-connectivities.types";

import { formatPhone } from "@/utils/format-phone";

import styles from "./UnitConnectivityCard.module.css";

interface UnitConnectivityCardProps {
  unitId: string;
  onCreate: () => void;
  onEdit: (connectivity: UnitConnectivity) => void;
}

export default function UnitConnectivityCard({
  unitId,
  onCreate,
  onEdit,
}: UnitConnectivityCardProps) {
  const {
    data: connectivities = [],
    isPending: isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["unit-connectivities", unitId],
    queryFn: async () => {
      const response = await unitConnectivitiesApi.findByUnitId(unitId);
      return response.data;
    },
    enabled: Boolean(unitId),
  });

  return (
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
          {connectivities.map((connectivity: UnitConnectivity) => (
            <div key={connectivity.id} className={styles.connectivity}>
              <div className={styles.header}>
                <div className={styles.connectionTitle}>
                  <span className={styles.connectionIcon}>
                    <WifiHigh size={20} />
                  </span>

                  <div>
                    <strong>{connectivity.name}</strong>
                    <span>{connectivity.technology}</span>
                  </div>
                </div>

                <Button
                  variant="secondary"
                  text={
                    <>
                      <PencilSimple size={15} />
                      Editar
                    </>
                  }
                  onClick={() => onEdit(connectivity)}
                />
              </div>

              <div className={styles.fields}>
                <div className={styles.field}>
                  <span>Provedor</span>

                  <strong>
                    {connectivity.provider?.name ?? "Não informado"}
                  </strong>
                </div>

                <div className={styles.field}>
                  <span>Telefone</span>

                  <strong className={styles.phone}>
                    {connectivity.provider?.phone ? (
                      <a
                        href={`tel:${connectivity.provider.phone.replace(/\D/g, "")}`}
                      >
                        <Phone size={14} />
                        {formatPhone(connectivity.provider.phone)}
                      </a>
                    ) : (
                      "Não informado"
                    )}
                  </strong>
                </div>

                <div className={styles.field}>
                  <span>IP público</span>

                  <strong>{connectivity.publicIp || "Não informado"}</strong>
                </div>

                <div className={styles.field}>
                  <span>Monitoramento</span>

                  <strong>
                    {connectivity.monitoringEnabled
                      ? "Habilitado"
                      : "Desabilitado"}
                  </strong>
                </div>
              </div>

              {connectivity.monitoringEnabled && (
                <div className={styles.monitoring}>
                  <span className={styles.monitoringDot} />
                  Monitoramento habilitado
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
