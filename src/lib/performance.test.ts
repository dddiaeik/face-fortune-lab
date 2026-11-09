import { expect, it } from "vitest";
import { PerformanceWindow } from "./performance";
it("handles empty and single samples without division by zero", () => {
  const p = new PerformanceWindow();
  expect(p.summary()).toEqual({ count: 0, fps: 0, mean: 0, p50: 0, p95: 0 });
  p.add(0, 12);
  expect(p.summary()).toEqual({ count: 1, fps: 0, mean: 12, p50: 12, p95: 12 });
});
it("calculates nearest-rank percentiles, mean and analysis FPS", () => {
  const p = new PerformanceWindow();
  for (let i = 1; i <= 100; i++) p.add((i - 1) * 50, 101 - i);
  expect(p.summary()).toEqual({
    count: 100,
    fps: 20,
    mean: 50.5,
    p50: 50,
    p95: 95,
  });
});
it("retains only the latest bounded window and clears", () => {
  const p = new PerformanceWindow(2);
  p.add(0, 100);
  p.add(100, 2);
  p.add(200, 4);
  expect(p.summary()).toEqual({ count: 2, fps: 10, mean: 3, p50: 2, p95: 4 });
  p.clear();
  expect(p.summary().count).toBe(0);
});
