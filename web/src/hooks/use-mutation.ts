import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { PaginatedResponse, Mutation } from "@/types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const MAX_PAGE = 5;

/**
 * Hook standard pour une seule page
 */
export const useMutationsQuery = (page: number, pageSize: number) => {
  return useQuery<PaginatedResponse<Mutation>>({
    queryKey: ["mutations", page, pageSize],
    queryFn: async () => {
      console.log(`📡 Fetch page ${page}`);
      const res = await fetch(`${API_URL}/api/v1/mutations?page=${page}&page_size=${pageSize}`);
      if (!res.ok) throw new Error("Erreur de chargement des mutations");
      return res.json();
    },
    refetchInterval: 60_000,
    refetchOnWindowFocus: false,
    staleTime: 0,
    keepPreviousData: true,
  });
};

/**
 * Hook de polling qui enchaîne les pages jusqu’à MAX_PAGE
 */
export const useMutationsQueryPolling = (pageSize: number, intervalMs = 60_000) => {
  const [page, setPage] = useState(1);
  const [mutations, setMutations] = useState<Mutation[]>([]);

  const { data, isPending, isError } = useMutationsQuery(page, pageSize);

  // Ajoute les nouvelles mutations en évitant les doublons
  useEffect(() => {
    if (data?.results?.length) {
      setMutations((prev) => {
        const ids = new Set(prev.map((m) => m.id_mutation));
        const uniques = data.results.filter((m) => !ids.has(m.id_mutation));
        console.log(`🧩 Ajout de ${uniques.length} mutations de la page ${page}`);
        return [...prev, ...uniques];
      });
    }
  }, [data, page]);

  // Incrémente la page à chaque intervalle, jusqu'à MAX_PAGE
  useEffect(() => {
    const interval = setInterval(() => {
      setPage((prev) => {
        if (prev < MAX_PAGE) {
          return prev + 1;
        } else {
          console.log("✅ Max page atteinte, arrêt du polling");
          clearInterval(interval);
          return prev;
        }
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [intervalMs]);

  return {
    data: mutations,
    loading: isPending && mutations.length === 0,
    error: isError,
  };
};
