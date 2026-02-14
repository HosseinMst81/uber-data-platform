import type { Trip } from "@/lib/types";
import { CANCELLATION_STATUS_OPTIONS } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  AlertCircle,
  Ban,
  CheckCircle2,
  Pencil,
  Trash2,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useUpdateTripStatus, useDeleteTrip } from "@/hooks/use-trips";
import { Badge } from "./ui/badge";

export interface TripsTableProps {
  trips: Trip[];
  loading?: boolean;
  /** 1-based index of the first row (for pagination: e.g. 11 when showing page 2 with limit 10). */
  rowStartIndex?: number;
  onStatusUpdated: () => void;
  onDeleted: () => void;
}

/** Strip escaped quotes from API IDs for display (e.g. "\"CNR6915581\"" -> "CNR6915581"). */
function cleanId(id: string): string {
  return id.replace(/\\/g, "").replace(/^"|"$/g, "").trim() || id;
}

function truncateId(id: string, len = 10) {
  const cleaned = cleanId(id);
  if (cleaned.length <= len) return cleaned;
  return `${cleaned.slice(0, len)}…`;
}

/** Safely format a number (backend may send decimals as strings from PostgreSQL). */
function formatNum(value: unknown, decimals: number): string {
  const n = Number(value);
  return Number.isNaN(n) ? "–" : n.toFixed(decimals);
}

/** Format ISO timestamp for table (e.g. "30 Dec 2024, 20:06"). */
function formatTripDate(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "–";
    const date = d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const time = d.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    return `${date}, ${time}`;
  } catch {
    return "–";
  }
}

