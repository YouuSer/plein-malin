"use client";

import { useState, useEffect, useCallback } from "react";

interface FavoriteStation {
  id: string;
  name: string | null;
  city: string;
  prices: { fuelType: string; price: number }[];
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  const fetchFavorites = useCallback(async () => {
    try {
      const res = await fetch("/api/user/favorites");
      if (!res.ok) {
        setFavorites([]);
        return;
      }
      const data = await res.json();
      const favs = data.favorites ?? [];
      setFavorites(favs);
      setFavoriteIds(new Set(favs.map((f: FavoriteStation) => f.id)));
    } catch {
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const toggleFavorite = useCallback(
    async (stationId: string) => {
      try {
        const res = await fetch("/api/user/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stationId }),
        });
        if (!res.ok) return false;
        const data = await res.json();

        setFavoriteIds((prev) => {
          const next = new Set(prev);
          if (data.favorited) next.add(stationId);
          else next.delete(stationId);
          return next;
        });

        // Refresh full list
        fetchFavorites();
        return data.favorited;
      } catch {
        return false;
      }
    },
    [fetchFavorites]
  );

  return { favorites, favoriteIds, loading, toggleFavorite, refetch: fetchFavorites };
}
