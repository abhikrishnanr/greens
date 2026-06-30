// Centralised, server-trusted coupon logic.
//
// IMPORTANT: All coupon validation and discount math MUST run on the server
// (billing API, coupon API). The client may *preview* a discount, but the
// authoritative amounts that get written to the `Billing` table are produced
// here so that invoices, billing-history and reports all agree.
//
// Pure functions only — no DB, no I/O — so they are trivially unit-testable.

export type DiscountType = 'fixed' | 'percent'

export interface CouponLike {
  code: string
  discountType: string // 'fixed' | 'percent'
  discountValue: number
  startDate: Date | string
  endDate: Date | string
  minAmount?: number | null
  maxRedemptions?: number | null
  timesUsed?: number | null
  isActive?: boolean | null
}

export interface CouponValidation {
  ok: boolean
  reason?:
    | 'inactive'
    | 'not_started'
    | 'expired'
    | 'below_min_amount'
    | 'exhausted'
    | 'invalid_amount'
  discount: number // 0 when not ok
}

function round2(n: number): number {
  // Avoid binary-float drift on currency (e.g. 0.1 + 0.2).
  return Math.round((n + Number.EPSILON) * 100) / 100
}

/**
 * Raw discount for a coupon against a pre-discount amount, clamped so it can
 * never exceed the amount (prevents negative totals) and never goes below 0.
 */
export function computeCouponDiscount(coupon: CouponLike, amount: number): number {
  if (!Number.isFinite(amount) || amount <= 0) return 0
  const value = Number(coupon.discountValue) || 0
  const raw =
    coupon.discountType === 'fixed' ? value : (value / 100) * amount
  return round2(Math.min(Math.max(raw, 0), amount))
}

/**
 * Full validation of a coupon for a given order amount at a point in time.
 * Returns ok=false with a machine-readable reason when the coupon must be
 * rejected, plus the computed discount when ok=true.
 */
export function validateCoupon(
  coupon: CouponLike,
  amount: number,
  now: Date = new Date(),
): CouponValidation {
  if (!Number.isFinite(amount) || amount < 0) {
    return { ok: false, reason: 'invalid_amount', discount: 0 }
  }
  if (coupon.isActive === false) {
    return { ok: false, reason: 'inactive', discount: 0 }
  }
  const start = new Date(coupon.startDate)
  const end = new Date(coupon.endDate)
  if (now < start) return { ok: false, reason: 'not_started', discount: 0 }
  if (now > end) return { ok: false, reason: 'expired', discount: 0 }
  if (coupon.minAmount != null && amount < coupon.minAmount) {
    return { ok: false, reason: 'below_min_amount', discount: 0 }
  }
  if (
    coupon.maxRedemptions != null &&
    (coupon.timesUsed ?? 0) >= coupon.maxRedemptions
  ) {
    return { ok: false, reason: 'exhausted', discount: 0 }
  }
  return { ok: true, discount: computeCouponDiscount(coupon, amount) }
}

/**
 * Distribute a total discount across line items in proportion to each line's
 * amount, so that the sum of the per-line discounts exactly equals `discount`
 * (any rounding remainder is absorbed by the largest line). Returns the
 * post-discount amount for each line, never below 0.
 */
export function allocateDiscount(
  lineAmounts: number[],
  discount: number,
): number[] {
  const total = lineAmounts.reduce((a, b) => a + b, 0)
  if (discount <= 0 || total <= 0) {
    return lineAmounts.map((a) => round2(Math.max(a, 0)))
  }
  const capped = Math.min(discount, total)
  const perLine = lineAmounts.map((a) => round2((a / total) * capped))

  // Fix rounding drift so allocations sum to exactly `capped`.
  let drift = round2(capped - perLine.reduce((a, b) => a + b, 0))
  if (drift !== 0) {
    let idx = 0
    for (let i = 1; i < lineAmounts.length; i++) {
      if (lineAmounts[i] > lineAmounts[idx]) idx = i
    }
    perLine[idx] = round2(perLine[idx] + drift)
  }

  return lineAmounts.map((a, i) => round2(Math.max(a - perLine[i], 0)))
}

export const reasonMessage: Record<NonNullable<CouponValidation['reason']>, string> = {
  inactive: 'This voucher is no longer active.',
  not_started: 'This voucher is not valid yet.',
  expired: 'This voucher has expired.',
  below_min_amount: 'Order total is below the minimum for this voucher.',
  exhausted: 'This voucher has reached its usage limit.',
  invalid_amount: 'Invalid order amount.',
}
