# Shiksha.cloud Billing Context

This context defines the language for Shiksha.cloud pricing, subscriptions, billing, offers, invoices, and usage charging. It exists so the public pricing page, dashboard billing UI, Prisma models, and legal pages use the same words.

## Language

**Plan**:
A sellable product package such as Starter, Growth, or Scale. A plan defines the commercial package and limits, not a temporary launch discount.
_Avoid_: Tier, package, pricing card

**Offer**:
A time-bound or eligibility-based price modifier applied to a plan. EarlyBird is an offer because it changes the price, not the product access.
_Avoid_: Promotion, coupon, campaign, discount plan

**Subscription**:
The active commercial relationship between one organization and one plan. It records status, billing cycle, offer, trial dates, renewal dates, and price terms.
_Avoid_: Plan status, organization plan, paid flag

**Student**:
The billable education participant counted for subscription sizing. This maps to active student records.
_Avoid_: Seat, user, account, learner

**Free Role**:
A non-billable account role such as parent, teacher, admin, or staff. These roles should never increase subscription price.
_Avoid_: Free seat, free user

**Invoice**:
A bill for a subscription period or usage cost. An invoice records the amount owed before or after payment.
_Avoid_: Bill, payment request

**Subscription Payment**:
A payment attempt or result for subscription billing. This is separate from `FeePayment`, which belongs to student fee collection.
_Avoid_: Payment, fee payment

**Usage Cost**:
A variable cost outside subscription price, such as SMS, WhatsApp, voice, payment gateway charges, or storage overage.
_Avoid_: Add-on, hidden charge

**Wallet**:
The organization's prepaid balance used for usage costs such as notifications. It is not the subscription itself.
_Avoid_: Subscription balance, credit account

**Billing Event**:
An audit record for meaningful billing changes, such as trial started, plan changed, offer applied, invoice paid, or subscription cancelled.
_Avoid_: Log, note, activity
