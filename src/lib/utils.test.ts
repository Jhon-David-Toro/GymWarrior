import { describe, expect, it } from "vitest";

import { discountPercent, formatCOP } from "./format";
import { safeRedirectPath, slugify } from "./utils";

describe("slugify", () => {
  it("quita tildes, espacios y símbolos", () => {
    expect(slugify("  Proteína Smart 3,25 LB! ")).toBe("proteina-smart-3-25-lb");
  });
});

describe("safeRedirectPath", () => {
  it("acepta rutas internas", () => {
    expect(safeRedirectPath("/carrito")).toBe("/carrito");
  });

  it.each(["https://evil.com", "//evil.com", "/\\evil.com", "javascript:alert(1)", 42, undefined])(
    "rechaza %s (open redirect)",
    (value) => {
      expect(safeRedirectPath(value)).toBe("/cuenta");
    },
  );
});

describe("format", () => {
  it("formatea pesos colombianos sin decimales", () => {
    expect(formatCOP(119000).replace(/\s/g, " ")).toBe("$ 119.000");
  });

  it("calcula el porcentaje de descuento", () => {
    expect(discountPercent(159000, 189000)).toBe(16);
    expect(discountPercent(100, null)).toBeNull();
    expect(discountPercent(100, 90)).toBeNull();
  });
});
