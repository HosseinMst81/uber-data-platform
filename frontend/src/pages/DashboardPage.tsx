import { useState, useMemo } from 'react'
import {
  useKPIs,
  useCancellationReasons,
  usePaymentMethods,
  useVehicleAnalysis,
  usePeakHours,
  useWeekdayAnalysis,
  useVehicleTypes,
} from '@/hooks'
import type { AnalyticsFilters } from '@/lib/analytics-types'
import { KPICards } from '@/components/Dashboard/KPICards'
import { CancellationPieChart } from '@/components/Dashboard/CancellationPieChart'
import { PaymentPieChart } from '@/components/Dashboard/PaymentPieChart'
import { VehicleBarChart } from '@/components/Dashboard/VehiclePieChart'
import { PeakHoursChart } from '@/components/Dashboard/PeakHoursChart'
import { WeekdayChart } from '@/components/Dashboard/WeekdayChart'
import { DashboardFilters } from '@/components/Dashboard/DashboardFilters'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2 } from 'lucide-react'

export function DashboardPage() {
  // Start with all-time data by default
  const [filters, setFilters] = useState<AnalyticsFilters>({
    startDate: undefined,
    endDate: undefined,
    vehicleType: undefined,
  })
  const [timeView, setTimeView] = useState<'hourly' | 'weekly'>('hourly')

  // Fetch data from APIs
  const { data: kpis, isLoading: kpisLoading } = useKPIs(filters)
  const { data: cancellations, isLoading: cancellationsLoading } = useCancellationReasons(filters)
  const { data: payments, isLoading: paymentsLoading } = usePaymentMethods(filters)
  const { data: vehicles, isLoading: vehiclesLoading } = useVehicleAnalysis(filters)
  const { data: peakHours, isLoading: peakHoursLoading } = usePeakHours(filters)
  const { data: weekdays, isLoading: weekdaysLoading } = useWeekdayAnalysis(filters)
  const { data: vehicleTypes } = useVehicleTypes()

  const isAnyLoading =
    kpisLoading ||
    cancellationsLoading ||
    paymentsLoading ||
    vehiclesLoading ||
    peakHoursLoading ||
    weekdaysLoading

  // Prepare data for charts
  const cancellationChartData = useMemo(
    () =>
      cancellations?.map((item) => ({
        name: item.reason,
        value: item.count,
        percentage: item.percentage,
      })) ?? [],
    [cancellations]
  )

  const paymentChartData = useMemo(
    () =>
      payments?.map((item) => ({
        name: item.paymentMethod,
        value: item.count,
        percentage: item.percentage,
      })) ?? [],
    [payments]
  )

  return (
    <div className="container mx-auto space-y-6 py-6 px-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive trip performance and revenue analysis
          </p>
        </div>
        {isAnyLoading && (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* Filters */}
      <DashboardFilters
        filters={filters}
        vehicleTypes={vehicleTypes ?? []}
        onFiltersChange={setFilters}
        isLoading={isAnyLoading}
      />

      {/* KPI Cards */}
      <KPICards data={kpis} isLoading={kpisLoading} />

      {/* Cancellation Reasons - Full Width */}
      <CancellationPieChart data={cancellationChartData} isLoading={cancellationsLoading} />

      {/* Payment Methods - Single Column */}
      <PaymentPieChart data={paymentChartData} isLoading={paymentsLoading} />

      {/* Vehicle Analysis Bar Chart */}
      <VehicleBarChart data={vehicles ?? []} isLoading={vehiclesLoading} />

      {/* Time Trend Charts with Tabs */}
      <Card className="p-6">
        <Tabs value={timeView} onValueChange={(v) => setTimeView(v as never)}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">Time-based Trip Analysis</h2>
              <p className="text-sm text-muted-foreground mt-1">
                View trip patterns by hour or day of week
              </p>
            </div>
            <TabsList>
              <TabsTrigger value="hourly">Hourly</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="hourly" className="mt-0">
            <PeakHoursChart data={peakHours ?? []} isLoading={peakHoursLoading} />
          </TabsContent>

          <TabsContent value="weekly" className="mt-0">
            <WeekdayChart data={weekdays ?? []} isLoading={weekdaysLoading} />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}