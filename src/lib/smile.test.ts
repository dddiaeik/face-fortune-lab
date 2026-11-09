import { describe, expect, it } from "vitest";
import { SmileGesture } from "./smile";
describe("smile state machine", () => {
  it("requires both coefficients and full hold duration", () => {
    const g = new SmileGesture();
    expect(g.update(0.9, 0.2, true, 0)).toBe(false);
    expect(g.update(0.8, 0.8, true, 10)).toBe(false);
    expect(g.update(0.8, 0.8, true, 709)).toBe(false);
    expect(g.update(0.8, 0.8, true, 710)).toBe(true);
  });
  it("fires once while held and rearms only after sustained release", () => {
    const g = new SmileGesture();
    g.update(0.8, 0.8, true, 0);
    expect(g.update(0.8, 0.8, true, 700)).toBe(true);
    expect(g.update(0.8, 0.8, true, 2000)).toBe(false);
    g.update(0.1, 0.1, true, 2100);
    g.update(0.8, 0.8, true, 2200);
    expect(g.update(0.8, 0.8, true, 3000)).toBe(false);
    g.update(0.1, 0.1, true, 3100);
    g.update(0.1, 0.1, true, 3450);
    g.update(0.8, 0.8, true, 3500);
    expect(g.update(0.8, 0.8, true, 4200)).toBe(true);
  });
  it("resets progress and latch when face is lost", () => {
    const g = new SmileGesture();
    g.update(0.8, 0.8, true, 0);
    g.update(0.8, 0.8, true, 600);
    g.update(0, 0, false, 650);
    expect(g.progress).toBe(0);
    expect(g.state).toBe("ready");
    expect(g.update(0.8, 0.8, true, 900)).toBe(false);
    expect(g.update(0.8, 0.8, true, 1600)).toBe(true);
    g.update(0, 0, false, 1700);
    expect(g.state).toBe("ready");
  });
  it("breaks a hold when the smile dips", () => {
    const g = new SmileGesture();
    g.update(0.8, 0.8, true, 0);
    g.update(0.4, 0.8, true, 600);
    expect(g.update(0.8, 0.8, true, 700)).toBe(false);
    expect(g.update(0.8, 0.8, true, 1399)).toBe(false);
  });
});
