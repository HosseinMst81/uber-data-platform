import type { GetTripsParams } from "@/lib/types";
import type { Dispatch, SetStateAction } from "react";
import { CardHeader } from "../ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const TripListHeader = ({
  onFiltersChange,
  limit,
}: {
  onFiltersChange: Dispatch<SetStateAction<GetTripsParams>>;
  limit: number;
}) => {
  const LIMIT_OPTIONS = [10, 50, 100];

  const setLimit = (l: number) =>
    onFiltersChange((prev) => ({ ...prev, limit: l, offset: 0 }));

  return (
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <h2 className="text-lg font-semibold">Trip list</h2>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Per page</span>
        <Select
          value={String(limit)}
          onValueChange={(v: string) => setLimit(Number(v))}
        >
          <SelectTrigger className="w-[80px]">
            <SelectValue placeholder="choose limit" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {LIMIT_OPTIONS.map((limit) => (
                <SelectItem key={limit} value={String(limit)}>
                  {limit}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </CardHeader>
  );
};

export default TripListHeader;
