import type { Trip } from '@/lib/types'
import { CANCELLATION_STATUS_OPTIONS } from '@/lib/types'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useUpdateTripStatus, useDeleteTrip } from '@/hooks/use-trips'

export interface TripsTableProps {
  trips: Trip[]
  loading?: boolean
  /** 1-based index of the first row (for pagination: e.g. 11 when showing page 2 with limit 10). */
  rowStartIndex?: number
  onStatusUpdated: () => void
  onDeleted: () => void
}

/** Strip escaped quotes from API IDs for display (e.g. "\"CNR6915581\"" -> "CNR6915581"). */
function cleanId(id: string): string {
  return id.replace(/\\/g, '').replace(/^"|"$/g, '').trim() || id
}

function truncateId(id: string, len = 10) {
  const cleaned = cleanId(id)
  if (cleaned.length <= len) return cleaned
  return `${cleaned.slice(0, len)}…`
}

/** Safely format a number (backend may send decimals as strings from PostgreSQL). */
function formatNum(value: unknown, decimals: number): string {
  const n = Number(value)
  return Number.isNaN(n) ? '–' : n.toFixed(decimals)
}

/** Format ISO timestamp for table (e.g. "30 Dec 2024, 20:06"). */
function formatTripDate(iso: string): string {
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return '–'
    const date = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
    return `${date}, ${time}`
  } catch {
    return '–'
  }
}

