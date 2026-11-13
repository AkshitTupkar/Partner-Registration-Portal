// Product photos for the product picker, keyed by product master code (F-04).
// Files live in frontend/public. kitchenAppliances.webp is a WebP copy of the
// supplied kithcenAppliances.avif, for browsers without AVIF support.

const PRODUCT_IMAGES: Record<string, string> = {
  FANS: "/fan.jpg",
  WATER_PURIFIERS: "/waterpurifier.webp",
  KITCHEN_APPLIANCES: "/kitchenAppliances.webp",
  SMART_LOCKS: "/smartLock.webp",
};

/** Photo for a product; falls back to the Atomberg logo mark for codes without one. */
export const productImage = (code: string) => PRODUCT_IMAGES[code] ?? "/logo-mark.png";
