"use client";

import { MapPin, MapTrifold } from "@phosphor-icons/react";
import styles from "./AddressCard.module.css";
import IconButton from "../IconButton/IconButton";
import LocationMap from "../LocationMap/LocationMap";

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
  title = "Endereço",
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

  const mapAddress = [
    address?.street,
    address?.number,
    address?.complement,
    address?.neighborhood,
    address?.city,
    address?.state,
    address?.zipCode,
    "Brasil",
  ]
    .filter(Boolean)
    .join(", ");

  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapAddress)}`;

  return (
    <section className={styles.card}>
      <header className={styles.header}>
        <h3>{title}</h3>

        {onEdit && <IconButton action="edit" size="sm" onClick={onEdit} />}
      </header>

      {isLoading ? (
        <div className={styles.empty}>Carregando endereço...</div>
      ) : hasAddress ? (
        <div className={styles.content}>
          {/* <div className={styles.iconWrapper}>
            <MapPin size={32} weight="regular" />
          </div> */}

          <div className={styles.addressInfo}>
            {addressLines.map((line, index) => (
              <span key={index}>{line}</span>
            ))}
          </div>

          {latitude != null && longitude != null && (
            <div className={styles.locationMap}>
              <LocationMap
                latitude={latitude}
                longitude={longitude}
                name={locationName || title}
                location={cityLine}
              />
            </div>
          )}

          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.mapButton}
          >
            <MapTrifold size={19} />
            Ver no mapa
          </a>
        </div>
      ) : (
        <div className={styles.empty}>
          <MapPin size={24} />
          <span>Nenhum endereço cadastrado.</span>
          {onEdit && (
            <button type="button" className={styles.addButton} onClick={onEdit}>
              Adicionar endereço
            </button>
          )}
        </div>
      )}
    </section>
  );
}
