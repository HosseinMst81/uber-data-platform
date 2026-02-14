import { CreateTripForm } from "@/components/CreateTripForm";
import { TripFilters } from "@/components/TripFilters";
import TripList from "@/components/Trips/trip-list";
import { tripsKeys } from "@/lib/query-keys";
import type { GetTripsParams } from "@/lib/types";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";


export function TripsPage() {
  const [filters, setFilters] = useState<GetTripsParams>({
    limit: 10,
    offset: 0,
  });

  const queryClient = useQueryClient();

  const refetchTrips = () => {
    queryClient.invalidateQueries({ queryKey: tripsKeys.list(filters) });
  };

  const applyFilters = () => {
    setFilters((prev) => ({ ...prev, offset: 0 }));
  };

  const resetFilters = () => {
    setFilters({
      limit: 10,
      offset: 0,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Trips</h1>
        <CreateTripForm onCreated={refetchTrips} />
      </div>

      <TripFilters
        filters={filters}
        onFiltersChange={setFilters}
        onApply={applyFilters}
        onReset={resetFilters}
      />

      <TripList filters={filters} onFiltersChange={setFilters} refetchTrips={refetchTrips} />
    </div>
  );
}
