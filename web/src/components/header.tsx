import { MapPin, Euro, Ruler } from "lucide-react";

interface HeaderProps {
  totalMutations: number;
  valeurTotale: number;
  surfaceTotale: number;
}

export function Header({ totalMutations, valeurTotale, surfaceTotale }: HeaderProps) {
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 px-6 py-3 z-[1000]">
      <div className="flex items-center space-x-6">
        <div className="flex items-center">
          <MapPin className="w-5 h-5 text-blue-600 mr-2" />
          <span className="text-sm font-medium text-gray-900">
            Mutations foncières
          </span>
        </div>

        <div className="h-4 w-px bg-gray-300"></div>

        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center">
            <Ruler className="w-4 h-4 text-green-600 mr-1" />
            <span className="text-gray-600">{totalMutations} biens</span>
          </div>

          <div className="flex items-center">
            <Euro className="w-4 h-4 text-blue-600 mr-1" />
            <span className="text-gray-600">
              {valeurTotale.toLocaleString()} €
            </span>
          </div>

          <div className="flex items-center">
            <div className="w-4 h-4 border-2 border-orange-600 rounded mr-1"></div>
            <span className="text-gray-600">
              {surfaceTotale.toLocaleString()} m²
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
