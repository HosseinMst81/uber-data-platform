import type { GetTripsParams } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

const VEHICLE_OPTIONS = ['Sedan', 'Auto', 'eBike', 'Bike', 'Moto', 'Mini', 'XL', 'Go']
const PAYMENT_OPTIONS = ['Credit Card', 'UPI', 'Debit Card', 'Cash', 'Wallet', 'Paytm']

export interface TripFiltersProps {
  filters: GetTripsParams
  onFiltersChange: (f: GetTripsParams) => void
  onApply: () => void
  onReset: () => void
}

export function TripFilters({ filters, onFiltersChange, onApply, onReset }: TripFiltersProps) {
  const set = (key: keyof GetTripsParams, value: string | number | undefined) => {
    onFiltersChange({ ...filters, [key]: value === '' || value === undefined ? undefined : value })
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <h3 className="text-sm font-semibold">Filters</h3>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label>Vehicle type</Label>
            <Select
              value={filters.vehicle_type ?? 'all'}
              onValueChange={(v) => set('vehicle_type', v === 'all' ? undefined : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {VEHICLE_OPTIONS.map((o) => (
                  <SelectItem key={o} value={o}>
                    {o}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Payment method</Label>
            <Select
              value={filters.payment_method ?? 'all'}
              onValueChange={(v) => set('payment_method', v === 'all' ? undefined : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {PAYMENT_OPTIONS.map((o) => (
                  <SelectItem key={o} value={o}>
                    {o}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Start date (YYYY-MM-DD)</Label>
            <Input
              type="date"
              value={filters.start_date ?? ''}
              onChange={(e) => set('start_date', e.target.value || undefined)}
            />
          </div>
          <div className="space-y-2">
            <Label>End date (YYYY-MM-DD)</Label>
            <Input
              type="date"
              value={filters.end_date ?? ''}
              onChange={(e) => set('end_date', e.target.value || undefined)}
            />
          </div>
          <div className="space-y-2">
            <Label>Min booking value</Label>
            <Input
              type="number"
              min={0}
              step={0.01}
              placeholder="Min"
              value={filters.min_booking_value ?? ''}
              onChange={(e) =>
                set('min_booking_value', e.target.value === '' ? undefined : Number(e.target.value))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Max booking value</Label>
            <Input
              type="number"
              min={0}
              step={0.01}
              placeholder="Max"
              value={filters.max_booking_value ?? ''}
              onChange={(e) =>
                set('max_booking_value', e.target.value === '' ? undefined : Number(e.target.value))
              }
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={onApply}>Apply filters</Button>
          <Button variant="outline" onClick={onReset}>
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
