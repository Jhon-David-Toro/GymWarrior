import { beforeEach, describe, expect, it } from "vitest";

import { selectCount, selectSubtotal, useCart } from "./store";

const protein = {
  productId: "p1",
  slug: "proteina",
  name: "Proteína",
  price: 80000,
  imageUrl: "/p.webp",
  stock: 3,
};

describe("cart store", () => {
  beforeEach(() => useCart.setState({ items: [], isOpen: false }));

  it("agrega un producto y abre el carrito", () => {
    useCart.getState().add(protein);
    const state = useCart.getState();
    expect(state.items).toHaveLength(1);
    expect(state.isOpen).toBe(true);
  });

  it("suma cantidades del mismo producto sin superar el stock", () => {
    const { add } = useCart.getState();
    add(protein, 2);
    add(protein, 5);
    expect(useCart.getState().items[0]?.quantity).toBe(3);
  });

  it("nunca deja cantidades menores a 1", () => {
    useCart.getState().add(protein);
    useCart.getState().setQuantity("p1", 0);
    expect(useCart.getState().items[0]?.quantity).toBe(1);
  });

  it("calcula cantidad total y subtotal", () => {
    const { add } = useCart.getState();
    add(protein, 2);
    add({ ...protein, productId: "p2", price: 10000, stock: 10 }, 3);
    const state = useCart.getState();
    expect(selectCount(state)).toBe(5);
    expect(selectSubtotal(state)).toBe(190000);
  });

  it("elimina y vacía", () => {
    const { add, remove, clear } = useCart.getState();
    add(protein);
    add({ ...protein, productId: "p2" });
    remove("p1");
    expect(useCart.getState().items.map((i) => i.productId)).toEqual(["p2"]);
    clear();
    expect(useCart.getState().items).toEqual([]);
  });
});
