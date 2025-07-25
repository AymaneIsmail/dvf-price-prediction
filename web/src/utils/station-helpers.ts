import type { StationStatus, AvailabilityLevel } from "@/types";

export const getAvailabilityLevel = (
  station: StationStatus,
  viewMode: "bikes" | "docks"
): AvailabilityLevel => {
  const available =
    viewMode === "bikes" ? station.bikes_available : station.docks_available;
  const total = station.capacity;
  const percentage = (available / total) * 100;

  if (percentage === 0) return "empty";
  if (percentage <= 20) return "low";
  if (percentage <= 50) return "medium";
  return "high";
};

export const getStatusColor = (level: AvailabilityLevel): string => {
  switch (level) {
    case "high":
      return "#10B981"; // Green
    case "medium":
      return "#F59E0B"; // Amber
    case "low":
      return "#EF4444"; // Red
    case "empty":
      return "#6B7280"; // Gray
  }
};

export const getStatusText = (
  level: AvailabilityLevel,
  viewMode: "bikes" | "docks"
): string => {
  const item = viewMode === "bikes" ? "vélos" : "bornes";

  switch (level) {
    case "high":
      return `Beaucoup de ${item} disponibles`;
    case "medium":
      return `${item} disponibles`;
    case "low":
      return `Peu de ${item} disponibles`;
    case "empty":
      return `Aucun ${item} disponible`;
  }
};
