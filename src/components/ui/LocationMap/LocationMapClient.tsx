"use client";

import { useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
} from "react-leaflet";
import { divIcon } from "leaflet";

import styles from "./LocationMap.module.css";

interface LocationMapClientProps {
  latitude: number;
  longitude: number;
  name: string;
  location?: string | null;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };

    return entities[character];
  });
}

export default function LocationMapClient({
  latitude,
  longitude,
  name,
  location,
}: LocationMapClientProps) {
  const unitIcon = useMemo(
    () =>
      divIcon({
        className: styles.markerContainer,
        html: `
          <div class="${styles.unitMarker}">
            <div class="${styles.markerPin}">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M12 22s8-7.2 8-13A8 8 0 1 0 4 9c0 5.8 8 13 8 13Z"
                  fill="currentColor"
                />
                <circle cx="12" cy="9" r="3" fill="white" />
              </svg>
            </div>

            <div class="${styles.markerText}">
              <strong>${escapeHtml(name)}</strong>
              ${location ? `<span>${escapeHtml(location)}</span>` : ""}
            </div>
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      }),
    [name, location]
  );

  return (
    <div className={styles.mapWrapper}>
      <MapContainer
        key={`${latitude}-${longitude}`}
        center={[latitude, longitude]}
        zoom={14}
        scrollWheelZoom={false}
        zoomControl={false}
        className={styles.map}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        <ZoomControl position="bottomright" />

        <Marker position={[latitude, longitude]} icon={unitIcon}>
          <Popup>
            <div className={styles.popup}>
              <strong>{name}</strong>
              {location && <span>{location}</span>}
              <small>
                {latitude}, {longitude}
              </small>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
