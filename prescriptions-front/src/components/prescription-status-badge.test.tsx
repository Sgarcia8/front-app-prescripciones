// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { PrescriptionStatusBadge } from "./prescription-status-badge";

afterEach(() => cleanup());

describe("PrescriptionStatusBadge", () => {
  it("renders Pendiente for pending", () => {
    render(<PrescriptionStatusBadge status="pending" />);
    const el = screen.getByText("Pendiente");
    expect(el).toHaveClass("app-badge", "app-badge--pending");
  });

  it("renders Consumida for consumed", () => {
    render(<PrescriptionStatusBadge status="consumed" />);
    const el = screen.getByText("Consumida");
    expect(el).toHaveClass("app-badge", "app-badge--consumed");
  });

  it("renders Vencida for expired", () => {
    render(<PrescriptionStatusBadge status="expired" />);
    const el = screen.getByText("Vencida");
    expect(el).toHaveClass("app-badge", "app-badge--expired");
  });

  it("merges optional className", () => {
    render(<PrescriptionStatusBadge status="pending" className="extra-class" />);
    const el = screen.getByText("Pendiente");
    expect(el).toHaveClass("app-badge--pending", "extra-class");
  });
});
