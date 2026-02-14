import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query'
import { tripsApi } from '@/lib/api'
import { tripsKeys } from '@/lib/query-keys'
import type {
  GetTripsParams,
  CreateTripPayload,
  UpdateTripStatusPayload,
  Trip,
} from '@/lib/types'

// ---------------------------------------------------------------------------
// List trips
// ---------------------------------------------------------------------------

export function useTrips(
  params: GetTripsParams = {},
  options?: Omit<
    UseQueryOptions<Awaited<ReturnType<typeof tripsApi.getTrips>>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: tripsKeys.list(params),
    queryFn: () => tripsApi.getTrips(params),
    ...options,
  })
}

// ---------------------------------------------------------------------------
// Create trip
// ---------------------------------------------------------------------------

export function useCreateTrip(
  options?: UseMutationOptions<Trip, Error, CreateTripPayload>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateTripPayload) => tripsApi.createTrip(payload),
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: tripsKeys.lists() })
      options?.onSuccess?.(data, variables, onMutateResult, context)
    },
    ...options,
  })
}

// ---------------------------------------------------------------------------
// Update trip status
// ---------------------------------------------------------------------------

export type UpdateTripStatusVariables = {
  bookingId: string
  payload: UpdateTripStatusPayload
}

export function useUpdateTripStatus(
  options?: UseMutationOptions<Trip, Error, UpdateTripStatusVariables>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ bookingId, payload }: UpdateTripStatusVariables) =>
      tripsApi.updateTripStatus(bookingId, payload),
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: tripsKeys.lists() })
      options?.onSuccess?.(data, variables, onMutateResult, context)
    },
    ...options,
  })
}

// ---------------------------------------------------------------------------
// Delete trip
// ---------------------------------------------------------------------------

export function useDeleteTrip(
  options?: UseMutationOptions<void, Error, string>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (bookingId: string) => tripsApi.deleteTrip(bookingId),
    onSuccess: (data, bookingId, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: tripsKeys.lists() })
      options?.onSuccess?.(data, bookingId, onMutateResult, context)
    },
    ...options,
  })
}
