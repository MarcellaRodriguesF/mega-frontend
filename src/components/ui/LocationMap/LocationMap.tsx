"use client";

import dynamic from "next/dynamic";

import styles from "./LocationMap.module.css";

const LocationMapClient = dynamic(() => import("./LocationMapClient"), {
  ssr: false,
  loading: () => <div className={styles.placeholder}>Carregando mapa...</div>,
});

interface LocationMapProps {
  latitude: number | null | undefined;
  longitude: number | null | undefined;
  name: string;
  location?: string | null;
}

export default function LocationMap({
  latitude,
  longitude,
  name,
  location,
}: LocationMapProps) {
  const hasCoordinates =
    latitude != null &&
    longitude != null &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    Math.abs(latitude) <= 90 &&
    Math.abs(longitude) <= 180;

  if (!hasCoordinates) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>⌖</div>
        <strong>Localização não cadastrada</strong>
        <span>Cadastre as coordenadas da unidade para visualizar o mapa.</span>
      </div>
    );
  }

  return (
    <LocationMapClient
      latitude={latitude}
      longitude={longitude}
      name={name}
      location={location}
    />
  );
}
