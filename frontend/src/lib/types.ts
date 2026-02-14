/**
 * TypeScript types for Uber Trip Data Platform.
 * API returns snake_case; we use camelCase in the app (transform in api.ts).
 */

export interface Trip {
  bookingId: string
  customerId: string
  vehicleType: string
  bookingStatus: string
  bookingValue: number
  rideDistance: number
  paymentMethod: string
  tripTimestamp: string
  pickupHour: number
  dayOfWeek: number
  dayName: string
  month: number
  year: number
  isWeekend: boolean
  unifiedCancellationReason: string
  driverRating: number | null
  customerRating: number | null
  driverRatingImputed: boolean
  customerRatingImputed: boolean
  isCancelled: boolean
  revenuePerKm: number | null
}

export interface GetTripsParams {
  vehicle_type?: string
  payment_method?: string
  start_date?: string // YYYY-MM-DD
  end_date?: string // YYYY-MM-DD
  min_booking_value?: number
  max_booking_value?: number
  limit?: number
  offset?: number
}

export interface GetTripsResponse {
  total: number
  limit: number
  offset: number
  trips: Trip[]
}

export interface CreateTripPayload {
  date: string // YYYY-MM-DD
  time: string // HH:MM:SS
  customer_id: string
  vehicle_type: string
  booking_value: number
  ride_distance: number
  payment_method: string
  driver_rating?: number
  customer_rating?: number
}

export interface UpdateTripStatusPayload {
  booking_status: string
}

/** Status options for cancelling a completed trip */
export const CANCELLATION_STATUS_OPTIONS = [
  'Cancelled by Customer',
  'Cancelled by Driver',
  'Incomplete',
  'No Driver Found',
] as const
