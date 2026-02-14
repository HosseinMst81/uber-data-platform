import { useTrips } from "@/hooks";
import type { GetTripsParams } from "@/lib/types";
import type { Dispatch, SetStateAction } from "react";
import { TripsTable } from "../TripsTable";
import { Card, CardContent } from "../ui/card";
import TripListFooter from "./trip-list-footer";
import TripListHeader from "./trip-list-header";

const TripList = ({
  filters,
  onFiltersChange,
  refetchTrips,
}: {
  filters: GetTripsParams;
  onFiltersChange: Dispatch<SetStateAction<GetTripsParams>>;
  refetchTrips: () => void;
}) => {
  const { data, isLoading } = useTrips(filters);
  const trips = data?.trips ?? [];
  const total = data?.total ?? 0;

  const limit = filters.limit ?? 10;

  const start = (filters.offset ?? 0) + 1;

  return (
    <Card>
      <TripListHeader limit={limit} onFiltersChange={onFiltersChange} />
      <CardContent className="space-y-4">
        <TripsTable
          trips={trips}
          loading={isLoading}
          rowStartIndex={total === 0 ? 0 : start}
          onStatusUpdated={refetchTrips}
          onDeleted={refetchTrips}
        />
        <TripListFooter
          filters={filters}
          onFiltersChange={onFiltersChange}
          total={total}
          start={start}
          limit={limit}
        />
      </CardContent>
    </Card>
  );
};

export default TripList;
