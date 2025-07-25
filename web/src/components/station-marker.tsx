import L from "leaflet";
import { Marker, Popup } from "react-leaflet";
import { getAvailabilityLevel, getStatusColor } from "@/utils/station-helpers";
import type { StationStatus } from "@/types";

interface StationMarkerProps {
  station: StationStatus;
  viewMode: "bikes" | "docks";
  onStationClick: (station: StationStatus) => void;
}

const createCustomIcon = (color: string, isRenting: boolean) => {
  const opacity = isRenting ? 1 : 0.5;

  return L.divIcon({
    html: `
      <div style="
        width: 24px;
        height: 24px;
        background-color: ${color};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        opacity: ${opacity};
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
    className: "custom-station-marker",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

export function StationMarker({
  station,
  viewMode,
  onStationClick,
}: StationMarkerProps) {
  const availabilityLevel = getAvailabilityLevel(station, viewMode);
  const color = getStatusColor(availabilityLevel);
  const icon = createCustomIcon(color, station.is_renting);

  const handleClick = () => {
    onStationClick(station);
  };

  return (
    <Marker
      position={[station.latitude, station.longitude]}
      icon={icon}
      eventHandlers={{
        click: handleClick,
      }}
    >
      <Popup>
        <div className="text-sm">
          <h3 className="font-semibold text-gray-900">
            {station.station_name}
          </h3>
          <p className="text-gray-600">Code: {station.station_code}</p>
          <div className="mt-2 space-y-1">
            <p>
              🚲 Vélos disponibles:{" "}
              <span className="font-medium">{station.bikes_available}</span>
            </p>
            <p>
              🅿️ Bornes disponibles:{" "}
              <span className="font-medium">{station.docks_available}</span>
            </p>
            <p>
              ⚡ Vélos électriques:{" "}
              <span className="font-medium">{station.ebikes}</span>
            </p>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}