export function TripsTable({
  trips,
  loading,
  rowStartIndex = 1,
  onStatusUpdated,
  onDeleted,
}: TripsTableProps) {
  const [cancelTarget, setCancelTarget] = useState<Trip | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Trip | null>(null);

  const updateStatusMutation = useUpdateTripStatus({
    onSuccess: () => {
      toast.success("Status updated");
      onStatusUpdated();
    },
    onError: (err: Error) => {
      const msg =
        (err as Error & { response?: { data?: { error?: string } } }).response
          ?.data?.error ??
        err.message ??
        "Failed to update status";
      toast.error(msg);
    },
  });
  const deleteMutation = useDeleteTrip({
    onSuccess: () => {
      toast.success("Trip deleted");
      onDeleted();
    },
    onError: (err: Error) => {
      const msg =
        (err as Error & { response?: { data?: { error?: string } } }).response
          ?.data?.error ??
        err.message ??
        "Failed to delete";
      toast.error(msg);
    },
  });

  const handleCancelStatus = (trip: Trip, newStatus: string) => {
    setCancelTarget(null);
    updateStatusMutation.mutate({
      bookingId: trip.bookingId,
      payload: { booking_status: newStatus },
    });
  };

  const handleDelete = (trip: Trip) => {
    setDeleteTarget(null);
    deleteMutation.mutate(trip.bookingId);
  };

  const STATUS_CONFIG: Record<
    string,
    { className: string; icon: React.ReactNode }
  > = {
    Completed: {
      className:
        "bg-emerald-500/10 text-emerald-800 dark:text-emerald-800 border border-emerald-500/20",
      icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    },
    "Cancelled by Customer": {
      className:
        "bg-blue-500/10 text-blue-800 dark:text-blue-800 border border-blue-500/20",
      icon: <XCircle className="h-3.5 w-3.5" />,
    },
    "Cancelled by Driver": {
      className:
        "bg-purple-500/10 text-purple-800 dark:text-purple-800 border border-purple-500/20",
      icon: <Ban className="h-3.5 w-3.5" />,
    },
    Incomplete: {
      className:
        "bg-rose-500/10 text-rose-800 dark:text-rose-800 border border-rose-500/20",
      icon: <AlertCircle className="h-3.5 w-3.5" />,
    },
    "No Driver Found": {
      className:
        "bg-red-500/10 text-red-700 dark:text-red-700 border border-red-500/20",
      icon: <AlertCircle className="h-3.5 w-3.5" />,
    },
  };

  const updating = updateStatusMutation.isPending;

  const isCompleted = (t: Trip) => t.bookingStatus === "Completed";
  const isCancelled = (t: Trip) => t.isCancelled;

  const columnCount = 13; // #, Date, Booking ID, Customer, Vehicle, Status, Value, Distance, Rev/km, Driver, Customer, Payment, Actions

  if (loading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableCaption>A list of trips. Data is loading.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="">#</TableHead>
              <TableHead className="">Date & time</TableHead>
              <TableHead className="">Booking ID</TableHead>
              <TableHead className="">Customer</TableHead>
              <TableHead className="">Vehicle</TableHead>
              <TableHead className="">Status</TableHead>
              <TableHead className="">Value</TableHead>
              <TableHead className="">Distance</TableHead>
              <TableHead className="">Rev/km</TableHead>
              <TableHead className="">Driver</TableHead>
              <TableHead className="">Customer</TableHead>
              <TableHead className="">Payment</TableHead>
              <TableHead className="">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map((i) => (
              <TableRow key={i}>
                {Array.from({ length: columnCount }).map((_, j) => (
                  <TableCell
                    key={j}
                    className={
                      j === 0
                        ? "text-center"
                        : j >= 6 && j <= 9
                          ? "text-center"
                          : ""
                    }
                  >
                    <Skeleton className="h-5 w-16" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableCaption className="sr-only">
            Trip list with row numbers
          </TableCaption>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="text-center font-semibold">#</TableHead>
              <TableHead className="">Date & time</TableHead>
              <TableHead className="">Booking ID</TableHead>
              <TableHead className="">Customer</TableHead>
              <TableHead className="">Vehicle</TableHead>
              <TableHead className="">Status</TableHead>
              <TableHead className="">Value</TableHead>
              <TableHead className="">Distance</TableHead>
              <TableHead className="">Rev/km</TableHead>
              <TableHead className="">Driver</TableHead>
              <TableHead className="">Customer</TableHead>
              <TableHead className="">Payment</TableHead>
              <TableHead className="">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trips.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columnCount}
                  className="h-24 text-center text-muted-foreground"
                >
                  No trips found.
                </TableCell>
              </TableRow>
            ) : (
              trips.map((trip, index) => {
                const rowNum = rowStartIndex + index;
                return (
                  <TableRow key={trip.bookingId} className="group">
                    <TableCell className="text-center tabular-nums text-muted-foreground font-medium">
                      {rowNum}
                    </TableCell>

                    <TableCell
                      className="whitespace-nowrap text-muted-foreground"
                      title={trip.tripTimestamp}
                    >
                      {formatTripDate(trip.tripTimestamp)}
                    </TableCell>

                    <TableCell
                      className="font-mono text-xs"
                      title={cleanId(trip.bookingId)}
                    >
                      {truncateId(trip.bookingId)}
                    </TableCell>

                    <TableCell
                      className="font-mono text-xs"
                      title={cleanId(trip.customerId)}
                    >
                      {truncateId(trip.customerId)}
                    </TableCell>

                    <TableCell className="font-medium">
                      {trip.vehicleType}
                    </TableCell>

                    <TableCell>
                      {trip.bookingStatus && (
                        <Badge
                          variant="outline"
                          className={`
                          inline-flex items-center gap-1.5
                          rounded-full px-2.5 py-0.5
                          text-xs font-medium
                          transition-colors duration-200
                          ${STATUS_CONFIG[trip.bookingStatus]?.className}
                        `}
                        >
                          {STATUS_CONFIG[trip.bookingStatus]?.icon}
                          {trip.bookingStatus}
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="text-center tabular-nums font-medium">
                      {trip.bookingValue > 0
                        ? formatNum(trip.bookingValue, 0)
                        : "–"}
                    </TableCell>

                    <TableCell className="text-center tabular-nums">
                      {trip.rideDistance > 0
                        ? `${formatNum(trip.rideDistance, 1)} km`
                        : "–"}
                    </TableCell>

                    <TableCell className="text-center tabular-nums text-muted-foreground">
                      {trip.revenuePerKm != null
                        ? formatNum(trip.revenuePerKm, 1)
                        : "–"}
                    </TableCell>

                    <TableCell className="text-center tabular-nums">
                      {trip.driverRating != null
                        ? formatNum(trip.driverRating, 1)
                        : "–"}
                    </TableCell>

                    <TableCell className="text-center tabular-nums">
                      {trip.customerRating != null
                        ? formatNum(trip.customerRating, 1)
                        : "–"}
                    </TableCell>

                    <TableCell className="text-muted-foreground">
                      {trip.paymentMethod ?? "–"}
                    </TableCell>

                    <TableCell className="py-1 flex items-center gap-1">
                      {isCompleted(trip) && !isCancelled(trip) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild disabled={updating}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Change status</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {CANCELLATION_STATUS_OPTIONS.map((status) => (
                              <DropdownMenuItem
                                key={status}
                                onClick={() =>
                                  setCancelTarget({
                                    ...trip,
                                    bookingStatus: status,
                                  })
                                }
                              >
                                Mark: {status}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(trip)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Cancel status confirmation: we open a small dialog to pick status then confirm */}
      {cancelTarget && (
        <AlertDialog
          open={!!cancelTarget}
          onOpenChange={(open) => !open && setCancelTarget(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Update status</AlertDialogTitle>
              <AlertDialogDescription>
                Change booking to &quot;{cancelTarget.bookingStatus}&quot;? This
                will mark the trip as cancelled.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  handleCancelStatus(cancelTarget, cancelTarget.bookingStatus)
                }
              >
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {deleteTarget && (
        <AlertDialog
          open={!!deleteTarget}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete trip</AlertDialogTitle>
              <AlertDialogDescription>
                Delete trip {truncateId(deleteTarget.bookingId)}? This cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => handleDelete(deleteTarget)}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
