"use client";
import { ArrowSquareOutIcon, MapPin, MapTrifold } from "@phosphor-icons/react";
import styles from "./AddressCard.module.css";
import IconButton from "../IconButton/IconButton";
import LocationMap from "@/components/ui/LocationMap/LocationMap";

export interface AddressData {
  zipCode?: string | null;
  street?: string | null;
  number?: string | null;
  complement?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
}

interface AddressCardProps {
  address?: AddressData | null;
  onEdit?: () => void;
  title?: string;
  isLoading?: boolean;
  latitude?: number | null;
  longitude?: number | null;
  locationName?: string;
}

export default function AddressCard({
  address,
  onEdit,
  title = "Localização",
  isLoading = false,
  latitude,
  longitude,
  locationName,
}: AddressCardProps) {
  const hasAddress =
    !!address &&
    Object.values(address).some(
      (value) => typeof value === "string" && value.trim().length > 0
    );

  const hasCoordinates =
    latitude != null &&
    longitude != null &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    Math.abs(latitude) <= 90 &&
    Math.abs(longitude) <= 180;

  const streetLine = [address?.street, address?.number, address?.complement]
    .filter(Boolean)
    .join(", ");

  const cityLine = [address?.city, address?.state].filter(Boolean).join(" / ");

  const addressLines = [
    streetLine,
    address?.neighborhood,
    cityLine,
    address?.zipCode ? `CEP ${address.zipCode}` : null,
  ].filter(Boolean);

  const mapQuery = hasCoordinates
    ? `${latitude},${longitude}`
    : [
        address?.street,
        address?.number,
        address?.neighborhood,
        address?.city,
        address?.state,
        "Brasil",
      ]
        .filter(Boolean)
        .join(", ");

  const mapUrl = mapQuery
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`
    : undefined;

  return (
    <section className={styles.card}>
      <header className={styles.header}>
        <h3>{title}</h3>

        <div className={styles.headerActions}>
          {mapUrl && (
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.mapButton}
            >
              <ArrowSquareOutIcon size={20} weight="bold" />
            </a>
          )}

          {onEdit && <IconButton action="edit" size="sm" onClick={onEdit} />}
        </div>
      </header>

      {isLoading ? (
        <div className={styles.empty}>Carregando localização...</div>
      ) : (
        <div className={styles.content}>
          {hasCoordinates ? (
            <LocationMap
              latitude={latitude}
              longitude={longitude}
              name={locationName || title}
              location={cityLine}
            />
          ) : (
            <div className={styles.empty}>
              <MapPin size={24} />
              <span>
                {hasAddress
                  ? "Coordenadas não cadastradas para exibir o mapa."
                  : "Nenhuma localização cadastrada."}
              </span>
            </div>
          )}

          {hasAddress && (
            <div className={styles.addressInfo}>
              {addressLines.map((line, index) => (
                <span key={index}>{line}</span>
              ))}
            </div>
          )}

          {!hasAddress && !hasCoordinates && onEdit && (
            <button type="button" className={styles.addButton} onClick={onEdit}>
              Adicionar localização
            </button>
          )}
        </div>
      )}
    </section>
  );
}
