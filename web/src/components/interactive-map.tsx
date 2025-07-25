import { useState } from "react";
import { MapView } from "@/components/map-view";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Header } from "./header";
// import { FilterPanel } from "./filter-panel"; // Optionnel

import type { Mutation } from "@/types";
import { useMutationsQueryPolling } from "@/hooks/use-mutation";
import { MutationDetailPanel } from "./mutation-detail-panel";

export function InteractiveMap() {

  const {
    data: mutations,
    loading,
    error,
  } = useMutationsQueryPolling(100, 2_000); // 100 mutations par page, toutes les 60s

  const [selectedMutation, setSelectedMutation] = useState<Mutation | null>(null);

if (loading && mutations.length === 0) return <LoadingSpinner />;

  if (error || !mutations)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-center text-gray-700">Erreur de chargement des mutations</p>
      </div>
    );

  const aggregatedData = mutations.reduce(
    (acc, m) => ({
      total: acc.total + 1,
      valeurTotale: acc.valeurTotale + (m.valeur_fonciere || 0),
      surfaceTotale: acc.surfaceTotale + (m.surface_reelle_bati || 0),
    }),
    { total: 0, valeurTotale: 0, surfaceTotale: 0 }
  );

  return (
    <div className="relative">
      <Header
        totalMutations={aggregatedData.total}
        valeurTotale={aggregatedData.valeurTotale}
        surfaceTotale={aggregatedData.surfaceTotale}
      />

      <MapView
        mutations={mutations}
        onMutationClick={(m) => setSelectedMutation(m)}
      />

      <MutationDetailPanel mutation={selectedMutation} onClose={() => setSelectedMutation(null)} />
    </div>
  );
}
