import { Building2, Plus } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { getInstitutionDashboard } from "@/lib/data/institution/get-institution-dashboard";
import InstitutionSuperAdminDashboard from "@/components/dashboard/institution/InstitutionSuperAdminDashboard";

export default async function InstitutionDashboard() {
  const data = await getInstitutionDashboard();

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <EmptyState
          icons={[Building2]}
          title="No institution found"
          description="Create an institution to get started with the owner dashboard."
          action={{
            label: "Add organization",
            icon: Plus,
            href: "/select-organization?returnUrl=/dashboard/institution",
          }}
        />
      </div>
    );
  }

  return <InstitutionSuperAdminDashboard data={data} />;
}
