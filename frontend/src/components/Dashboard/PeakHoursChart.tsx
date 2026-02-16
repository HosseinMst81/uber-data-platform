import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
  } from 'recharts'
  import { Skeleton } from '@/components/ui/skeleton'
  import type { PeakHour } from '@/lib/analytics-types'
  
  type Props = {
    data: PeakHour[]
    isLoading?: boolean
  }
  
  export function PeakHoursChart({ data, isLoading }: Props) {
    if (isLoading) {
      return <Skeleton className="h-[350px] w-full" />
    }
  
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-[350px]">
          <p className="text-muted-foreground">No hourly data available</p>
        </div>
      )
    }
  
    return (
      <ResponsiveContainer width="100%" height={350}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorTrips" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="hour" 
            label={{ value: 'Hour of Day', position: 'insideBottom', offset: -5 }}
            tickFormatter={(hour) => `${hour}:00`}
          />
          <YAxis label={{ value: 'Number of Trips', angle: -90, position: 'insideLeft' }} />
          <Tooltip
            content={({ payload }) => {
              if (!payload?.[0]) return null
              const data = payload[0].payload as PeakHour
              return (
                <div className="bg-background border rounded-lg p-3 shadow-lg">
                  <p className="font-semibold">Hour {data.hour}:00</p>
                  <p className="text-sm text-muted-foreground">
                    {data.tripCount.toLocaleString()} trips
                  </p>
                </div>
              )
            }}
          />
          <Area
            type="monotone"
            dataKey="tripCount"
            stroke="#3b82f6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorTrips)"
          />
        </AreaChart>
      </ResponsiveContainer>
    )
  }