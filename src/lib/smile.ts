export const SMILE_CONFIG = {
  threshold: 0.55,
  releaseThreshold: 0.3,
  holdMs: 700,
  releaseMs: 350,
};
export type SmileConfig = typeof SMILE_CONFIG;
export type SmileState = "ready" | "holding" | "latched" | "releasing";
/** Monotonic timestamps in ms; both sides must smile. Release is required to rearm. */
export class SmileGesture {
  state: SmileState = "ready";
  private since = 0;
  progress = 0;
  constructor(readonly config: SmileConfig = SMILE_CONFIG) {}
  reset() {
    this.state = "ready";
    this.since = 0;
    this.progress = 0;
  }
  update(left: number, right: number, face: boolean, now: number): boolean {
    if (!face) {
      this.reset();
      return false;
    }
    const score = Math.min(left, right);
    if (this.state === "latched" || this.state === "releasing") {
      if (score < this.config.releaseThreshold) {
        if (this.state !== "releasing") {
          this.state = "releasing";
          this.since = now;
        }
        if (now - this.since >= this.config.releaseMs) this.reset();
      } else this.state = "latched";
      return false;
    }
    if (score < this.config.threshold) {
      this.reset();
      return false;
    }
    if (this.state === "ready") {
      this.state = "holding";
      this.since = now;
    }
    this.progress = Math.min(1, (now - this.since) / this.config.holdMs);
    if (this.progress >= 1) {
      this.state = "latched";
      return true;
    }
    return false;
  }
}
