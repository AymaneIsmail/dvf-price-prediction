import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { Mutation } from "@/types";
import { MutationMarker } from "./mutation-marker";
import { useEffect } from "react";

interface MapViewProps {
  mutations: Mutation[];
  onMutationClick: (m: Mutation) => void;
}

export function MapView({ mutations, onMutationClick }: MapViewProps) {
  const center: [number, number] = [48.8566, 2.3522]; // Paris

  useEffect(() => {
    console.log("[MapView] Number of mutations to render:", mutations.length);
  }, [mutations]);

  console.log("[MapView] Number of mutations to render:", mutations.length);

  return (
    <MapContainer
      center={center}
      zoom={12}
      className="z-0"
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {mutations
        .filter((m) => m.latitude && m.longitude)
        .map((mutation) => (
          <MutationMarker
            key={`${mutation.id_mutation}-${mutation.latitude}-${mutation.longitude}`}
            mutation={mutation}
            onClick={onMutationClick}
          />
        ))}
    </MapContainer>
  );
}
