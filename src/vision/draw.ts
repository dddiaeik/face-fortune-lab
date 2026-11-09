import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
export function drawLandmarks(
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  landmarks: NormalizedLandmark[] = [],
) {
  if (canvas.width !== width) canvas.width = width;
  if (canvas.height !== height) canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#b7f8cf";
  for (const point of landmarks) {
    ctx.beginPath();
    ctx.arc(point.x * width, point.y * height, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }
}
