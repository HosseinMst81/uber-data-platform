import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'
import { XCircle } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

type ChartData = {
  name: string
  value: number
  percentage: number
}

type Props = {
  data: ChartData[]
  isLoading?: boolean
}

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#6366f1']
const TOP_REASONS_COUNT = 5 // Show top 5 in chart, rest as "Others"

export function CancellationPieChart({ data, isLoading }: Props) {
  // Process data: show top reasons in chart, group rest as "Others"
  const { chartData, totalCancellations } = useMemo(() => {
    if (!data || data.length === 0) {
      return { chartData: [], totalCancellations: 0 }
    }

    const total = data.reduce((sum, item) => sum + item.value, 0)
    
    // Sort by count descending
    const sorted = [...data].sort((a, b) => b.value - a.value)
    
    // Take top N reasons
    const topReasons = sorted.slice(0, TOP_REASONS_COUNT)
    const otherReasons = sorted.slice(TOP_REASONS_COUNT)
    
    // Create chart data
    const chartData = topReasons.map(item => ({
      name: item.name,
      value: item.value,
      percentage: item.percentage,
    }))
    
    // Add "Others" if there are more reasons
    if (otherReasons.length > 0) {
      const othersValue = otherReasons.reduce((sum, item) => sum + item.value, 0)
      const othersPercentage = otherReasons.reduce((sum, item) => sum + item.percentage, 0)
      chartData.push({
        name: 'Others',
        value: othersValue,
        percentage: othersPercentage,
      })
    }
    
    return { chartData, totalCancellations: total }
  }, [data])

  if (isLoading) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5" />
            Cancellation Reasons
          </CardTitle>
          <CardDescription>Distribution of trip cancellation reasons</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <Skeleton className="h-[300px] w-full" />
            <Skeleton className="h-[300px] w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5" />
            Cancellation Reasons
          </CardTitle>
          <CardDescription>Distribution of trip cancellation reasons</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">No cancellation data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              Cancellation Reasons
            </CardTitle>
            <CardDescription>Distribution of trip cancellation reasons</CardDescription>
          </div>
          <Badge variant="secondary" className="text-lg px-3 py-1">
            {totalCancellations.toLocaleString()} Total Cancellations
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Pie Chart - Top Reasons Only */}
          <div>
            <h3 className="text-sm font-medium mb-4 text-muted-foreground">
              Top {TOP_REASONS_COUNT} Reasons Visualization
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ percentage }) => `${percentage.toFixed(1)}%`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ payload }) => {
                    if (!payload?.[0]) return null
                    const data = payload[0].payload as ChartData
                    return (
                      <div className="bg-background border rounded-lg p-3 shadow-lg">
                        <p className="font-semibold">{data.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Count: {data.value.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Percentage: {data.percentage.toFixed(1)}%
                        </p>
                      </div>
                    )
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Table - All Reasons */}
          <div>
            <h3 className="text-sm font-medium mb-4 text-muted-foreground">
              Complete Breakdown
            </h3>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">#</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead className="text-right">Count</TableHead>
                    <TableHead className="text-right">%</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item, index) => (
                    <TableRow key={item.name}>
                      <TableCell className="font-medium text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor:
                                index < TOP_REASONS_COUNT
                                  ? COLORS[index % COLORS.length]
                                  : '#94a3b8',
                            }}
                          />
                          <span className="font-medium">{item.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {item.value.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline">{item.percentage.toFixed(1)}%</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}