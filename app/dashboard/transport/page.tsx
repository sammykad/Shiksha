import { Bus } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import TransportMap from '@/components/dashboard/parent/transport-map'



export default function TransportPage() {
  return (
    <div className="space-y-4 px-2">
      <PageHeader
        title="Bus Transport"
        description="Track your school bus in real-time"
        icon={Bus}
      />
      <TransportMap showFullscreen showRotate showLocate />
    </div>
  )
}
