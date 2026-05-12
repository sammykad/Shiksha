import React, { Suspense } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Hash, Mail, Phone, User, Filter, Users } from 'lucide-react';
import Loading from '@/app/dashboard/students/loading';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  fullName?: string | null;
  rollNumber: string;
  phoneNumber: string;
  email: string;
  profileImage?: string | null;
  dateOfBirth: Date;
  grade: {
    id: string;
    grade: string;
  };
  section: {
    id: string;
    name: string;
  };
}

interface StudentsGridListProps {
  students: Student[];
  hasActiveFilters?: boolean;
  totalStudentsCount?: number;
}

const StudentsGridList = ({ students, hasActiveFilters = false, totalStudentsCount = 0 }: StudentsGridListProps) => {
  // Determine if we should show the "no results from filters" message
  const isFilteredEmptyState = hasActiveFilters && students.length === 0 && totalStudentsCount > 0;

  // Determine if there are genuinely no students in the system
  const isGenuinelyEmpty = students.length === 0 && !hasActiveFilters && totalStudentsCount === 0;

  return (
    <>
      {students && students.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2  md:grid-cols-3 xl:grid-cols-4 gap-6">
          <Suspense fallback={<Loading />}>
            {students.map((student) => (
              <Link href={`/dashboard/students/${student.id}`} key={student.id}>
                <Card className="overflow-hidden transition-all hover:shadow-md">
                  <CardHeader className="p-0">
                    <div className="bg-muted h-12"></div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex flex-col items-center -mt-6 mb-4">
                      <Avatar className="h-16 w-16 border-2 border-background">
                        <AvatarImage
                          className="object-cover"
                          src={student.profileImage || ''}
                          alt={`${student.fullName} || ${student.firstName} ${student.lastName}`}
                        />
                        <AvatarFallback className="text-lg font-medium">
                          {`${student.firstName.charAt(
                            0
                          )}${student.lastName.charAt(0)}`}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="font-medium text-lg mt-2">{`${student.firstName}  ${student.lastName}`}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="outline"
                          className="text-xs font-normal"
                        >
                          {student.grade.grade}
                        </Badge>
                        {student.section && (
                          <Badge
                            variant="outline"
                            className="text-xs font-normal"
                          >
                            {student.section.name}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-muted-foreground">
                          Roll Number:
                        </span>
                        <span className="font-medium">
                          {student.rollNumber}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="truncate">{student.email}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <Button
                          // href={`tel:${student.phoneNumber}`}
                          variant={'ghost'}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          {student.phoneNumber}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </Suspense>
        </div>
      ) : (
        <div className="flex justify-center items-center my-5">
          {isFilteredEmptyState ? (
            <EmptyState
              title="No Students Match Your Filters"
              description={`We found ${totalStudentsCount} student${totalStudentsCount !== 1 ? 's' : ''} in total, but none match your current filter criteria.`}
              icons={[Filter, Users, User]}
              image="/EmptyState.png"
              hint="Try adjusting your search terms or removing some filters to see more results."
            />
          ) : isGenuinelyEmpty ? (
            <EmptyState
              title="No Students Yet"
              description="Your organization doesn't have any students yet. Get started by adding your first student to begin managing records."
              icons={[Users, User, Mail]}
              image="/EmptyState.png"
              hint="Make sure to set up grades and sections before adding students for better organization."
              action={{
                label: 'Add First Student',
                href: '/dashboard/students/create',
              }}
            />
          ) : (
            <EmptyState
              title="No Students Found"
              description="No students found with the given search query. Try different search terms or clear your filters."
              icons={[User, Mail, Phone]}
              image="/EmptyState.png"
              hint="Check your spelling or try searching by roll number instead of name."
              action={{
                label: 'View All Students',
                href: '/dashboard/students',
              }}
            />
          )}        </div>
      )}
    </>
  );
};

export default StudentsGridList;

