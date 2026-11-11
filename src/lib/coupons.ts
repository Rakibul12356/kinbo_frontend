export interface CouponDefinition {
  code: string;
  label: string;
  /** Percent off subtotal, e.g. 10 = 10%. */
  percentOff?: number;
  /** Flat amount off subtotal in ৳. */
  amountOff?: number;
  /** Minimum subtotal required to apply. */
  minSubtotal?: number;
}

export const FREE_DELIVERY_THRESHOLD = 1999;

export const COUPONS: CouponDefinition[] = [
  {
    code: "KINBO10",
    label: "10% off your order",
    percentOff: 10,
    minSubtotal: 500,
  },
  {
    code: "SAVE100",
    label: "৳100 off",
    amountOff: 100,
    minSubtotal: 800,
  },
  {
    code: "WELCOME15",
    label: "15% welcome discount",
    percentOff: 15,
    minSubtotal: 1000,
  },
];

export type CouponResult =
  | { ok: true; coupon: CouponDefinition; discount: number }
  | { ok: false; error: string };

export function findCoupon(code: string): CouponDefinition | undefined {
  const normalized = code.trim().toUpperCase();
  return COUPONS.find((c) => c.code === normalized);
}

export function calculateCouponDiscount(
  coupon: CouponDefinition,
  subtotal: number
): number {
  if (coupon.minSubtotal && subtotal < coupon.minSubtotal) return 0;
  let discount = 0;
  if (coupon.percentOff) discount += (subtotal * coupon.percentOff) / 100;
  if (coupon.amountOff) discount += coupon.amountOff;
  return Math.min(Math.round(discount * 100) / 100, subtotal);
}

export function applyCouponCode(code: string, subtotal: number): CouponResult {
  const coupon = findCoupon(code);
  if (!coupon) return { ok: false, error: "Invalid coupon code" };
  if (coupon.minSubtotal && subtotal < coupon.minSubtotal) {
    return {
      ok: false,
      error: `Add more items — min ৳${coupon.minSubtotal} required`,
    };
  }
  const discount = calculateCouponDiscount(coupon, subtotal);
  if (discount <= 0) return { ok: false, error: "Coupon cannot be applied" };
  return { ok: true, coupon, discount };
}

export interface CartOffer {
  id: string;
  title: string;
  detail: string;
  tone: "amber" | "emerald" | "navy";
}

/** Active promotions shown to the user based on current cart. */
export function getCartOffers(subtotal: number): CartOffer[] {
  const offers: CartOffer[] = [];

  if (subtotal <= 0) {
    offers.push({
      id: "free-delivery",
      title: `Free delivery at ৳${FREE_DELIVERY_THRESHOLD}`,
      detail: "Add items to unlock free shipping",
      tone: "amber",
    });
  } else if (subtotal < FREE_DELIVERY_THRESHOLD) {
    const remaining = Math.ceil(FREE_DELIVERY_THRESHOLD - subtotal);
    offers.push({
      id: "free-delivery",
      title: `Free delivery at ৳${FREE_DELIVERY_THRESHOLD}`,
      detail: `Add more ৳${remaining}`,
      tone: "amber",
    });
  } else {
    offers.push({
      id: "free-delivery-unlocked",
      title: "Free delivery unlocked",
      detail: "Your order qualifies for free shipping",
      tone: "emerald",
    });
  }

  const nextCoupon = COUPONS.find(
    (c) => !c.minSubtotal || subtotal >= (c.minSubtotal ?? 0)
  );
  if (nextCoupon) {
    offers.push({
      id: `coupon-${nextCoupon.code}`,
      title: `Special offer: ${nextCoupon.code}`,
      detail: nextCoupon.label,
      tone: "navy",
    });
  } else {
    const closest = [...COUPONS]
      .filter((c) => c.minSubtotal && subtotal < (c.minSubtotal ?? 0))
      .sort((a, b) => (a.minSubtotal ?? 0) - (b.minSubtotal ?? 0))[0];
    if (closest?.minSubtotal) {
      offers.push({
        id: `coupon-unlock-${closest.code}`,
        title: `Unlock ${closest.code}`,
        detail: `Spend ৳${closest.minSubtotal - Math.floor(subtotal)} more for ${closest.label.toLowerCase()}`,
        tone: "navy",
      });
    }
  }

  return offers;
}
