import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'
import { Car } from 'lucide-react'
import type { VehicleAnalysis } from '@/lib/analytics-types'

type Props = {
  data: VehicleAnalysis[]
  isLoading?: boolean
}

export function VehicleBarChart({ data, isLoading }: Props) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Vehicle Analysis
          </CardTitle>
          <CardDescription>
            Comparison of trips and ratings by vehicle type
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Vehicle Analysis
          </CardTitle>
          <CardDescription>
            Comparison of trips and ratings by vehicle type
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[400px]">
          <p className="text-muted-foreground">No vehicle data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Car className="h-5 w-5" />
          Vehicle Analysis
        </CardTitle>
        <CardDescription>
          Comparison of trips and ratings by vehicle type
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="vehicleType" />
            <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
            <YAxis yAxisId="right" orientation="right" stroke="#10b981" domain={[0, 5]} />
            <Tooltip
              content={({ payload }) => {
                if (!payload?.[0]) return null
                const data = payload[0].payload as VehicleAnalysis
                return (
                  <div className="bg-background border rounded-lg p-3 shadow-lg">
                    <p className="font-semibold mb-2">{data.vehicleType}</p>
                    <p className="text-sm">Total Trips: {data.totalTrips.toLocaleString()}</p>
                    <p className="text-sm">Driver Rating: {data.avgDriverRating.toFixed(2)}</p>
                    <p className="text-sm">Customer Rating: {data.avgCustomerRating.toFixed(2)}</p>
                    <p className="text-sm">Total Revenue: ${data.totalRevenue.toLocaleString()}</p>
                    <p className="text-sm">Avg Booking: ${data.avgBookingValue.toFixed(2)}</p>
                  </div>
                )
              }}
            />
            <Legend />
            <Bar 
              yAxisId="left" 
              dataKey="totalTrips" 
              fill="#3b82f6" 
              name="Total Trips" 
              radius={[4, 4, 0, 0]}
            />
            <Bar
              yAxisId="right"
              dataKey="avgDriverRating"
              fill="#10b981"
              name="Avg Driver Rating"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}