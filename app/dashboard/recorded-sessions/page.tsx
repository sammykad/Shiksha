import RecordedSessionForm from "@/components/dashboard/recorded-sessions/RecordedSessionForm";
import { fetchGradesAndSections } from "@/app/actions";
import { getOrganizationId } from "@/lib/organization";
import DocumentEmptyState from "@/components/ui/document-empty-state";

export default async function Page() {
    const organizationId = await getOrganizationId();
    const grades = await fetchGradesAndSections(organizationId);

    return (
        <RecordedSessionForm grades={grades} />
    )
}
