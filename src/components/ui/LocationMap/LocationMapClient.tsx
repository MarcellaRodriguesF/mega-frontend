"use client";

import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  ZoomControl,
} from "react-leaflet";
import styles from "./LocationMap.module.css";

interface LocationMapClientProps {
  latitude: number;
  longitude: number;
  name: string;
  location?: string | null;
}

export default function LocationMapClient({
  latitude,
  longitude,
  name,
  location,
}: LocationMapClientProps) {
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
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ZoomControl position="bottomright" />

        <CircleMarker
          center={[latitude, longitude]}
          radius={10}
          pathOptions={{
            color: "#FFFFFF",
            weight: 3,
            fillColor: "#087A4B",
            fillOpacity: 1,
          }}
        >
          <Popup>
            <div className={styles.popup}>
              <strong>{name}</strong>

              {location && <span>{location}</span>}

              <small>
                {latitude}, {longitude}
              </small>
            </div>
          </Popup>
        </CircleMarker>
      </MapContainer>
    </div>
  );
}
