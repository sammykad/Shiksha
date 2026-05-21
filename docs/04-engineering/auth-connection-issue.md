⨯ Error [PrismaClientKnownRequestError]:
Invalid `prisma.academicYear.findMany()` invocation:

Server has closed the connection.
at async DashboardLayout (app\dashboard\layout.tsx:24:55)
22 | }
23 |

> 24 | const [organization, academicYears, activeYearId] = await Promise.all([

     |                                                       ^

25 | prisma.organization.findUnique({
26 | where: { id: orgId },
27 | select: { organizationType: true }, {
code: 'P1017',
meta: [Object],
clientVersion: '7.4.1',
digest: '3984478273'
}
⨯ Error [PrismaClientKnownRequestError]:
Invalid `prisma.studentDocument.findMany()` invocation:

Server has closed the connection.
at async getAllStudentDocuments (lib\data\documents\get-all-student-documents.ts:7:21)
at async DocumentsData (app\dashboard\documents\verification\page.tsx:8:21)
5 | const organizationId = await getOrganizationId();
6 |

> 7 | const documents = await prisma.studentDocument.findMany({

     |                     ^

8 | where: {
9 | isDeleted: false,
10 | organizationId, {
code: 'P1017',
meta: [Object],
clientVersion: '7.4.1',
digest: '3531163446'
}
⨯ Error [DriverAdapterError]: connection failure during authentication
at async DashboardLayout (app\dashboard\layout.tsx:24:55)
22 | }
23 |

> 24 | const [organization, academicYears, activeYearId] = await Promise.all([

     |                                                       ^

25 | prisma.organization.findUnique({
26 | where: { id: orgId },
27 | select: { organizationType: true }, {
clientVersion: '7.4.1',
digest: '1069015949',
[cause]: [Object]
}
⨯ Error [DriverAdapterError]: connection failure during authentication
at async getAllStudentDocuments (lib\data\documents\get-all-student-documents.ts:7:21)
at async DocumentsData (app\dashboard\documents\verification\page.tsx:8:21)
5 | const organizationId = await getOrganizationId();
6 |

> 7 | const documents = await prisma.studentDocument.findMany({
> 9 | isDeleted: false,
> 10 | organizationId, {
> clientVersion: '7.4.1',
> digest: '3953850833',
> [cause]: [Object]
> }

Sync error: "" "ClerkAPIResponseError: \n at OrganizationAPI.request (D:\\nexus\\.next\\dev\\server\\chunks\\ssr\\node_modules_@clerk_backend_dist_4f7de273._.js:4175:27)\n at async Promise.all (index 1)\n at async syncOrganizationUser (D:\\nexus\\.next\\dev\\server\\chunks\\ssr\\[root-of-the-server]**e1859bc1.\_.js:2925:48)\n at async Navbar (D:\\nexus\\.next\\dev\\server\\chunks\\ssr\\[root-of-the-server]**e1859bc1.\_.js:3749:5)"
lib\syncUser.ts (316:15) @ syncOrganizationUser

314 | });
315 | } else if (error instanceof Error) {

> 316 | console.error('Sync error:', error.message, error.stack);

      |               ^

317 | } else {
318 | console.error('Sync error (Unknown):', JSON.stringify(error, null, 2));
319 | }

<!-- Second Issue  -->

[browser] Error: No role found for user user_30XR4ETWH7g6hEal8p6hfpBk5Ax in organization org_36KC08EivX4t1nvMQwly4yQFTgV
at getCurrentUserByRole (lib\auth.ts:48:9)
at AttendancePage (app\dashboard\my-attendance\page.tsx:29:16)
46 | if (parent) return { role: 'PARENT', userId, parentId: parent.id, };
47 |

> 48 | throw new Error(

     |         ^

49 | `No role found for user ${userId} in organization ${organizationId}`
50 | );
51 | } (app/dashboard/error.tsx:18:17)
[browser] Error: No role found for user user_30XR4ETWH7g6hEal8p6hfpBk5Ax in organization org_36KC08EivX4t1nvMQwly4yQFTgV
at getCurrentUserByRole (lib\auth.ts:48:9)
at AttendancePage (app\dashboard\my-attendance\page.tsx:29:16)
46 | if (parent) return { role: 'PARENT', userId, parentId: parent.id, };
47 |

> 48 | throw new Error(

     |         ^

49 | `No role found for user ${userId} in organization ${organizationId}`
50 | );
51 | } (app/dashboard/error.tsx:18:17)
POST /dashboard/my-attendance 200 in 48ms (next.js: 5ms, proxy.ts: 19ms, application-code: 23ms)
└─ ƒ detectKeylessEnvDriftAction() in 1ms node_modules/@clerk/nextjs/dist/esm/app-router/keyless-actions.js
