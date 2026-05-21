// ─────────────────────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────────────────────

enum VehicleType {
  VAN
  MINI_BUS
  LARGE_BUS
  ELECTRIC_BUS
}

enum VehicleStatus {
  ACTIVE
  MAINTENANCE
  RETIRED
}

enum BusRouteStatus {
  ACTIVE
  INACTIVE
  MAINTENANCE
}

enum TransportFeeStatus {
  PAID
  PENDING
  OVERDUE
  WAIVED
}

// ─────────────────────────────────────────────────────────────
// VEHICLE
// ─────────────────────────────────────────────────────────────

model Vehicle {
  id             String        @id @default(cuid())
  organizationId String
  organization   Organization  @relation(fields: [organizationId], references: [id])

  registrationNo  String
  type            VehicleType
  capacity        Int
  manufacturer    String?
  model           String?
  year            Int?
  status          VehicleStatus @default(ACTIVE)

  // Compliance
  fitnessExpiry   DateTime?
  insuranceExpiry DateTime?
  pucExpiry       DateTime?

  // Service
  lastServiceDate DateTime?
  nextServiceDate DateTime?

  routes      BusRoute[]
  serviceLogs VehicleServiceLog[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([organizationId, registrationNo])
  @@index([organizationId])
  @@index([status])
}

model VehicleServiceLog {
  id          String   @id @default(cuid())
  vehicleId   String
  vehicle     Vehicle  @relation(fields: [vehicleId], references: [id])

  serviceDate DateTime
  description String
  cost        Float?
  servicedBy  String?

  createdAt DateTime @default(now())

  @@index([vehicleId])
}

// ─────────────────────────────────────────────────────────────
// DRIVER
// ─────────────────────────────────────────────────────────────

model Driver {
  id             String       @id @default(cuid())
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])

  name           String
  phone          String
  alternatePhone String?
  licenseNumber  String
  licenseExpiry  DateTime?
  photoUrl       String?
  isActive       Boolean      @default(true)

  routes BusRoute[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([organizationId, licenseNumber])
  @@index([organizationId])
}

// ─────────────────────────────────────────────────────────────
// ROUTE
// ─────────────────────────────────────────────────────────────

model BusRoute {
  id             String         @id @default(cuid())
  organizationId String
  organization   Organization   @relation(fields: [organizationId], references: [id])

  name             String
  code             String
  status           BusRouteStatus @default(ACTIVE)
  morningDeparture String?        // "07:15"
  eveningDeparture String?        // "16:30"
  feePerMonth      Float?

  vehicleId      String?
  vehicle        Vehicle?      @relation(fields: [vehicleId], references: [id])
  driverId       String?
  driver         Driver?       @relation(fields: [driverId], references: [id])
  academicYearId String?
  academicYear   AcademicYear? @relation(fields: [academicYearId], references: [id])

  stops       BusStop[]
  enrollments BusEnrollment[]

  createdBy String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([organizationId, code])
  @@index([organizationId])
  @@index([academicYearId])
}

// ─────────────────────────────────────────────────────────────
// STOP
// ─────────────────────────────────────────────────────────────

model BusStop {
  id      String   @id @default(cuid())
  routeId String
  route   BusRoute @relation(fields: [routeId], references: [id], onDelete: Cascade)

  name       String
  order      Int        // 1, 2, 3 … sequenced stops
  landmark   String?
  pickupTime String?    // estimated pickup time at this stop

  enrollments BusEnrollment[]

  @@unique([routeId, order])
  @@index([routeId])
}

// ─────────────────────────────────────────────────────────────
// ENROLLMENT  (Student ↔ Route assignment)
// ─────────────────────────────────────────────────────────────

model BusEnrollment {
  id             String             @id @default(cuid())
  organizationId String

  studentId String
  student   Student  @relation(fields: [studentId], references: [id])
  routeId   String
  route     BusRoute @relation(fields: [routeId], references: [id])
  stopId    String
  stop      BusStop  @relation(fields: [stopId], references: [id])

  academicYearId String?
  academicYear   AcademicYear? @relation(fields: [academicYearId], references: [id])

  isActive  Boolean            @default(true)
  feeStatus TransportFeeStatus @default(PENDING)

  // Optional: link to your existing Fee model
  feeId String?
  fee   Fee?    @relation(fields: [feeId], references: [id])

  enrolledAt DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@unique([studentId, academicYearId])  // one route per student per academic year
  @@index([routeId])
  @@index([studentId])
  @@index([organizationId])
}


// Organization
vehicles      Vehicle[]
drivers       Driver[]
busRoutes     BusRoute[]

// Student
busEnrollment BusEnrollment[]

// AcademicYear
busRoutes      BusRoute[]
busEnrollments BusEnrollment[]

// Fee (optional — only if you bill transport through your fee system)
busEnrollment  BusEnrollment[]


3 things worth noting:

Driver is separate from User/Teacher — drivers are typically external staff with no system login
@@unique([studentId, academicYearId]) on BusEnrollment enforces one active route per student per year — if you need mid-year route changes, drop this to an index and add a isActive soft-delete pattern instead
feeId on BusEnrollment is optional but lets you pipe transport billing directly through your existing Fee → FeePayment flow without any new payment logic
