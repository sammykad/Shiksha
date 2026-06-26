'use client'

import { useState, useTransition, useRef } from 'react'
import Image from 'next/image'
import { Bus, Users, Truck, Plus, MoreHorizontal, Pencil, Power, PowerOff, CalendarIcon, MapPin, Trash2, Route as RouteIcon, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { PageHeader } from '@/components/ui/page-header'
import {
  StopLocationPicker,
  type StopLocationValue,
} from '@/components/dashboard/transport/stop-location-picker'
import { getInitials } from '@/lib/utils'
import { format } from 'date-fns'
import { VehicleType } from '@/generated/prisma/enums'
import { useUploadFile } from '@/hooks/use-upload-file'

import {
  getDrivers, createDriver, updateDriver, toggleDriverStatus,
  getVehicles, createVehicle, updateVehicle, toggleVehicleStatus,
  getHelpers, createHelper, updateHelper, toggleHelperStatus,
  getRoutes, createRoute, updateRoute, toggleRouteStatus,
  createStop, deleteStop,
} from '@/lib/data/transport'

type Driver = Awaited<ReturnType<typeof getDrivers>>[number]
type Vehicle = Awaited<ReturnType<typeof getVehicles>>[number]
type Helper = Awaited<ReturnType<typeof getHelpers>>[number]
type Route = Awaited<ReturnType<typeof getRoutes>>[number]
type Stop = Route['stops'][number]

const phoneRegex = /^[6-9]\d{9}$/

const driverSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().regex(phoneRegex, 'Enter a valid 10-digit mobile number'),
  alternatePhone: z.string().regex(phoneRegex, 'Enter a valid 10-digit mobile number').or(z.literal('')).optional(),
  licenseNumber: z.string().min(1, 'License number is required'),
  licenseExpiry: z.date().optional(),
})

const VEHICLE_TYPE_LABELS: Record<string, string> = {
  BUS: 'Bus', VAN: 'Van', MINI_BUS: 'Mini Bus', AUTO: 'Auto', TEMPO: 'Tempo', OTHER: 'Other',
}

const vehicleSchema = z.object({
  registrationNo: z.string().min(1, 'Registration number is required'),
  type: z.nativeEnum(VehicleType, { required_error: 'Type is required' }),
  capacity: z.coerce.number().int().positive('Capacity must be positive'),
})

const helperSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().regex(phoneRegex, 'Enter a valid 10-digit mobile number'),
  alternatePhone: z.string().regex(phoneRegex, 'Enter a valid 10-digit mobile number').or(z.literal('')).optional(),
})

const routeSchema = z.object({
  from: z.string().min(1, 'Origin is required'),
  to: z.string().min(1, 'Destination is required'),
  code: z.string().min(1, 'Route code is required'),
  vehicleId: z.string().optional(),
  driverId: z.string().optional(),
  helperId: z.string().optional(),
})

