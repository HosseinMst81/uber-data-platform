import axios, { type AxiosError } from 'axios'

const baseURL =
  typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL
    ? String(import.meta.env.VITE_API_BASE_URL).replace(/\/$/, '')
    : 'http://localhost:5000'

const commonConfig = {
  baseURL,
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
  },
}

/**
 * Base axios instance – no interceptors.
 * Use for one-off or custom requests that don't need auth/error handling.
 */
export const httpService = axios.create(commonConfig)

/**
 * Axios instance with request/response interceptors.
 * Use this for app API calls (auth token, normalized errors).
 */
export const httpInterceptedService = axios.create(commonConfig)

// --- Request interceptor: e.g. attach auth token
httpInterceptedService.interceptors.request.use(
  (config) => {
    const token =
      typeof window !== 'undefined' && window.localStorage
        ? window.localStorage.getItem('auth_token')
        : null
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// --- Response interceptor: normalize errors, optional 401 handling
httpInterceptedService.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; error?: string }>) => {
    const status = error.response?.status
    const serverMessage =
      error.response?.data?.message ?? error.response?.data?.error

    if (status === 401) {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem('auth_token')
      }
      // Optional: redirect to login or emit event
      // window.location.href = '/login'
    }

    const message =
      serverMessage ?? error.message ?? 'An unexpected error occurred'
    const normalizedError = new Error(message) as Error & {
      status?: number
      response?: typeof error.response
    }
    normalizedError.status = status
    normalizedError.response = error.response
    return Promise.reject(normalizedError)
  }
)
