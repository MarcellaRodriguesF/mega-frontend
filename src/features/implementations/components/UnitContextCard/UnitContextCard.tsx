import Card from "@/components/ui/Card/Card";
import InfoField from "@/components/ui/InfoField/InfoField";

import type {
  ActiveConnectivity,
  ImplementationAddress,
  ImplementationUnitContext,
} from "@/services/api/implementations/implementations.types";

import styles from "./UnitContextCard.module.css";

function formatAddress(address: ImplementationAddress | null) {
  if (!address) return null;

  const line = [
    address.street,
    address.number,
    address.complement,
    address.neighborhood,
    address.city && address.state
      ? `${address.city}/${address.state}`
      : address.city || address.state,
  ]
    .filter(Boolean)
    .join(", ");

  return line || null;
}

function formatOptional(value: string | number | boolean | null | undefined) {
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  if (value === null || value === undefined || value === "") return null;
  return value;
}

interface UnitContextCardProps {
  unit: ImplementationUnitContext | null;
  initialProviderName?: string | null;
  capturedName?: string | null;
}

export default function UnitContextCard({
  unit,
  initialProviderName,
  capturedName,
}: UnitContextCardProps) {
  const connectivity: ActiveConnectivity | null = unit?.activeConnectivity ?? null;
  const currentProvider = connectivity?.provider ?? null;
  const providerMissing = !currentProvider;

  return (
    <div className={styles.stack}>
      <Card
        title="Unidade"
        description="Dados atuais do cadastro. A conectividade permanente não é alterada nesta tela."
      >
        <InfoField label="Cliente" value={unit?.company.tradeName} />
        <InfoField label="Unidade" value={unit?.name ?? capturedName} />
        <InfoField label="Tipo" value={unit?.type} />
        <InfoField label="Endereço" value={formatAddress(unit?.address ?? null)} />
      </Card>

      <Card
        title="Conectividade"
        description="Somente leitura. A publicação dos dados técnicos acontece depois da conclusão autorizada."
      >
        {!connectivity ? (
          <p className={styles.notice} role="status">
            Esta unidade não possui conectividade ativa. A implantação pode ser
            iniciada mesmo assim.
          </p>
        ) : (
          <>
            <InfoField label="Tecnologia" value={connectivity.technology} />
            <InfoField label="IP público" value={connectivity.publicIp} />
            <InfoField label="Gateway" value={connectivity.gatewayIp} />
            <InfoField label="IP local" value={connectivity.localIp} />
            <InfoField label="IP WAN" value={connectivity.wanIp} />
            <InfoField
              label="Download (Mbps)"
              value={formatOptional(connectivity.downloadCapacityMbps)}
            />
            <InfoField
              label="Upload (Mbps)"
              value={formatOptional(connectivity.uploadCapacityMbps)}
            />
            <InfoField label="Nome da rede" value={connectivity.networkName} />
          </>
        )}

        {providerMissing ? (
          <p className={styles.notice} role="status">
            Nenhum provedor vinculado à conectividade desta unidade. Não é
            necessário cadastrar um provedor novo para iniciar a implantação. Um
            provedor já cadastrado poderá ser informado depois, por quem estiver
            autorizado a concluir a atividade.
          </p>
        ) : (
          <InfoField label="Provedor vinculado" value={currentProvider.name} />
        )}

        {initialProviderName && initialProviderName !== currentProvider?.name ? (
          <InfoField
            label="Provedor identificado no início"
            value={initialProviderName}
          />
        ) : null}
      </Card>
    </div>
  );
}
