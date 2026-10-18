import { describe, it, expect } from "vitest";
import { formatRWF, getProductMedia } from "../data/productMedia";

describe("SphereShop Storefront Tests", () => {
  it("formats RWF currency with floor rounding and thousands separators", () => {
    expect(formatRWF(12000)).toContain("12,000 RWF");
    expect(formatRWF(12000.99)).toContain("12,000 RWF");
    expect(formatRWF(0)).toContain("0 RWF");
  });

  it("retrieves curated Unsplash media for seeded SKUs", () => {
    const hdp = getProductMedia("HDP-01");
    expect(hdp.brand).toBe("Sony");
    expect(hdp.main).toContain("unsplash.com");
    expect(hdp.gallery.length).toBeGreaterThan(0);

    const lamp = getProductMedia("LAMP-03");
    expect(lamp.brand).toBe("Baseus");
    expect(lamp.main).toContain("unsplash.com");
  });

  it("computes deterministic fallback media for unknown or pagination SKUs", () => {
    const extra = getProductMedia("EXTRA-15");
    expect(extra.main).toContain("unsplash.com");
    expect(extra.rating).toBeGreaterThan(4);
  });
});
