import { X, MapPin } from "lucide-react";
import type { Mutation } from "@/types";

interface Props {
  mutation: Mutation | null;
  onClose: () => void;
}

export function MutationDetailPanel({ mutation, onClose }: Props) {
  if (!mutation) return null;

  return (
    <div className="fixed top-4 right-4 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-[1000] max-h-[90vh] overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {mutation.nom_commune}
            </h2>
            <p className="text-sm text-gray-500 flex items-center mt-1">
              <MapPin className="w-4 h-4 mr-1" />
              {mutation.region}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Infos principales */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">Valeur foncière</p>
            <p className="text-2xl font-bold text-gray-900">
              {mutation.valeur_fonciere?.toLocaleString()} €
            </p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">Surface bâtie</p>
            <p className="text-2xl font-bold text-gray-900">
              {mutation.surface_reelle_bati} m²
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">Pièces</p>
            <p className="text-xl font-semibold text-gray-900">
              {mutation.nombre_pieces_principales}
            </p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">Date</p>
            <p className="text-sm text-gray-900">{mutation.date_mutation}</p>
          </div>
        </div>

        {/* Infos supplémentaires */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">Code IRIS</p>
          <p className="text-sm font-medium text-gray-800">
            {mutation.CODE_IRIS}
          </p>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600">Type de bien</p>
          <p className="text-sm font-medium text-gray-800">
            {mutation.type_local}
          </p>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600">Prix au m²</p>
          <p className="text-sm font-medium text-gray-800">
            {mutation.prix_m2} €/m²
          </p>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600">Terrain</p>
          <p className="text-sm font-medium text-gray-800">
            {mutation.surface_terrain} m²
          </p>
        </div>
      </div>
    </div>
  );
}
