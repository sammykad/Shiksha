2. Currency Data Type Risks

- Issue: Rule 2.9 states walletBalance is an Int (paise). However, the Fee and FeePayment models use Float for
  totalFee, paidAmount, and amount.
- Risk: Using Float for financial transactions leads to rounding errors (e.g., 0.1 + 0.2 ≠ 0.3). Per Indian
  accounting standards and general fintech best practices, all currency should be Int (paise).

6. "Magic String" Usage in Leaves
   - Issue: The Leave model uses type String // New instead of the LeaveType enum defined just above it.
   - Risk: This bypasses Prisma's type safety, allowing invalid leave types to be inserted into the database.

Authentication
Role Based Access Control : RBAC
Onboarding
Select Organization
Create Organization
Delete Organization
Update Organization

Signup / Signin Should Correctly With Valid Role and Dashboard
Invite Should Send Currectly as All Logics / Edge Cases / Senarios
