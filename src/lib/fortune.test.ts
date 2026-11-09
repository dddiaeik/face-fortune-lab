import { expect, it } from "vitest";
import { CARDS, getFortune, seoulDate } from "./fortune";
it("repeats for the same Seoul date and card", () => {
  expect(getFortune("seed", "2026-11-09")).toEqual(
    getFortune("seed", "2026-11-09"),
  );
});
it("uses card identity in deterministic selection and returns all fields", () => {
  const results = CARDS.map((c) => getFortune(c.id, "2026-11-09"));
  expect(
    new Set(results.map((r) => r.message + r.overall)).size,
  ).toBeGreaterThan(1);
  results.forEach((r, i) => {
    expect(r.cardId).toBe(CARDS[i].id);
    expect(Object.values(r).every(Boolean)).toBe(true);
  });
});
it("changes the day at Seoul midnight", () => {
  expect(seoulDate(new Date("2026-11-08T14:59:59Z"))).toBe("2026-11-08");
  expect(seoulDate(new Date("2026-11-08T15:00:00Z"))).toBe("2026-11-09");
});
