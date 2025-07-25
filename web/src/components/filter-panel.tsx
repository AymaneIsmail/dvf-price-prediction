import React from "react";
import { Calendar, Bike, Circle } from "lucide-react";

interface FilterPanelProps {
  filter: StationFilter;
  onFilterChange: (filter: StationFilter) => void;
}

export function FilterPanel({ filter, onFilterChange }: FilterPanelProps) {
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    onFilterChange({
      ...filter,
      selectedDate: newDate,
    });
  };

  const handleViewModeChange = (newViewMode: "bikes" | "docks") => {
    onFilterChange({
      ...filter,
      viewMode: newViewMode,
    });
  };

  const formatDateForInput = (date: Date) => {
    return date.toISOString().slice(0, 16);
  };

  return (
    <div className="fixed top-4 left-4 bg-white rounded-lg shadow-xl border border-gray-200 p-6 z-[1000] min-w-[320px]">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Filtres de visualisation
      </h3>

      {/* Date and Time Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Calendar className="w-4 h-4 inline mr-2" />
          Date et heure
        </label>
        <input
          type="datetime-local"
          value={formatDateForInput(filter.selectedDate)}
          onChange={handleDateChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          Visualisez l'état historique ou prédictif du système
        </p>
      </div>

      {/* View Mode Toggle */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Mode d'affichage
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleViewModeChange("bikes")}
            className={`flex items-center justify-center px-4 py-3 rounded-lg border-2 transition-all ${
              filter.viewMode === "bikes"
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-200 hover:border-gray-300 text-gray-600"
            }`}
          >
            <Bike className="w-5 h-5 mr-2" />
            <span className="font-medium">Vélos</span>
          </button>
          <button
            onClick={() => handleViewModeChange("docks")}
            className={`flex items-center justify-center px-4 py-3 rounded-lg border-2 transition-all ${
              filter.viewMode === "docks"
                ? "border-orange-500 bg-orange-50 text-orange-700"
                : "border-gray-200 hover:border-gray-300 text-gray-600"
            }`}
          >
            <Circle className="w-5 h-5 mr-2" />
            <span className="font-medium">Bornes</span>
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="border-t border-gray-200 pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Légende</h4>
        <div className="space-y-2">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
            <span className="text-sm text-gray-600">
              Haute disponibilité (&gt; 50%)
            </span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-500 rounded-full mr-3"></div>
            <span className="text-sm text-gray-600">
              Disponibilité moyenne (20-50%)
            </span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
            <span className="text-sm text-gray-600">
              Faible disponibilité (&lt; 20%)
            </span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-500 rounded-full mr-3"></div>
            <span className="text-sm text-gray-600">Vide ou hors service</span>
          </div>
        </div>
      </div>
    </div>
  );
}
