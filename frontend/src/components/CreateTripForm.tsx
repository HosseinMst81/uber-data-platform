import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { tripsApi } from '@/lib/api'
import type { CreateTripPayload } from '@/lib/types'
import { useState } from 'react'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'

const VEHICLE_OPTIONS = ['Sedan', 'Auto', 'eBike', 'Bike', 'Moto', 'Mini', 'XL', 'Go']
const PAYMENT_OPTIONS = ['Credit Card', 'UPI', 'Debit Card', 'Cash', 'Wallet', 'Paytm']

const schema = z.object({
  date: z.string().min(1, 'Date is required'),
  time: z.string().regex(/^\d{2}:\d{2}:\d{2}$/, 'Time must be HH:MM:SS'),
  customer_id: z.string().min(1, 'Customer ID is required'),
  vehicle_type: z.string().min(1, 'Vehicle type is required'),
  booking_value: z.coerce.number().min(0, 'Must be ≥ 0'),
  ride_distance: z.coerce.number().min(0, 'Must be ≥ 0'),
  payment_method: z.string().min(1, 'Payment method is required'),
  driver_rating: z.union([z.coerce.number().min(0).max(5), z.literal('')]).optional(),
  customer_rating: z.union([z.coerce.number().min(0).max(5), z.literal('')]).optional(),
})

type FormValues = z.infer<typeof schema>

function toTimeString(h: number, m: number): string {
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`
}

export interface CreateTripFormProps {
  onCreated: () => void
}

const defaultDate = format(new Date(), 'yyyy-MM-dd')
const now = new Date()
const defaultTime = toTimeString(now.getHours(), now.getMinutes())

export function CreateTripForm({ onCreated }: CreateTripFormProps) {
  const [open, setOpen] = useState(false)
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as import('react-hook-form').Resolver<FormValues>,
    defaultValues: {
      date: defaultDate,
      time: defaultTime,
      customer_id: '',
      vehicle_type: '',
      booking_value: 0,
      ride_distance: 0,
      payment_method: '',
      driver_rating: '',
      customer_rating: '',
    },
  })

  const vehicleType = watch('vehicle_type')
  const paymentMethod = watch('payment_method')

  const onSubmit = async (data: FormValues) => {
    const payload: CreateTripPayload = {
      date: data.date,
      time: data.time,
      customer_id: data.customer_id,
      vehicle_type: data.vehicle_type,
      booking_value: Number(data.booking_value),
      ride_distance: Number(data.ride_distance),
      payment_method: data.payment_method,
    }
    if (data.driver_rating !== '' && data.driver_rating !== undefined) {
      payload.driver_rating = Number(data.driver_rating)
    }
    if (data.customer_rating !== '' && data.customer_rating !== undefined) {
      payload.customer_rating = Number(data.customer_rating)
    }
    try {
      await tripsApi.createTrip(payload)
      toast.success('Trip created')
      reset({
        date: format(new Date(), 'yyyy-MM-dd'),
        time: toTimeString(new Date().getHours(), new Date().getMinutes()),
        customer_id: '',
        vehicle_type: '',
        booking_value: 0,
        ride_distance: 0,
        payment_method: '',
        driver_rating: '',
        customer_rating: '',
      })
      setOpen(false)
      onCreated()
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { error?: string } } }).response?.data?.error
          : 'Failed to create trip'
      toast.error(String(msg))
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          Create trip
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create new trip</DialogTitle>
          <DialogDescription>
            Add a new trip. Date and time are required; ratings are optional (0–5).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit((data) => onSubmit(data as FormValues))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" {...register('date')} />
              {errors.date && (
                <p className="text-xs text-destructive">{errors.date.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Time (HH:MM:SS)</Label>
              <Input
                type="time"
                step={1}
                {...register('time', {
                  setValueAs: (v: string) =>
                    v ? (v.length === 5 ? `${v}:00` : v.slice(0, 8)) : '',
                })}
              />
              {errors.time && (
                <p className="text-xs text-destructive">{errors.time.message}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Customer ID</Label>
            <Input placeholder="e.g. CID123456" {...register('customer_id')} />
            {errors.customer_id && (
              <p className="text-xs text-destructive">{errors.customer_id.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Vehicle type</Label>
            <Select
              value={vehicleType}
              onValueChange={(v) => setValue('vehicle_type', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {VEHICLE_OPTIONS.map((o) => (
                  <SelectItem key={o} value={o}>
                    {o}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.vehicle_type && (
              <p className="text-xs text-destructive">{errors.vehicle_type.message}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Booking value</Label>
              <Input type="number" step={0.01} min={0} {...register('booking_value')} />
              {errors.booking_value && (
                <p className="text-xs text-destructive">{errors.booking_value.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Ride distance (km)</Label>
              <Input type="number" step={0.1} min={0} {...register('ride_distance')} />
              {errors.ride_distance && (
                <p className="text-xs text-destructive">{errors.ride_distance.message}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Payment method</Label>
            <Select
              value={paymentMethod}
              onValueChange={(v) => setValue('payment_method', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_OPTIONS.map((o) => (
                  <SelectItem key={o} value={o}>
                    {o}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.payment_method && (
              <p className="text-xs text-destructive">{errors.payment_method.message}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Driver rating (0–5, optional)</Label>
              <Input
                type="number"
                step={0.1}
                min={0}
                max={5}
                placeholder="Optional"
                {...register('driver_rating')}
              />
              {errors.driver_rating && (
                <p className="text-xs text-destructive">{errors.driver_rating.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Customer rating (0–5, optional)</Label>
              <Input
                type="number"
                step={0.1}
                min={0}
                max={5}
                placeholder="Optional"
                {...register('customer_rating')}
              />
              {errors.customer_rating && (
                <p className="text-xs text-destructive">{errors.customer_rating.message}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating…' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

