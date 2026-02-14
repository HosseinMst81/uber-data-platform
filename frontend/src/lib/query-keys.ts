import type { GetTripsParams } from './types'

/**
 * Centralized query keys for React Query.
 * Use these in hooks and when invalidating caches.
 */
export const tripsKeys = {
  all: ['trips'] as const,
  lists: () => [...tripsKeys.all, 'list'] as const,
  list: (params?: GetTripsParams) => [...tripsKeys.lists(), params ?? {}] as const,
}
