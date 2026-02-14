import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export interface VehicleBarChartProps {
  data: { vehicleType: string; trips: number; avgDriverRating: number }[]
  loading?: boolean
}

export function VehicleBarChart({ data, loading }: VehicleBarChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Trips by vehicle type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] animate-pulse rounded bg-muted" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Trips by vehicle type</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="vehicleType" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value, name) => [
                  name === 'trips' ? Number(value ?? 0) : Number(value ?? 0).toFixed(2),
                  name === 'trips' ? 'Trips' : 'Avg driver rating',
                ]}
                labelFormatter={(label) => `Vehicle: ${label}`}
              />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="trips"
                name="Trips"
                fill="var(--color-primary, #3b82f6)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                yAxisId="right"
                dataKey="avgDriverRating"
                name="Avg driver rating"
                fill="var(--color-chart-2, #22c55e)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
