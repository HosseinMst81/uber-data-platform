import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, CheckCircle, DollarSign, Percent } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import type { KPIsData } from '@/lib/analytics-types'

type Props = {
  data?: KPIsData
  isLoading?: boolean
}

export function KPICards({ data, isLoading }: Props) {
  const kpis = [
    {
      title: 'Total Bookings',
      value: data?.totalBookings.toLocaleString() ?? '0',
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
      description: 'All reservations',
    },
    {
      title: 'Successful Trips',
      value: data?.successfulBookings.toLocaleString() ?? '0',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950',
      description: 'Completed bookings',
    },
    {
      title: 'Total Revenue',
      value: `$${data?.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 }) ?? '0'}`,
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950',
      description: 'From completed trips',
    },
    {
      title: 'Success Rate',
      value: `${data?.successRate.toFixed(1) ?? '0'}%`,
      icon: Percent,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
      description: 'Trip completion rate',
    },
  ]

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 mb-1" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon
        return (
          <Card key={kpi.title} className="transition-all hover:shadow-lg hover:scale-[1.02]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <div className={`${kpi.bgColor} p-2.5 rounded-full`}>
                <Icon className={`h-5 w-5 ${kpi.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{kpi.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}