export function TripsTable({
  trips,
  loading,
  rowStartIndex = 1,
  onStatusUpdated,
  onDeleted,
}: TripsTableProps) {
  const [cancelTarget, setCancelTarget] = useState<Trip | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Trip | null>(null)

  const updateStatusMutation = useUpdateTripStatus({
    onSuccess: () => {
      toast.success('Status updated')
      onStatusUpdated()
    },
    onError: (err: Error) => {
      const msg = (err as Error & { response?: { data?: { error?: string } } }).response?.data?.error ?? err.message ?? 'Failed to update status'
      toast.error(msg)
    },
  })
  const deleteMutation = useDeleteTrip({
    onSuccess: () => {
      toast.success('Trip deleted')
      onDeleted()
    },
    onError: (err: Error) => {
      const msg = (err as Error & { response?: { data?: { error?: string } } }).response?.data?.error ?? err.message ?? 'Failed to delete'
      toast.error(msg)
    },
  })

  const handleCancelStatus = (trip: Trip, newStatus: string) => {
    setCancelTarget(null)
    updateStatusMutation.mutate({ bookingId: trip.bookingId, payload: { booking_status: newStatus } })
  }

  const handleDelete = (trip: Trip) => {
    setDeleteTarget(null)
    deleteMutation.mutate(trip.bookingId)
  }

  const updating = updateStatusMutation.isPending

  const isCompleted = (t: Trip) => t.bookingStatus === 'Completed'
  const isCancelled = (t: Trip) => t.isCancelled

  const columnCount = 13 // #, Date, Booking ID, Customer, Vehicle, Status, Value, Distance, Rev/km, Driver, Customer, Payment, Actions

  if (loading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableCaption>A list of trips. Data is loading.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-right">#</TableHead>
              <TableHead className="min-w-[140px]">Date & time</TableHead>
              <TableHead className="min-w-[90px]">Booking ID</TableHead>
              <TableHead className="min-w-[85px]">Customer</TableHead>
              <TableHead className="min-w-[100px]">Vehicle</TableHead>
              <TableHead className="min-w-[120px]">Status</TableHead>
              <TableHead className="w-20 text-right">Value</TableHead>
              <TableHead className="w-20 text-right">Distance</TableHead>
              <TableHead className="w-16 text-right">Rev/km</TableHead>
              <TableHead className="w-14 text-center">Driver</TableHead>
              <TableHead className="w-14 text-center">Customer</TableHead>
              <TableHead className="min-w-[90px]">Payment</TableHead>
              <TableHead className="w-[72px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map((i) => (
              <TableRow key={i}>
                {Array.from({ length: columnCount }).map((_, j) => (
                  <TableCell key={j} className={j === 0 ? 'text-right' : j >= 6 && j <= 9 ? 'text-right' : ''}>
                    <Skeleton className="h-5 w-16" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableCaption className="sr-only">Trip list with row numbers</TableCaption>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-12 text-right font-semibold">#</TableHead>
              <TableHead className="min-w-[140px]">Date & time</TableHead>
              <TableHead className="min-w-[90px]">Booking ID</TableHead>
              <TableHead className="min-w-[85px]">Customer</TableHead>
              <TableHead className="min-w-[100px]">Vehicle</TableHead>
              <TableHead className="min-w-[120px]">Status</TableHead>
              <TableHead className="w-20 text-right">Value</TableHead>
              <TableHead className="w-20 text-right">Distance</TableHead>
              <TableHead className="w-16 text-right">Rev/km</TableHead>
              <TableHead className="w-14 text-center">Driver</TableHead>
              <TableHead className="w-14 text-center">Customer</TableHead>
              <TableHead className="min-w-[90px]">Payment</TableHead>
              <TableHead className="w-[72px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trips.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columnCount} className="h-24 text-center text-muted-foreground">
                  No trips found.
                </TableCell>
              </TableRow>
            ) : (
              trips.map((trip, index) => {
                const rowNum = rowStartIndex + index
                return (
                  <TableRow key={trip.bookingId} className="group">
                    <TableCell className="text-right tabular-nums text-muted-foreground font-medium">
                      {rowNum}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground" title={trip.tripTimestamp}>
                      {formatTripDate(trip.tripTimestamp)}
                    </TableCell>
                    <TableCell className="font-mono text-xs" title={cleanId(trip.bookingId)}>
                      {truncateId(trip.bookingId)}
                    </TableCell>
                    <TableCell className="font-mono text-xs" title={cleanId(trip.customerId)}>
                      {truncateId(trip.customerId)}
                    </TableCell>
                    <TableCell className="font-medium">{trip.vehicleType}</TableCell>
                    <TableCell>
                      <span
                        className={
                          isCancelled(trip)
                            ? 'inline-flex rounded-md bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive'
                            : 'inline-flex rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary'
                        }
                      >
                        {trip.bookingStatus}
                      </span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-medium">
                      {trip.bookingValue != null && trip.bookingValue > 0 ? formatNum(trip.bookingValue, 0) : '–'}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {trip.rideDistance != null && trip.rideDistance > 0 ? `${formatNum(trip.rideDistance, 1)} km` : '–'}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {trip.revenuePerKm != null ? formatNum(trip.revenuePerKm, 1) : '–'}
                    </TableCell>
                    <TableCell className="text-center tabular-nums">
                      {trip.driverRating != null ? formatNum(trip.driverRating, 1) : '–'}
                    </TableCell>
                    <TableCell className="text-center tabular-nums">
                      {trip.customerRating != null ? formatNum(trip.customerRating, 1) : '–'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {trip.paymentMethod ?? '–'}
                    </TableCell>
                    <TableCell className="py-1">
                      {isCancelled(trip) ? (
                        <span className="text-muted-foreground text-xs">—</span>
                      ) : isCompleted(trip) ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild disabled={updating}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Change status</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {CANCELLATION_STATUS_OPTIONS.map((status) => (
                              <DropdownMenuItem
                                key={status}
                                onClick={() => setCancelTarget({ ...trip, bookingStatus: status })}
                              >
                                Mark: {status}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : null}
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
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Cancel status confirmation: we open a small dialog to pick status then confirm */}
      {cancelTarget && (
        <AlertDialog open={!!cancelTarget} onOpenChange={(open) => !open && setCancelTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Update status</AlertDialogTitle>
              <AlertDialogDescription>
                Change booking to &quot;{cancelTarget.bookingStatus}&quot;? This will mark the trip
                as cancelled.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleCancelStatus(cancelTarget, cancelTarget.bookingStatus)}
              >
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {deleteTarget && (
        <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete trip</AlertDialogTitle>
              <AlertDialogDescription>
                Delete trip {truncateId(deleteTarget.bookingId)}? This cannot be undone.
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
  )
}
