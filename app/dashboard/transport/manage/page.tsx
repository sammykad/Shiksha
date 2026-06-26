import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getOrganizationType } from '@/lib/organization'
import { getDrivers, getVehicles, getHelpers, getRoutes } from '@/lib/data/transport'
import TransportManagement from '@/components/dashboard/transport/transport-management'

export default async function TransportManagePage() {
  const { orgId, orgRole } = await auth()
  if (orgRole !== 'ADMIN') redirect('/dashboard')
  //  && orgRole !== 'SUPERADMIN'
  const [drivers, vehicles, helpers, routes, organizationType] = await Promise.all([
    getDrivers(),
    getVehicles(),
    getHelpers(),
    getRoutes(),
    getOrganizationType(orgId),
  ])

  return (
    <TransportManagement
      initialDrivers={drivers}
      initialVehicles={vehicles}
      initialHelpers={helpers}
      initialRoutes={routes}
      organizationType={organizationType}
    />
  )
}
