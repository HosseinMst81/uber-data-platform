import type { AnalyticsFilters } from '@/lib/analytics-types'
import { analyticsApi } from '@/lib/api'
import { useQuery } from '@tanstack/react-query'


const analyticsKeys = {
  all: ['analytics'] as const,
  kpis: (filters: AnalyticsFilters) => [...analyticsKeys.all, 'kpis', filters] as const,
  cancellations: (filters: AnalyticsFilters) => [...analyticsKeys.all, 'cancellations', filters] as const,
  payments: (filters: AnalyticsFilters) => [...analyticsKeys.all, 'payments', filters] as const,
  vehicles: (filters: AnalyticsFilters) => [...analyticsKeys.all, 'vehicles', filters] as const,
  peakHours: (filters: AnalyticsFilters) => [...analyticsKeys.all, 'peak-hours', filters] as const,
  weekdays: (filters: AnalyticsFilters) => [...analyticsKeys.all, 'weekdays', filters] as const,
  vehicleTypes: () => [...analyticsKeys.all, 'vehicle-types'] as const,
}


export function useKPIs(filters: AnalyticsFilters = {}) {
  return useQuery({
    queryKey: analyticsKeys.kpis(filters),
    queryFn: () => analyticsApi.getKPIs(filters),
  })
}


export function useCancellationReasons(filters: AnalyticsFilters = {}) {
  return useQuery({
    queryKey: analyticsKeys.cancellations(filters),
    queryFn: () => analyticsApi.getCancellationReasons(filters),
  })
}


export function usePaymentMethods(filters: AnalyticsFilters = {}) {
  return useQuery({
    queryKey: analyticsKeys.payments(filters),
    queryFn: () => analyticsApi.getPaymentMethods(filters),
  })
}


export function useVehicleAnalysis(filters: AnalyticsFilters = {}) {
  return useQuery({
    queryKey: analyticsKeys.vehicles(filters),
    queryFn: () => analyticsApi.getVehicleAnalysis(filters),
  })
}


export function usePeakHours(filters: AnalyticsFilters = {}) {
  return useQuery({
    queryKey: analyticsKeys.peakHours(filters),
    queryFn: () => analyticsApi.getPeakHours(filters),
  })
}


export function useWeekdayAnalysis(filters: AnalyticsFilters = {}) {
  return useQuery({
    queryKey: analyticsKeys.weekdays(filters),
    queryFn: () => analyticsApi.getWeekdayAnalysis(filters),
  })
}

export function useVehicleTypes() {
  return useQuery({
    queryKey: analyticsKeys.vehicleTypes(),
    queryFn: () => analyticsApi.getVehicleTypes(),
  })
}