function DriverDialog({ driver, onClose }: { driver?: Driver; onClose: () => void }) {
  const [open, setOpen] = useState(true)
  const [isPending, startTransition] = useTransition()
  const { onUpload, isUploading } = useUploadFile('imageUploader')
  const [photoUrl, setPhotoUrl] = useState(driver?.photoUrl ?? '')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const form = useForm<z.infer<typeof driverSchema>>({
    resolver: zodResolver(driverSchema),
    defaultValues: driver ? {
      name: driver.name,
      phone: driver.phone,
      alternatePhone: driver.alternatePhone ?? '',
      licenseNumber: driver.licenseNumber,
      licenseExpiry: driver.licenseExpiry ? new Date(driver.licenseExpiry) : undefined,
    } : {
      name: '', phone: '', alternatePhone: '', licenseNumber: '', licenseExpiry: undefined,
    },
  })

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const res = await onUpload([file])
      if (res?.[0]?.url) setPhotoUrl(res[0].url)
    } catch { toast.error('Photo upload failed') }
    finally { setUploading(false) }
  }

  const onSubmit = (data: z.infer<typeof driverSchema>) => {
    startTransition(async () => {
      try {
        const payload = {
          ...data,
          photoUrl: photoUrl || undefined,
          licenseExpiry: data.licenseExpiry ? data.licenseExpiry.toISOString().split('T')[0] : undefined,
        }
        if (driver) {
          await updateDriver(driver.id, { ...payload, isActive: driver.isActive })
          toast.success('Driver updated')
        } else {
          await createDriver(payload)
          toast.success('Driver added')
        }
        setOpen(false); onClose()
      } catch { toast.error('Something went wrong') }
    })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) onClose() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{driver ? 'Edit Driver' : 'Add Driver'}</DialogTitle>
          <DialogDescription>{driver ? 'Update driver details' : 'Enter driver details'}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2.5">
              <FormLabel>Photo</FormLabel>
              <div className="flex items-center gap-3">
                {(photoUrl) ? (
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border">
                    <Image src={photoUrl} alt="" fill className="object-cover" />
                  </div>
                ) : (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-muted border text-muted-foreground">
                    <Upload className="h-5 w-5" />
                  </div>
                )}
                <div className="flex-1">
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                  <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                    {uploading || isUploading ? 'Uploading...' : photoUrl ? 'Change Photo' : 'Upload Photo'}
                  </Button>
                  {photoUrl && (
                    <Button type="button" variant="ghost" size="sm" className="ml-2 text-destructive" onClick={() => setPhotoUrl('')}>
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="Ramesh Sharma" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem><FormLabel>Phone</FormLabel><FormControl><Input placeholder="9876543210" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="alternatePhone" render={({ field }) => (
                <FormItem><FormLabel>Alternate Phone</FormLabel><FormControl><Input placeholder="9876543210" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="licenseNumber" render={({ field }) => (
                <FormItem><FormLabel>License Number</FormLabel><FormControl><Input placeholder="MH12 20240012345" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="licenseExpiry" render={({ field }) => (
                <FormItem>
                  <FormLabel>License Expiry</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                          {field.value ? format(field.value, 'dd MMM yyyy') : 'Pick a date'}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => { setOpen(false); onClose() }}>Cancel</Button>
              <Button type="submit" disabled={isPending || uploading || isUploading}>{isPending ? 'Saving...' : 'Save'}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

function VehicleDialog({ vehicle, onClose }: { vehicle?: Vehicle; onClose: () => void }) {
  const [open, setOpen] = useState(true)
  const [isPending, startTransition] = useTransition()
  const form = useForm<z.infer<typeof vehicleSchema>>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: vehicle ? {
      registrationNo: vehicle.registrationNo,
      type: vehicle.type,
      capacity: vehicle.capacity,
    } : {
      registrationNo: '', type: undefined, capacity: 0,
    },
  })

  const onSubmit = (data: z.infer<typeof vehicleSchema>) => {
    startTransition(async () => {
      try {
        if (vehicle) {
          await updateVehicle(vehicle.id, { ...data, isActive: vehicle.isActive })
          toast.success('Vehicle updated')
        } else {
          await createVehicle(data)
          toast.success('Vehicle added')
        }
        setOpen(false); onClose()
      } catch { toast.error('Something went wrong') }
    })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) onClose() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{vehicle ? 'Edit Vehicle' : 'Add Vehicle'}</DialogTitle>
          <DialogDescription>{vehicle ? 'Update vehicle details' : 'Enter vehicle details'}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="registrationNo" render={({ field }) => (
                <FormItem><FormLabel>Registration No.</FormLabel><FormControl><Input placeholder="MH12AB1234" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="type" render={({ field }) => (
                <FormItem><FormLabel>Type</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        {(Object.keys(VehicleType) as Array<keyof typeof VehicleType>).map((key) => (
                          <SelectItem key={VehicleType[key]} value={VehicleType[key]}>
                            {VEHICLE_TYPE_LABELS[VehicleType[key]]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl><FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="capacity" render={({ field }) => (
              <FormItem><FormLabel>Capacity (seats)</FormLabel><FormControl><Input type="number" min={1} placeholder="e.g. 40" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => { setOpen(false); onClose() }}>Cancel</Button>
              <Button type="submit" disabled={isPending}>{isPending ? 'Saving...' : 'Save'}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

function HelperDialog({ helper, onClose }: { helper?: Helper; onClose: () => void }) {
  const [open, setOpen] = useState(true)
  const [isPending, startTransition] = useTransition()
  const { onUpload, isUploading } = useUploadFile('imageUploader')
  const [photoUrl, setPhotoUrl] = useState(helper?.photoUrl ?? '')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const form = useForm<z.infer<typeof helperSchema>>({
    resolver: zodResolver(helperSchema),
    defaultValues: helper ? {
      name: helper.name,
      phone: helper.phone,
      alternatePhone: helper.alternatePhone ?? '',
    } : {
      name: '', phone: '', alternatePhone: '',
    },
  })

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const res = await onUpload([file])
      if (res?.[0]?.url) setPhotoUrl(res[0].url)
    } catch { toast.error('Photo upload failed') }
    finally { setUploading(false) }
  }

  const onSubmit = (data: z.infer<typeof helperSchema>) => {
    startTransition(async () => {
      try {
        const payload = { ...data, photoUrl: photoUrl || undefined }
        if (helper) {
          await updateHelper(helper.id, { ...payload, isActive: helper.isActive })
          toast.success('Helper updated')
        } else {
          await createHelper(payload)
          toast.success('Helper added')
        }
        setOpen(false); onClose()
      } catch { toast.error('Something went wrong') }
    })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) onClose() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{helper ? 'Edit Helper' : 'Add Helper'}</DialogTitle>
          <DialogDescription>{helper ? 'Update helper details' : 'Enter helper (bhaiya/kaku) details'}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <FormLabel>Photo</FormLabel>
              <div className="flex items-center gap-3">
                {(photoUrl) ? (
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border">
                    <Image src={photoUrl} alt="" fill className="object-cover" />
                  </div>
                ) : (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-muted border text-muted-foreground">
                    <Upload className="h-5 w-5" />
                  </div>
                )}
                <div className="flex-1">
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                  <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                    {uploading || isUploading ? 'Uploading...' : photoUrl ? 'Change Photo' : 'Upload Photo'}
                  </Button>
                  {photoUrl && (
                    <Button type="button" variant="ghost" size="sm" className="ml-2 text-destructive" onClick={() => setPhotoUrl('')}>
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="Suresh Patil" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem><FormLabel>Phone</FormLabel><FormControl><Input placeholder="9876543210" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="alternatePhone" render={({ field }) => (
                <FormItem><FormLabel>Alternate Phone</FormLabel><FormControl><Input placeholder="9876543210" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => { setOpen(false); onClose() }}>Cancel</Button>
              <Button type="submit" disabled={isPending || uploading || isUploading}>{isPending ? 'Saving...' : 'Save'}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

function RouteDialog({
  route, drivers, vehicles, helpers, onClose,
}: {
  route?: Route; drivers: Driver[]; vehicles: Vehicle[]; helpers: Helper[]; onClose: () => void
}) {
  const [open, setOpen] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [routeStops, setRouteStops] = useState<Stop[]>(route?.stops ?? [])
  const [adding, setAdding] = useState(false)
  const [stopName, setStopName] = useState('')
  const [stopLandmark, setStopLandmark] = useState('')
  const [stopPickupTime, setStopPickupTime] = useState('')
  const [stopLocation, setStopLocation] = useState<StopLocationValue | null>(null)

  const splitName = (n: string) => {
    const sep = n.includes(' → ') ? n.split(' → ') : [n, '']
    return { from: sep[0], to: sep[1] ?? '' }
  }

  const form = useForm<z.infer<typeof routeSchema>>({
    resolver: zodResolver(routeSchema),
    defaultValues: route ? {
      ...splitName(route.name),
      code: route.code,
      vehicleId: route.vehicleId ?? 'none',
      driverId: route.driverId ?? 'none',
      helperId: route.helperId ?? 'none',
    } : {
      from: '', to: '', code: '', vehicleId: 'none', driverId: 'none', helperId: 'none',
    },
  })

  const onSubmit = (data: z.infer<typeof routeSchema>) => {
    startTransition(async () => {
      try {
        const payload = {
          name: `${data.from} → ${data.to}`,
          code: data.code,
          vehicleId: data.vehicleId && data.vehicleId !== 'none' ? data.vehicleId : undefined,
          driverId: data.driverId && data.driverId !== 'none' ? data.driverId : undefined,
          helperId: data.helperId && data.helperId !== 'none' ? data.helperId : undefined,
        }
        if (route) {
          await updateRoute(route.id, { ...payload, isActive: route.isActive })
          toast.success('Route updated')
        } else {
          await createRoute(payload)
          toast.success('Route added')
        }
        setOpen(false); onClose()
      } catch { toast.error('Something went wrong') }
    })
  }

  const addStop = () => {
    if (!stopName.trim() || !route) return
    const nextOrder = routeStops.length > 0 ? Math.max(...routeStops.map(s => s.order)) + 1 : 1
    startTransition(async () => {
      try {
        await createStop(route.id, {
          name: stopName.trim(),
          order: nextOrder,
          landmark: stopLandmark.trim() || undefined,
          pickupTime: stopPickupTime || undefined,
          latitude: stopLocation?.latitude,
          longitude: stopLocation?.longitude,
          locationSource: stopLocation?.source,
          locationAccuracyMeters: stopLocation?.accuracyMeters,
        })
        setRouteStops([...routeStops, {
          id: `temp-${Date.now()}`, routeId: route.id, name: stopName.trim(), order: nextOrder,
          landmark: stopLandmark.trim() || null, pickupTime: stopPickupTime || null,
          latitude: stopLocation?.latitude ?? null,
          longitude: stopLocation?.longitude ?? null,
          locationSource: stopLocation?.source ?? null,
          locationAccuracyMeters: stopLocation?.accuracyMeters ?? null,
        }])
        setStopName(''); setStopLandmark(''); setStopPickupTime(''); setStopLocation(null); setAdding(false)
        toast.success('Stop added')
      } catch { toast.error('Failed to add stop') }
    })
  }

  const removeStop = (stopId: string) => {
    startTransition(async () => {
      try {
        await deleteStop(stopId)
        setRouteStops(routeStops.filter(s => s.id !== stopId))
        toast.success('Stop removed')
      } catch { toast.error('Failed to remove stop') }
    })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) onClose() }}>
      <DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] max-w-xl overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle>{route ? 'Edit Route' : 'Add Route'}</DialogTitle>
          <DialogDescription>{route ? 'Update route details and stops' : 'Enter route details and stops'}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="from" render={({ field }) => (
                <FormItem><FormLabel>From</FormLabel><FormControl><Input placeholder="e.g. Kothrud Depot" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="to" render={({ field }) => (
                <FormItem><FormLabel>To</FormLabel><FormControl><Input placeholder="e.g. Shiksha School" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <div className="grid grid-cols-1 gap-4">
              <FormField control={form.control} name="code" render={({ field }) => (
                <FormItem><FormLabel>Route Code</FormLabel><FormControl><Input placeholder="e.g. ROUTE-01" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <FormField control={form.control} name="vehicleId" render={({ field }) => {
              const selected = vehicles.find(v => v.id === field.value)
              return (
                <FormItem><FormLabel>Vehicle</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        {selected ? (
                          <div className="flex items-center gap-2">
                            <Bus className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span>{selected.registrationNo}</span>
                          </div>
                        ) : <span className="text-muted-foreground">Select vehicle</span>}
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {vehicles.filter(v => v.isActive).map(v => (
                        <SelectItem key={v.id} value={v.id}>
                          <div className="flex items-center gap-2">
                            <Bus className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span>{v.registrationNo}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )
            }} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="driverId" render={({ field }) => {
                const selected = drivers.find(d => d.id === field.value)
                return (
                  <FormItem><FormLabel>Driver</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          {selected ? (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={selected.photoUrl ?? undefined} />
                                <AvatarFallback className="text-[10px]">{getInitials(selected.name)}</AvatarFallback>
                              </Avatar>
                              <span>{selected.name}</span>
                            </div>
                          ) : <span className="text-muted-foreground">Select driver</span>}
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {drivers.filter(d => d.isActive).map(d => (
                          <SelectItem key={d.id} value={d.id}>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={d.photoUrl ?? undefined} />
                                <AvatarFallback className="text-[10px]">{getInitials(d.name)}</AvatarFallback>
                              </Avatar>
                              <span>{d.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select><FormMessage />
                  </FormItem>
                )
              }} />
              <FormField control={form.control} name="helperId" render={({ field }) => {
                const selected = helpers.find(h => h.id === field.value)
                return (
                  <FormItem><FormLabel>Helper</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          {selected ? (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={selected.photoUrl ?? undefined} />
                                <AvatarFallback className="text-[10px]">{getInitials(selected.name)}</AvatarFallback>
                              </Avatar>
                              <span>{selected.name}</span>
                            </div>
                          ) : <span className="text-muted-foreground">Select helper</span>}
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {helpers.filter(h => h.isActive).map(h => (
                          <SelectItem key={h.id} value={h.id}>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={h.photoUrl ?? undefined} />
                                <AvatarFallback className="text-[10px]">{getInitials(h.name)}</AvatarFallback>
                              </Avatar>
                              <span>{h.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select><FormMessage />
                  </FormItem>
                )
              }} />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => { setOpen(false); onClose() }}>Cancel</Button>
              <Button type="submit" disabled={isPending}>{isPending ? 'Saving...' : 'Save Route'}</Button>
            </div>
          </form>
        </Form>

        {route && (
          <div className="border-t pt-4 mt-2">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" />Stops ({routeStops.length})</h4>
            </div>
            {routeStops.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-3">No stops added yet</p>
            )}
            <div className="space-y-2">
              {routeStops.map((s, i) => (
                <div key={s.id} className="group flex min-w-0 items-start gap-3 rounded-lg border bg-background p-3 shadow-sm transition-colors hover:border-primary/25 hover:bg-muted/20 sm:gap-3.5">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary ring-1 ring-primary/10">
                    {i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="break-words text-sm font-semibold leading-5 text-foreground">{s.name}</div>
                        {s.landmark && (
                          <div className="mt-1 break-words text-xs leading-5 text-muted-foreground">
                            {s.landmark}
                          </div>
                        )}
                      </div>
                      {s.pickupTime && (
                        <span className="w-fit shrink-0 rounded-md border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-semibold leading-none text-primary">
                          Pickup: {s.pickupTime}
                        </span>
                      )}
                    </div>
                    {s.latitude && s.longitude && (
                      <div className="mt-2 flex min-w-0 items-center gap-1.5 text-[11px] leading-none text-muted-foreground">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="max-w-full truncate font-mono">
                          {s.latitude.toFixed(4)}, {s.longitude.toFixed(4)}
                        </span>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => removeStop(s.id)}
                    disabled={isPending}
                    aria-label={`Delete ${s.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            {adding ? (
              <div className="mt-3 flex min-w-0 flex-col gap-3 overflow-hidden rounded-lg border p-3">
                <StopLocationPicker
                  value={stopLocation}
                  onChange={(location) => {
                    setStopLocation(location)
                    if (!stopName.trim() && location.label) setStopName(location.label)
                    if (!stopLandmark.trim() && location.address) setStopLandmark(location.address)
                  }}
                />
                <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_7.5rem]">
                  <Input className="min-w-0" placeholder="Stop name (e.g. Gandhi Chowk)" value={stopName} onChange={(e) => setStopName(e.target.value)} />
                  <Input className="min-w-0" placeholder="Pickup time" value={stopPickupTime} onChange={(e) => setStopPickupTime(e.target.value)} />
                </div>
                <Input className="min-w-0" placeholder="Landmark (optional)" value={stopLandmark} onChange={(e) => setStopLandmark(e.target.value)} />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => { setAdding(false); setStopName(''); setStopLandmark(''); setStopPickupTime(''); setStopLocation(null) }}>Cancel</Button>
                  <Button size="sm" onClick={addStop} disabled={isPending || !stopName.trim()}>Add Stop</Button>
                </div>
              </div>
            ) : (
              <Button variant="outline" size="sm" className="mt-3 w-full border-dashed" onClick={() => setAdding(true)}>
                <Plus className="mr-2 h-4 w-4" />Add Stop
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default function TransportManagement({
  initialDrivers,
  initialVehicles,
  initialHelpers,
  initialRoutes,
}: {
  initialDrivers: Driver[]
  initialVehicles: Vehicle[]
  initialHelpers: Helper[]
  initialRoutes: Route[]
}) {
  const [drivers, setDrivers] = useState(initialDrivers)
  const [vehicles, setVehicles] = useState(initialVehicles)
  const [helpers, setHelpers] = useState(initialHelpers)
  const [routes, setRoutes] = useState(initialRoutes)
  const [editingDriver, setEditingDriver] = useState<Driver | undefined>()
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | undefined>()
  const [editingHelper, setEditingHelper] = useState<Helper | undefined>()
  const [editingRoute, setEditingRoute] = useState<Route | undefined>()
  const [showDriverDialog, setShowDriverDialog] = useState(false)
  const [showVehicleDialog, setShowVehicleDialog] = useState(false)
  const [showHelperDialog, setShowHelperDialog] = useState(false)
  const [showRouteDialog, setShowRouteDialog] = useState(false)
  const [activeTab, setActiveTab] = useState('drivers')
  const [, startTransition] = useTransition()

  const refresh = async () => {
    setDrivers(await getDrivers())
    setVehicles(await getVehicles())
    setHelpers(await getHelpers())
    setRoutes(await getRoutes())
  }

  return (
    <div className="space-y-4 px-2">
      <PageHeader
        title="Transport Management"
        description="Manage drivers, vehicles, helpers, and routes"
        icon={Bus}
        actions={
          activeTab === 'drivers' ? (
            <Button size="sm" onClick={() => { setEditingDriver(undefined); setShowDriverDialog(true) }}>
              <Plus className="mr-2 h-4 w-4" />Add Driver
            </Button>
          ) : activeTab === 'vehicles' ? (
            <Button size="sm" onClick={() => { setEditingVehicle(undefined); setShowVehicleDialog(true) }}>
              <Plus className="mr-2 h-4 w-4" />Add Vehicle
            </Button>
          ) : activeTab === 'helpers' ? (
            <Button size="sm" onClick={() => { setEditingHelper(undefined); setShowHelperDialog(true) }}>
              <Plus className="mr-2 h-4 w-4" />Add Helper
            </Button>
          ) : (
            <Button size="sm" onClick={() => { setEditingRoute(undefined); setShowRouteDialog(true) }}>
              <Plus className="mr-2 h-4 w-4" />Add Route
            </Button>
          )
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="drivers"><Users className="mr-2 h-4 w-4" />Drivers</TabsTrigger>
          <TabsTrigger value="vehicles"><Truck className="mr-2 h-4 w-4" />Vehicles</TabsTrigger>
          <TabsTrigger value="helpers"><Users className="mr-2 h-4 w-4" />Helpers</TabsTrigger>
          <TabsTrigger value="routes"><RouteIcon className="mr-2 h-4 w-4" />Routes</TabsTrigger>
        </TabsList>

        <TabsContent value="drivers" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Driver</TableHead>
                      <TableHead>License</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-12" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {drivers.length === 0 ? (
                      <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No drivers added yet</TableCell></TableRow>
                    ) : drivers.map((d) => (
                      <TableRow key={d.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={d.photoUrl ?? undefined} alt="" />
                              <AvatarFallback className="text-xs">{getInitials(d.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-sm truncate">{d.name}</div>
                              <div className="text-xs text-muted-foreground">{d.phone}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{d.licenseNumber}</div>
                          {d.licenseExpiry && <div className="text-xs text-muted-foreground">Exp: {d.licenseExpiry.toLocaleDateString()}</div>}
                        </TableCell>
                        <TableCell>
                          <Badge variant={d.isActive ? 'default' : 'secondary'}>{d.isActive ? 'Active' : 'Inactive'}</Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => { setEditingDriver(d); setShowDriverDialog(true) }}>
                                <Pencil className="mr-2 h-3.5 w-3.5" />Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                startTransition(async () => {
                                  await toggleDriverStatus(d.id, !d.isActive)
                                  toast.success(d.isActive ? 'Driver deactivated' : 'Driver activated')
                                  refresh()
                                })
                              }}>
                                {d.isActive ? <PowerOff className="mr-2 h-3.5 w-3.5" /> : <Power className="mr-2 h-3.5 w-3.5" />}
                                {d.isActive ? 'Deactivate' : 'Activate'}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vehicles" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Registration No.</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-12" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vehicles.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No vehicles added yet</TableCell></TableRow>
                    ) : vehicles.map((v) => (
                      <TableRow key={v.id}>
                        <TableCell className="font-medium">{v.registrationNo}</TableCell>
                        <TableCell>{v.type}</TableCell>
                        <TableCell>{v.capacity} seats</TableCell>
                        <TableCell>
                          <Badge variant={v.isActive ? 'default' : 'secondary'}>{v.isActive ? 'Active' : 'Inactive'}</Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => { setEditingVehicle(v); setShowVehicleDialog(true) }}>
                                <Pencil className="mr-2 h-3.5 w-3.5" />Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                startTransition(async () => {
                                  await toggleVehicleStatus(v.id, !v.isActive)
                                  toast.success(v.isActive ? 'Vehicle deactivated' : 'Vehicle activated')
                                  refresh()
                                })
                              }}>
                                {v.isActive ? <PowerOff className="mr-2 h-3.5 w-3.5" /> : <Power className="mr-2 h-3.5 w-3.5" />}
                                {v.isActive ? 'Deactivate' : 'Activate'}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="helpers" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Helper</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-12" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {helpers.length === 0 ? (
                      <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">No helpers added yet</TableCell></TableRow>
                    ) : helpers.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={a.photoUrl ?? undefined} alt="" />
                              <AvatarFallback className="text-xs">{getInitials(a.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-sm">{a.name}</div>
                              <div className="text-xs text-muted-foreground">{a.phone}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={a.isActive ? 'default' : 'secondary'}>{a.isActive ? 'Active' : 'Inactive'}</Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => { setEditingHelper(a); setShowHelperDialog(true) }}>
                                <Pencil className="mr-2 h-3.5 w-3.5" />Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                startTransition(async () => {
                                  await toggleHelperStatus(a.id, !a.isActive)
                                  toast.success(a.isActive ? 'Helper deactivated' : 'Helper activated')
                                  refresh()
                                })
                              }}>
                                {a.isActive ? <PowerOff className="mr-2 h-3.5 w-3.5" /> : <Power className="mr-2 h-3.5 w-3.5" />}
                                {a.isActive ? 'Deactivate' : 'Activate'}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="routes" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Route</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Driver</TableHead>
                      <TableHead>Stops</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-12" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {routes.length === 0 ? (
                      <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No routes added yet</TableCell></TableRow>
                    ) : routes.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium truncate">{r.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground truncate">{r.code}</TableCell>
                        <TableCell className="text-sm">{r.vehicle?.registrationNo ?? '—'}</TableCell>
                        <TableCell className="text-sm truncate">{r.driver?.name ?? '—'}</TableCell>
                        <TableCell className="text-sm truncate">{r.stops.length} stops</TableCell>
                        <TableCell>
                          <Badge variant={r.isActive ? 'default' : 'secondary'}>{r.isActive ? 'Active' : 'Inactive'}</Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => { setEditingRoute(r); setShowRouteDialog(true) }}>
                                <Pencil className="mr-2 h-3.5 w-3.5" />Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                startTransition(async () => {
                                  await toggleRouteStatus(r.id, !r.isActive)
                                  toast.success(r.isActive ? 'Route deactivated' : 'Route activated')
                                  refresh()
                                })
                              }}>
                                {r.isActive ? <PowerOff className="mr-2 h-3.5 w-3.5" /> : <Power className="mr-2 h-3.5 w-3.5" />}
                                {r.isActive ? 'Deactivate' : 'Activate'}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {showDriverDialog && <DriverDialog driver={editingDriver} onClose={() => { setShowDriverDialog(false); refresh() }} />}
      {showVehicleDialog && <VehicleDialog vehicle={editingVehicle} onClose={() => { setShowVehicleDialog(false); refresh() }} />}
      {showHelperDialog && <HelperDialog helper={editingHelper} onClose={() => { setShowHelperDialog(false); refresh() }} />}
      {showRouteDialog && <RouteDialog route={editingRoute} drivers={drivers} vehicles={vehicles} helpers={helpers} onClose={() => { setShowRouteDialog(false); refresh() }} />}
    </div>
  )
}
