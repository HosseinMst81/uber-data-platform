import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export type TrendMode = 'byHour' | 'byDay'

export interface HourlyLineChartProps {
  data: { label: string; trips: number }[]
  mode: TrendMode
  loading?: boolean
}

export function HourlyLineChart({ data, mode, loading }: HourlyLineChartProps) {
  const title = mode === 'byHour' ? 'Trips by hour of day' : 'Trips by day of week'

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
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
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value) => [value ?? 0, 'Trips']}
                labelFormatter={(label) => (mode === 'byHour' ? `Hour: ${label}` : label)}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="trips"
                name="Trips"
                stroke="var(--color-primary, #3b82f6)"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
