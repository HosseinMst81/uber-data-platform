/**
 * API service for Uber Trip Data Platform.
 * Base URL: http://localhost:3000/api/trips
 * Transforms snake_case responses to camelCase for the app.
 */

import axios from 'axios'
import type {
  Trip,
  GetTripsParams,
  GetTripsResponse,
  CreateTripPayload,
  UpdateTripStatusPayload,
} from './types'

const API_BASE = 'http://localhost:3000/api/trips'

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
    const { data } = await axios.get(API_BASE, { params })
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
    const { data } = await axios.post(API_BASE, payload)
    const trip = data.trip ?? data
    return tripFromRow(trip)
  },

  /**
   * PATCH /api/trips/:bookingId – update trip status
   */
  async updateTripStatus(bookingId: string, payload: UpdateTripStatusPayload): Promise<Trip> {
    const { data } = await axios.patch(`${API_BASE}/${bookingId}`, payload)
    const trip = data.trip ?? data
    return tripFromRow(trip)
  },

  /**
   * DELETE /api/trips/:bookingId – delete a trip
   */
  async deleteTrip(bookingId: string): Promise<void> {
    await axios.delete(`${API_BASE}/${bookingId}`)
  },
}
