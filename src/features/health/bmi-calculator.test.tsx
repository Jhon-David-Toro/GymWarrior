import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/server/actions/health", () => ({ saveBmiAction: vi.fn() }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { BmiCalculator } from "./bmi-calculator";

describe("<BmiCalculator />", () => {
  it("muestra el resultado y la categoría", async () => {
    const user = userEvent.setup();
    render(<BmiCalculator />);

    await user.type(screen.getByLabelText("Peso (kg)"), "70");
    await user.type(screen.getByLabelText("Altura (cm)"), "175");
    await user.click(screen.getByRole("button", { name: "Calcular IMC" }));

    expect(screen.getByText("22,9")).toBeInTheDocument();
    expect(screen.getByText("Peso saludable")).toBeInTheDocument();
  });

  it("muestra errores accesibles con datos fuera de rango", async () => {
    const user = userEvent.setup();
    render(<BmiCalculator />);

    await user.type(screen.getByLabelText("Peso (kg)"), "5");
    await user.type(screen.getByLabelText("Altura (cm)"), "175");
    await user.click(screen.getByRole("button", { name: "Calcular IMC" }));

    const weight = screen.getByLabelText("Peso (kg)");
    expect(weight).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("El peso debe estar entre 25 y 300 kg")).toBeInTheDocument();
  });
});
