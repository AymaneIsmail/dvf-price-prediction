import L from "leaflet";
import { Marker, Popup } from "react-leaflet";
import type { Mutation } from "@/types";

interface Props {
  mutation: Mutation;
  onClick: (m: Mutation) => void;
}

const createCustomMutationIcon = (prixM2: number | null | undefined) => {
  const color = !prixM2
    ? "#ccc"
    : prixM2 > 5000
    ? "#dc2626" // rouge pour très cher
    : prixM2 > 3000
    ? "#f59e0b" // orange pour moyen
    : "#16a34a"; // vert pour pas cher

  return L.divIcon({
    html: `
      <div style="
        width: 24px;
        height: 24px;
        background-color: ${color};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 8px;
          height: 8px;
          background-color: white;
          border-radius: 50%;
        "></div>
      </div>
    `,
    className: "custom-mutation-marker",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

export function MutationMarker({ mutation, onClick }: Props) {
  const position: [number, number] = [mutation.latitude!, mutation.longitude!];
  const icon = createCustomMutationIcon(mutation.prix_m2);

  return (
    <Marker
      position={position}
      icon={icon}
      eventHandlers={{
        click: () => onClick(mutation),
      }}
    >
      <Popup>
        <div className="text-sm">
          <h3 className="font-semibold text-gray-900">
            {mutation.nom_commune}
          </h3>
          <p className="text-gray-600">{mutation.valeur_fonciere?.toLocaleString()} €</p>
          <p className="text-gray-500 text-xs">{mutation.date_mutation}</p>
          <button
            onClick={(e) => {
              e.preventDefault(); // Ne pas fermer la popup
              onClick(mutation);
            }}
            className="text-blue-600 hover:underline mt-2"
          >
            Voir détails →
          </button>
        </div>
      </Popup>
    </Marker>
  );
}
