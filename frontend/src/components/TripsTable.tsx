import type { Trip } from '@/lib/types'
import { CANCELLATION_STATUS_OPTIONS } from '@/lib/types'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { tripsApi } from '@/lib/api'
import { toast } from 'sonner'

export interface TripsTableProps {
  trips: Trip[]
  loading?: boolean
  onStatusUpdated: () => void
  onDeleted: () => void
}

function truncateId(id: string, len = 8) {
  if (id.length <= len) return id
  return `${id.slice(0, len)}…`
}

export function TripsTable({
  trips,
  loading,
  onStatusUpdated,
  onDeleted,
}: TripsTableProps) {
  const [cancelTarget, setCancelTarget] = useState<Trip | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Trip | null>(null)
  const [updating, setUpdating] = useState(false)

  const handleCancelStatus = async (trip: Trip, newStatus: string) => {
    setCancelTarget(null)
    setUpdating(true)
    try {
      await tripsApi.updateTripStatus(trip.bookingId, { booking_status: newStatus })
      toast.success('Status updated')
      onStatusUpdated()
    } catch (e: unknown) {
      const msg = e && typeof e === 'object' && 'response' in e
        ? (e as { response?: { data?: { error?: string } } }).response?.data?.error
        : 'Failed to update status'
      toast.error(msg ?? 'Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async (trip: Trip) => {
    setDeleteTarget(null)
    try {
      await tripsApi.deleteTrip(trip.bookingId)
      toast.success('Trip deleted')
      onDeleted()
    } catch (e: unknown) {
      const msg = e && typeof e === 'object' && 'response' in e
        ? (e as { response?: { data?: { error?: string } } }).response?.data?.error
        : 'Failed to delete'
      toast.error(msg ?? 'Failed to delete')
    }
  }

  const isCompleted = (t: Trip) => t.bookingStatus === 'Completed'
  const isCancelled = (t: Trip) => t.isCancelled

  if (loading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Distance</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map((i) => (
              <TableRow key={i}>
                {Array.from({ length: 10 }).map((_, j) => (
                  <TableCell key={j}>
                    <div className="h-5 w-16 animate-pulse rounded bg-muted" />
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
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Distance</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trips.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                  No trips found.
                </TableCell>
              </TableRow>
            ) : (
              trips.map((trip) => (
                <TableRow key={trip.bookingId}>
                  <TableCell className="font-mono text-xs" title={trip.bookingId}>
                    {truncateId(trip.bookingId)}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{trip.customerId}</TableCell>
                  <TableCell>{trip.vehicleType}</TableCell>
                  <TableCell>
                    <span
                      className={
                        isCancelled(trip)
                          ? 'rounded bg-destructive/10 px-2 py-0.5 text-xs text-destructive'
                          : 'rounded bg-primary/10 px-2 py-0.5 text-xs text-primary'
                      }
                    >
                      {trip.bookingStatus}
                    </span>
                  </TableCell>
                  <TableCell>{trip.bookingValue.toFixed(2)}</TableCell>
                  <TableCell>{trip.rideDistance.toFixed(1)} km</TableCell>
                  <TableCell>{trip.paymentMethod}</TableCell>
                  <TableCell>
                    {trip.driverRating != null ? trip.driverRating.toFixed(1) : '–'}
                  </TableCell>
                  <TableCell>
                    {trip.customerRating != null ? trip.customerRating.toFixed(1) : '–'}
                  </TableCell>
                  <TableCell>
                    {isCancelled(trip) ? (
                      <span className="text-muted-foreground text-xs">Cancelled</span>
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
              ))
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
