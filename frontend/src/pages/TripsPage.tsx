import { useState } from 'react'
import type { GetTripsParams } from '@/lib/types'
import { TripFilters } from '@/components/TripFilters'
import { TripsTable } from '@/components/TripsTable'
import { CreateTripForm } from '@/components/CreateTripForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTrips } from '@/hooks/use-trips'
import { useQueryClient } from '@tanstack/react-query'
import { tripsKeys } from '@/lib/query-keys'

const LIMIT_OPTIONS = [10, 25, 50, 100]

export function TripsPage() {
  const [filters, setFilters] = useState<GetTripsParams>({
    limit: 10,
    offset: 0,
  })

  const { data, isLoading } = useTrips(filters)
  const queryClient = useQueryClient()
  const trips = data?.trips ?? []
  const total = data?.total ?? 0

  const refetchTrips = () => {
    queryClient.invalidateQueries({ queryKey: tripsKeys.list(filters) })
  }

  const applyFilters = () => {
    setFilters((prev) => ({ ...prev, offset: 0 }))
  }

  const limit = filters.limit ?? 10

  const resetFilters = () => {
    setFilters({
      limit: 10,
      offset: 0,
    })
  }

  const page = Math.floor((filters.offset ?? 0) / limit) + 1
  const start = (filters.offset ?? 0) + 1
  const end = Math.min((filters.offset ?? 0) + limit, total)
  const totalPages = Math.ceil(total / limit)
  const canPrev = (filters.offset ?? 0) > 0
  const canNext = (filters.offset ?? 0) + limit < total

  const goPrev = () => setFilters((prev) => ({ ...prev, offset: Math.max(0, (prev.offset ?? 0) - limit) }))
  const goNext = () =>
    setFilters((prev) => ({
      ...prev,
      offset: (prev.offset ?? 0) + limit,
    }))

  const setLimit = (l: number) => setFilters((prev) => ({ ...prev, limit: l, offset: 0 }))

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

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h2 className="text-lg font-semibold">Trip list</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Per page</span>
            <Select
              value={String(limit)}
              onValueChange={(v) => setLimit(Number(v))}
            >
              <SelectTrigger className="w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LIMIT_OPTIONS.map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <TripsTable
            trips={trips}
            loading={isLoading}
            onStatusUpdated={refetchTrips}
            onDeleted={refetchTrips}
          />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {total === 0 ? 0 : start} to {end} of {total} trips
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" disabled={!canPrev} onClick={goPrev}>
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous</span>
              </Button>
              <span className="text-sm">
                Page {page} of {totalPages || 1}
              </span>
              <Button variant="outline" size="icon" disabled={!canNext} onClick={goNext}>
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
