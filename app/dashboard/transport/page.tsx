import { Bus } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import TransportMap from '@/components/dashboard/parent/transport-map'
import { getParentTransportData } from '@/lib/data/transport/parent-transport'

export default async function TransportPage() {
  const data = await getParentTransportData()

  if (!data) {
    return (
      <div className="space-y-4 px-2">
        <PageHeader
          title="Bus Transport"
          description="Track your school bus in real-time"
          icon={Bus}
        />
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Bus className="h-12 w-12 mb-4 opacity-20" />
          <p className="text-sm">No transport route assigned yet.</p>
          <p className="text-xs">Contact your school for route information.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 px-2">
      <PageHeader
        title="Bus Transport"
        description="Track your school bus in real-time"
        icon={Bus}
      />
      <TransportMap
        showFullscreen
        showRotate
        showLocate
        route={data.route}
        stops={data.stops}
        roadCoordinates={data.roadCoordinates}
        totalStudents={data.totalStudents}
        center={data.center}
      />
    </div>
  )
}
