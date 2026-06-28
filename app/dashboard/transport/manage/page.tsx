import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getDrivers, getVehicles, getHelpers, getRoutes } from '@/lib/data/transport'
import TransportManagement from '@/components/dashboard/transport/transport-management'

export default async function TransportManagePage() {
  const { orgRole } = await auth()
  if (orgRole !== 'ADMIN') redirect('/dashboard')

  const [drivers, vehicles, helpers, routes] = await Promise.all([
    getDrivers(),
    getVehicles(),
    getHelpers(),
    getRoutes(),
  ])

  return (
    <TransportManagement
      initialDrivers={drivers}
      initialVehicles={vehicles}
      initialHelpers={helpers}
      initialRoutes={routes}
    />
  )
}
