import type { GetTripsParams } from "@/lib/types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { Button } from "../ui/button";

const TripListFooter = ({
  filters,
  limit,
  onFiltersChange,
  start,
  total,
}: {
  filters: GetTripsParams;
  limit: number;
  onFiltersChange: Dispatch<SetStateAction<GetTripsParams>>;
  start: number;
  total: number;
}) => {
  const page = Math.floor((filters.offset ?? 0) / limit) + 1;
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
  );
};

export default TripListFooter;
