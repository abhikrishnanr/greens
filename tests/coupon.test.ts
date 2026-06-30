import test from 'node:test'
import assert from 'node:assert/strict'
import {
  computeCouponDiscount,
  validateCoupon,
  allocateDiscount,
  type CouponLike,
} from '../src/lib/coupon'

const base: CouponLike = {
  code: 'SAVE10',
  discountType: 'percent',
  discountValue: 10,
  startDate: '2025-01-01T00:00:00Z',
  endDate: '2030-01-01T00:00:00Z',
  minAmount: null,
  maxRedemptions: null,
  timesUsed: 0,
  isActive: true,
}
const now = new Date('2026-06-30T00:00:00Z')

test('percent discount', () => {
  assert.equal(computeCouponDiscount({ ...base }, 1000), 100)
})

test('fixed discount', () => {
  assert.equal(computeCouponDiscount({ ...base, discountType: 'fixed', discountValue: 150 }, 1000), 150)
})

test('discount never exceeds amount (no negative totals)', () => {
  assert.equal(computeCouponDiscount({ ...base, discountType: 'fixed', discountValue: 5000 }, 1000), 1000)
})

test('rejects expired coupon', () => {
  const r = validateCoupon({ ...base, endDate: '2025-02-01T00:00:00Z' }, 1000, now)
  assert.equal(r.ok, false)
  assert.equal(r.reason, 'expired')
})

test('rejects not-yet-started coupon', () => {
  const r = validateCoupon({ ...base, startDate: '2027-01-01T00:00:00Z' }, 1000, now)
  assert.equal(r.reason, 'not_started')
})

test('rejects inactive coupon', () => {
  assert.equal(validateCoupon({ ...base, isActive: false }, 1000, now).reason, 'inactive')
})

test('rejects below minimum amount', () => {
  assert.equal(validateCoupon({ ...base, minAmount: 2000 }, 1000, now).reason, 'below_min_amount')
})

test('rejects exhausted coupon', () => {
  const r = validateCoupon({ ...base, maxRedemptions: 5, timesUsed: 5 }, 1000, now)
  assert.equal(r.reason, 'exhausted')
})

test('valid coupon returns discount', () => {
  const r = validateCoupon({ ...base }, 1000, now)
  assert.equal(r.ok, true)
  assert.equal(r.discount, 100)
})

test('allocateDiscount sums exactly to the discount', () => {
  const lines = [333.33, 333.33, 333.34]
  const out = allocateDiscount(lines, 100)
  const totalDiscount = lines.reduce((a, b) => a + b, 0) - out.reduce((a, b) => a + b, 0)
  assert.equal(Math.round(totalDiscount * 100) / 100, 100)
})

test('allocateDiscount never produces negative lines', () => {
  const out = allocateDiscount([10, 20, 30], 1000)
  for (const v of out) assert.ok(v >= 0)
})

test('allocateDiscount with no discount returns same amounts', () => {
  assert.deepEqual(allocateDiscount([10, 20], 0), [10, 20])
})
