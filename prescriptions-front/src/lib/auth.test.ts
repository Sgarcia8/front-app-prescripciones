import { describe, expect, it } from "vitest";
import { homePathForRole } from "./auth";

describe("homePathForRole", () => {
  it("maps each role to its app home", () => {
    expect(homePathForRole("doctor")).toBe("/doctor/prescriptions");
    expect(homePathForRole("patient")).toBe("/patient/prescriptions");
    expect(homePathForRole("admin")).toBe("/admin");
  });
});
