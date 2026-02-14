import { ChevronLeft, ChevronRight } from "lucide-react";
import { TripsTable } from "../TripsTable";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { useTrips } from "@/hooks";
import type { GetTripsParams } from "@/lib/types";
import type { Dispatch, SetStateAction } from "react";
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

  const page = Math.floor((filters.offset ?? 0) / limit) + 1;
  const start = (filters.offset ?? 0) + 1;
  const end = Math.min((filters.offset ?? 0) + limit, total);
  const totalPages = Math.ceil(total / limit);
  const canPrev = (filters.offset ?? 0) > 0;
  const canNext = (filters.offset ?? 0) + limit < total;

  const goPrev = () =>
    onFiltersChange((prev) => ({
      ...prev,
      offset: Math.max(0, (prev.offset ?? 0) - limit),
    }));
  const goNext = () =>
    onFiltersChange((prev) => ({
      ...prev,
      offset: (prev.offset ?? 0) + limit,
    }));

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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {total === 0 ? 0 : start} to {end} of {total} trips
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={!canPrev}
              onClick={goPrev}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous</span>
            </Button>
            <span className="text-sm">
              Page {page} of {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="icon"
              disabled={!canNext}
              onClick={goNext}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TripList;
