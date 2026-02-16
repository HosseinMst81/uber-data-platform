// Types
export type KPIsData = {
  totalBookings: number
  successfulBookings: number
  totalRevenue: number
  successRate: number
}

export type CancellationReason = {
  reason: string
  count: number
  percentage: number
}

export type PaymentMethod = {
  paymentMethod: string
  count: number
  percentage: number
}

export type VehicleAnalysis = {
  vehicleType: string
  totalTrips: number
  avgDriverRating: number
  avgCustomerRating: number
  totalRevenue: number
  avgBookingValue: number
}

export type PeakHour = {
  hour: number
  tripCount: number
}

export type WeekdayData = {
  dayName: string
  tripCount: number
  avgRevenue: number
}

export type AnalyticsFilters = {
  startDate?: string
  endDate?: string
  vehicleType?: string
}