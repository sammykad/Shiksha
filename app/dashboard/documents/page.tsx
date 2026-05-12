import DocumentsPage from '@/components/dashboard/Student/documents/DocumentPage';
import { getStudentDocuments } from '@/lib/data/documents/get-student-documents';
import { getCurrentUserByRole } from '@/lib/auth';

const page = async () => {
  const currentUser = await getCurrentUserByRole();

  // ✅ Only allow students here
  if (currentUser.role !== 'STUDENT') {
    return (
      <div className="p-8 text-center text-red-600 font-semibold text-lg">
        Only students can access this page.
      </div>
    );
  }
  const documents = await getStudentDocuments(currentUser.studentId);
  return <DocumentsPage studentId={currentUser.studentId} data={documents} />;
};

export default page;
