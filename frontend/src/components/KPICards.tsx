import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { TrendingUp, Car, CheckCircle, DollarSign } from 'lucide-react'

export interface KPIMetrics {
  totalBookings: number
  successfulBookings: number
  totalRevenue: number
  successRatePercent: number
}

export interface KPICardsProps {
  metrics: KPIMetrics
  loading?: boolean
}

export function KPICards({ metrics, loading }: KPICardsProps) {
  const cards = [
    {
      title: 'Total Bookings',
      value: metrics.totalBookings.toLocaleString(),
      icon: Car,
      desc: 'All trips in range',
    },
    {
      title: 'Successful Bookings',
      value: metrics.successfulBookings.toLocaleString(),
      icon: CheckCircle,
      desc: 'Completed trips',
    },
    {
      title: 'Total Revenue',
      value: `₹${metrics.totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
      icon: DollarSign,
      desc: 'Sum of booking value',
    },
    {
      title: 'Success Rate',
      value: `${metrics.successRatePercent.toFixed(1)}%`,
      icon: TrendingUp,
      desc: 'Completed / Total',
    },
  ]

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((c, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <span className="text-sm font-medium text-muted-foreground">{c.title}</span>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-24 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((c, i) => {
        const Icon = c.icon
        return (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <span className="text-sm font-medium text-muted-foreground">{c.title}</span>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{c.value}</div>
              <p className="text-xs text-muted-foreground">{c.desc}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
