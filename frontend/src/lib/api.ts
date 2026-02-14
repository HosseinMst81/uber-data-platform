/**
 * API service for Uber Trip Data Platform.
 * Uses intercepted axios instance (auth + error handling).
 * Transforms snake_case responses to camelCase for the app.
 */

import { httpInterceptedService } from '@/core/http-service'
import type {
  Trip,
  GetTripsParams,
  GetTripsResponse,
  CreateTripPayload,
  UpdateTripStatusPayload,
} from './types'

const TRIPS_PATH = '/api/trips'

/** Convert snake_case object keys to camelCase (one level only) */
function toCamel<T extends Record<string, unknown>>(obj: Record<string, unknown>): T {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
    result[camelKey] = value
  }
  return result as T
}

function tripFromRow(row: Record<string, unknown>): Trip {
  return toCamel(row) as unknown as Trip
}

export const tripsApi = {
  /**
   * GET /api/trips – list trips with optional filters and pagination
   */
  async getTrips(params: GetTripsParams = {}): Promise<GetTripsResponse> {
    const { data } = await httpInterceptedService.get(TRIPS_PATH, { params })
    return {
      total: data.total,
      limit: data.limit,
      offset: data.offset,
      trips: (data.trips ?? []).map((t: Record<string, unknown>) => tripFromRow(t)),
    }
  },

  /**
   * POST /api/trips – create a new trip
   */
  async createTrip(payload: CreateTripPayload): Promise<Trip> {
    const { data } = await httpInterceptedService.post(TRIPS_PATH, payload)
    const trip = data.trip ?? data
    return tripFromRow(trip)
  },

  /**
   * PATCH /api/trips/:bookingId – update trip status
   */
  async updateTripStatus(bookingId: string, payload: UpdateTripStatusPayload): Promise<Trip> {
    const { data } = await httpInterceptedService.patch(`${TRIPS_PATH}/${bookingId}`, payload)
    const trip = data.trip ?? data
    return tripFromRow(trip)
  },

  /**
   * DELETE /api/trips/:bookingId – delete a trip
   */
  async deleteTrip(bookingId: string): Promise<void> {
    await httpInterceptedService.delete(`${TRIPS_PATH}/${bookingId}`)
  },
}
