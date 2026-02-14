import { useState, useCallback, useMemo } from 'react'
import { tripsApi } from '@/lib/api'
import type { GetTripsParams } from '@/lib/types'
import type { Trip } from '@/lib/types'
import { KPICards } from '@/components/KPICards'
import type { KPIMetrics } from '@/components/KPICards'
import { CancellationPieChart } from '@/components/Charts/CancellationPieChart'
import { PaymentPieChart } from '@/components/Charts/PaymentPieChart'
import { VehicleBarChart } from '@/components/Charts/VehicleBarChart'
import {
  HourlyLineChart,
  type TrendMode,
} from '@/components/Charts/HourlyLineChart'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
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
import { useEffect } from 'react'

const VEHICLE_OPTIONS = ['All', 'Sedan', 'Auto', 'eBike', 'Bike', 'Moto', 'Mini', 'XL', 'Go']
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/** Default last 30 days */
function defaultDateRange() {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 30)
  return {
    start_date: start.toISOString().slice(0, 10),
    end_date: end.toISOString().slice(0, 10),
  }
}

const DASHBOARD_LIMIT = 10_000

export function DashboardPage() {
  const [dateRange, setDateRange] = useState(defaultDateRange())
  const [vehicleFilter, setVehicleFilter] = useState<string>('All')
  const [trendMode, setTrendMode] = useState<TrendMode>('byHour')
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)

  const apiParams: GetTripsParams = useMemo(
    () => ({
      start_date: dateRange.start_date,
      end_date: dateRange.end_date,
      vehicle_type: vehicleFilter === 'All' ? undefined : vehicleFilter,
      limit: DASHBOARD_LIMIT,
      offset: 0,
    }),
    [dateRange.start_date, dateRange.end_date, vehicleFilter]
  )

  const fetchDashboardData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await tripsApi.getTrips(apiParams)
      setTrips(res.trips)
      if (res.total > res.trips.length) {
        console.warn(
          `Dashboard showing ${res.trips.length} of ${res.total} trips. Consider narrowing the date range.`
        )
      }
    } catch {
      setTrips([])
    } finally {
      setLoading(false)
    }
  }, [apiParams])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const metrics: KPIMetrics = useMemo(() => {
    const totalBookings = trips.length
    const successfulBookings = trips.filter((t) => t.bookingStatus === 'Completed').length
    const totalRevenue = trips.reduce((s, t) => s + t.bookingValue, 0)
    const successRatePercent =
      totalBookings > 0 ? (successfulBookings / totalBookings) * 100 : 0
    return {
      totalBookings,
      successfulBookings,
      totalRevenue,
      successRatePercent,
    }
  }, [trips])

  const cancellationData = useMemo(() => {
    const map = new Map<string, number>()
    trips.forEach((t) => {
      const reason = t.unifiedCancellationReason || 'Reason Not Specified'
      map.set(reason, (map.get(reason) ?? 0) + 1)
    })
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [trips])

  const paymentData = useMemo(() => {
    const map = new Map<string, number>()
    trips.forEach((t) => {
      const method = t.paymentMethod || 'Other'
      map.set(method, (map.get(method) ?? 0) + 1)
    })
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [trips])

  const vehicleData = useMemo(() => {
    const byType = new Map<
      string,
      { trips: number; sumRating: number; countRating: number }
    >()
    trips.forEach((t) => {
      const v = t.vehicleType || 'Other'
      const cur = byType.get(v) ?? { trips: 0, sumRating: 0, countRating: 0 }
      cur.trips += 1
      if (t.driverRating != null) {
        cur.sumRating += t.driverRating
        cur.countRating += 1
      }
      byType.set(v, cur)
    })
    return Array.from(byType.entries()).map(([vehicleType, d]) => ({
      vehicleType,
      trips: d.trips,
      avgDriverRating:
        d.countRating > 0 ? Math.round((d.sumRating / d.countRating) * 100) / 100 : 0,
    }))
  }, [trips])

  const trendData = useMemo(() => {
    if (trendMode === 'byHour') {
      const byHour = Array.from({ length: 24 }, (_, i) => ({
        label: String(i),
        trips: 0,
      }))
      trips.forEach((t) => {
        const h = t.pickupHour ?? 0
        if (h >= 0 && h < 24) byHour[h].trips += 1
      })
      return byHour
    }
    const byDay = DAY_NAMES.map((name) => ({ label: name, trips: 0 }))
    trips.forEach((t) => {
      const d = t.dayOfWeek ?? 0
      if (d >= 0 && d <= 6) byDay[d].trips += 1
    })
    return byDay
  }, [trips, trendMode])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Analytics dashboard</h1>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Filters</h2>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-4">
          <div className="space-y-2">
            <Label>Start date</Label>
            <Input
              type="date"
              value={dateRange.start_date}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, start_date: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>End date</Label>
            <Input
              type="date"
              value={dateRange.end_date}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, end_date: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Vehicle type</Label>
            <Select value={vehicleFilter} onValueChange={setVehicleFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VEHICLE_OPTIONS.map((v) => (
                  <SelectItem key={v} value={v}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => fetchDashboardData()}>Apply</Button>
        </CardContent>
      </Card>

      <KPICards metrics={metrics} loading={loading} />

      <div className="grid gap-4 md:grid-cols-2">
        <CancellationPieChart data={cancellationData} loading={loading} />
        <PaymentPieChart data={paymentData} loading={loading} />
      </div>

      <VehicleBarChart
        data={vehicleData}
        loading={loading}
      />

      <div className="space-y-2">
        <div className="flex gap-2">
          <Button
            variant={trendMode === 'byHour' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTrendMode('byHour')}
          >
            By hour
          </Button>
          <Button
            variant={trendMode === 'byDay' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTrendMode('byDay')}
          >
            By day of week
          </Button>
        </div>
        <HourlyLineChart data={trendData} mode={trendMode} loading={loading} />
      </div>
    </div>
  )
}
