export type Sample = { at: number; duration: number };
export class PerformanceWindow {
  private samples: Sample[] = [];
  constructor(private limit = 120) {}
  add(at: number, duration: number) {
    this.samples.push({ at, duration });
    if (this.samples.length > this.limit) this.samples.shift();
  }
  clear() {
    this.samples = [];
  }
  summary() {
    const count = this.samples.length;
    if (!count) return { count: 0, fps: 0, mean: 0, p50: 0, p95: 0 };
    const sorted = this.samples.map((s) => s.duration).sort((a, b) => a - b);
    const percentile = (p: number) => sorted[Math.ceil(p * count) - 1];
    const elapsed = this.samples[count - 1].at - this.samples[0].at;
    return {
      count,
      fps: count > 1 && elapsed > 0 ? ((count - 1) * 1000) / elapsed : 0,
      mean: sorted.reduce((a, b) => a + b, 0) / count,
      p50: percentile(0.5),
      p95: percentile(0.95),
    };
  }
}
