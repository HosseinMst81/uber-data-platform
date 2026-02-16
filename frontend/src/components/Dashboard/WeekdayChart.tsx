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
  import { Skeleton } from '@/components/ui/skeleton'
  import type { WeekdayData } from '@/lib/analytics-types'
  
  type Props = {
    data: WeekdayData[]
    isLoading?: boolean
  }
  
  export function WeekdayChart({ data, isLoading }: Props) {
    if (isLoading) {
      return <Skeleton className="h-[350px] w-full" />
    }
  
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-[350px]">
          <p className="text-muted-foreground">No weekly data available</p>
        </div>
      )
    }
  
    return (
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="dayName" />
          <YAxis yAxisId="left" orientation="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip
            content={({ payload }) => {
              if (!payload?.[0]) return null
              const data = payload[0].payload as WeekdayData
              return (
                <div className="bg-background border rounded-lg p-3 shadow-lg">
                  <p className="font-semibold mb-1">{data.dayName}</p>
                  <p className="text-sm">Trip Count: {data.tripCount.toLocaleString()}</p>
                  <p className="text-sm">Avg Revenue: ${data.avgRevenue.toFixed(2)}</p>
                </div>
              )
            }}
          />
          <Legend />
          <Bar 
            yAxisId="left"
            dataKey="tripCount" 
            fill="#8b5cf6" 
            name="Trip Count" 
            radius={[8, 8, 0, 0]} 
          />
          <Bar 
            yAxisId="right"
            dataKey="avgRevenue" 
            fill="#10b981" 
            name="Avg Revenue ($)" 
            radius={[8, 8, 0, 0]} 
          />
        </BarChart>
      </ResponsiveContainer>
    )
  }