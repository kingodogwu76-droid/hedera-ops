"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

type Props = {
  lat: number;
  lng: number;
};

export default function Map({ lat, lng }: Props) {
  return (
    <div className="h-96 w-full">
      <MapContainer
        center={[lat, lng] as [number, number]}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />
        <Marker position={[lat, lng] as [number, number]}>
          <Popup>Current Location</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}