import { getGradesAndSections, getReportStats } from '@/lib/data/reports/get-reports-data';
import { ReportsHub } from '@/components/dashboard/reports/ReportsHub';
import { getActiveAcademicYearId } from '@/lib/academicYear';
import { getOrganizationId } from '@/lib/organization';

export default async function ReportsPage() {
    const [{ grades, sections }, stats] = await Promise.all([
        getGradesAndSections(),
        getReportStats(),
    ]);
    const [organizationId, academicYearId] = await Promise.all([
        getOrganizationId(),
        getActiveAcademicYearId(),
    ]);

    return (
        <ReportsHub
            grades={grades}
            sections={sections}
            stats={stats}
            organizationId={organizationId}
            academicYearId={academicYearId}
        />
    );
}
