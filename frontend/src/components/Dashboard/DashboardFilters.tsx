import { Card, CardContent } from '@/components/ui/card'
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
import { Calendar, RefreshCw, Filter, Infinity as Inf } from 'lucide-react'
import type { AnalyticsFilters } from '@/lib/analytics-types'

type Props = {
  filters: AnalyticsFilters
  vehicleTypes: string[]
  onFiltersChange: (filters: AnalyticsFilters) => void
  isLoading?: boolean
}

export function DashboardFilters({
  filters,
  vehicleTypes,
  onFiltersChange,
  isLoading,
}: Props) {
  const handleReset = () => {
    // Reset to all-time (no date filters)
    onFiltersChange({
      startDate: undefined,
      endDate: undefined,
      vehicleType: undefined,
    })
  }

  const handleQuickFilter = (days: number | null) => {
    if (days === null) {
      // All-time filter
      onFiltersChange({
        ...filters,
        startDate: undefined,
        endDate: undefined,
      })
    } else {
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - days)
      onFiltersChange({
        ...filters,
        startDate: start.toISOString().slice(0, 10),
        endDate: end.toISOString().slice(0, 10),
      })
    }
  }

  const isAllTime = !filters.startDate && !filters.endDate

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Quick Date Filters */}
          <div className="flex items-center gap-2 pb-2 border-b">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Quick Filters:</span>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={isAllTime ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleQuickFilter(null)}
                disabled={isLoading}
                className="gap-1.5"
              >
                <Inf className="h-3.5 w-3.5" />
                All Time
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickFilter(7)}
                disabled={isLoading}
              >
                Last 7 days
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickFilter(30)}
                disabled={isLoading}
              >
                Last 30 days
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickFilter(90)}
                disabled={isLoading}
              >
                Last 90 days
              </Button>
            </div>
          </div>

          {/* Custom Date Range & Vehicle Filter */}
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px] space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Start Date
              </Label>
              <Input
                type="date"
                // className='w-auto'
                value={filters.startDate || ''}
                onChange={(e) =>
                  onFiltersChange({ ...filters, startDate: e.target.value || undefined })
                }
                disabled={isLoading}
                placeholder="All time"
              />
            </div>

            <div className="flex-1 min-w-[200px] space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                End Date
              </Label>
              <Input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) =>
                  onFiltersChange({ ...filters, endDate: e.target.value || undefined })
                }
                disabled={isLoading}
                // className='w-auto'
                placeholder="All time"
              />
            </div>

            <div className="flex-1 space-y-2">
              <Label>Vehicle Type</Label>
              <Select
                value={filters.vehicleType || 'all'}
                onValueChange={(value) =>
                  onFiltersChange({
                    ...filters,
                    vehicleType: value === 'all' ? undefined : value,
                  })
                }
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All vehicles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vehicles</SelectItem>
                  {vehicleTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              onClick={handleReset}
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Reset to All Time
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}