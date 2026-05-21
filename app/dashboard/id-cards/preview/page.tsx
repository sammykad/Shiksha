import IdCardPreview from '@/components/dashboard/id-card/IdCardPreview';

export const metadata = {
  title: 'ID Card Preview | Shiksha Cloud',
};

const sampleStudent = {
  person: {
    firstName: 'Aarav',
    lastName: 'Sharma',
    details: {
      'Grade': '7 - B',
      'ID No.': 'GIS24S0078',
    },
  },
  organization: {
    name: 'Greenfield International School',
    address: '123 Education Avenue, Bengaluru - 560001',
    phone: '+91 80 1234 5678',
    website: 'www.gis.edu.in',
  },
  cardNumber: 'GIS24S0078',
  academicYear: '2024-25',
  role: 'STUDENT' as const,
  motto: 'Inspire  •  Learn  •  Grow',
};

const sampleTeacher = {
  person: {
    firstName: 'Neha',
    lastName: 'Krishnan',
    details: {
      'Department': 'Mathematics',
      'ID No.': 'GIS24T00156',
    },
  },
  organization: {
    name: 'Greenfield International School',
    address: '123 Education Avenue, Bengaluru - 560001',
    phone: '+91 80 1234 5678',
    website: 'www.gis.edu.in',
  },
  cardNumber: 'GIS24T00156',
  academicYear: '2024-25',
  role: 'TEACHER' as const,
  motto: 'Empower  •  Educate  •  Excel',
};

export default function IdCardPreviewPage() {
  return (
    <div className="flex-1 space-y-8 px-2 py-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">ID Card Templates</h1>
        <p className="text-muted-foreground">Preview of student and teacher ID card designs</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2 max-w-5xl mx-auto">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-center text-emerald-600">Student ID Card</h2>
          <IdCardPreview {...sampleStudent} />
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-center text-blue-600">Teacher ID Card</h2>
          <IdCardPreview {...sampleTeacher} />
        </div>
      </div>

      <div className="max-w-2xl mx-auto text-center space-y-4 text-sm text-muted-foreground">
        <p>These are HTML previews. The actual PDF cards are generated with the same layout.</p>
        <p>Organization logo, motto, and contact details are pulled from your school settings.</p>
      </div>
    </div>
  );
}
