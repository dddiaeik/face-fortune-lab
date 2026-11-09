import { useCallback, useEffect, useRef, useState } from "react";
import type { FaceLandmarker } from "@mediapipe/tasks-vision";
import { cameraError, openCamera, stopStream } from "./camera";
import { createLandmarker } from "./landmarker";
import { drawLandmarks } from "./draw";
import { SmileGesture } from "../lib/smile";
import { PerformanceWindow } from "../lib/performance";
export type CameraStatus =
  "idle" | "permission" | "loading" | "running" | "error";
export function useFaceCamera(onSmile: () => void) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const session = useRef(0);
  const stream = useRef<MediaStream | null>(null);
  const detector = useRef<FaceLandmarker | null>(null);
  const frame = useRef(0);
  const callback = useRef(onSmile);
  useEffect(() => {
    callback.current = onSmile;
  }, [onSmile]);
  const [status, setStatus] = useState<CameraStatus>("idle");
  const [error, setError] = useState("");
  const [face, setFace] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadMs, setLoadMs] = useState<number | null>(null);
  const [stats, setStats] = useState(new PerformanceWindow().summary());
  const cleanup = useCallback(() => {
    session.current++;
    cancelAnimationFrame(frame.current);
    stopStream(stream.current);
    stream.current = null;
    detector.current?.close();
    detector.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    const canvas = canvasRef.current;
    canvas?.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
  }, []);
  useEffect(() => cleanup, [cleanup]);
  const stop = useCallback(() => {
    cleanup();
    setStatus("idle");
    setFace(false);
    setProgress(0);
    setStats(new PerformanceWindow().summary());
    setLoadMs(null);
    setError("");
  }, [cleanup]);
  const start = useCallback(async () => {
    cleanup();
    const id = session.current;
    setStatus("permission");
    setError("");
    setFace(false);
    setProgress(0);
    setStats(new PerformanceWindow().summary());
    setLoadMs(null);
    let stage = "camera";
    try {
      const media = await openCamera();
      if (id !== session.current) {
        stopStream(media);
        return;
      }
      stream.current = media;
      // Model resources are fetched only after explicit camera consent.
      stage = "model";
      setStatus("loading");
      const begin = performance.now();
      const model = await createLandmarker();
      if (id !== session.current) {
        model.close();
        return;
      }
      detector.current = model;
      setLoadMs(performance.now() - begin);
      const video = videoRef.current;
      if (!video) throw new Error("카메라 화면을 준비하지 못했어요.");
      video.srcObject = media;
      stage = "camera";
      await video.play();
      if (id !== session.current) return;
      setStatus("running");
      const gesture = new SmileGesture();
      const metrics = new PerformanceWindow();
      let lastVideoTime = -1;
      let lastAnalysis = -Infinity;
      let lastUI = -Infinity;
      const tick = (now: number) => {
        if (id !== session.current) return;
        try {
          if (
            video.readyState >= 2 &&
            video.currentTime !== lastVideoTime &&
            now - lastAnalysis >= 1000 / 30
          ) {
            // A background-tab pause is not evidence of a continuous smile.
            if (now - lastAnalysis > 250) {
              if (gesture.state === "holding") gesture.reset();
              if (gesture.state === "releasing") gesture.state = "latched";
            }
            lastVideoTime = video.currentTime;
            lastAnalysis = now;
            const t0 = performance.now();
            const result = model.detectForVideo(video, now);
            metrics.add(now, performance.now() - t0);
            const found = result.faceLandmarks.length > 0;
            const shapes = result.faceBlendshapes[0]?.categories ?? [];
            const left =
              shapes.find((c) => c.categoryName === "mouthSmileLeft")?.score ??
              0;
            const right =
              shapes.find((c) => c.categoryName === "mouthSmileRight")?.score ??
              0;
            const fired = gesture.update(left, right, found, now);
            if (canvasRef.current)
              drawLandmarks(
                canvasRef.current,
                video.videoWidth,
                video.videoHeight,
                result.faceLandmarks[0],
              );
            if (now - lastUI >= 150 || fired) {
              setFace(found);
              setProgress(gesture.progress);
              setStats(metrics.summary());
              lastUI = now;
            }
            if (fired) callback.current();
          }
          frame.current = requestAnimationFrame(tick);
        } catch {
          cleanup();
          setFace(false);
          setProgress(0);
          setStatus("error");
          setError(
            "얼굴 분석이 중단되었어요. 카메라를 다시 시작하거나 버튼을 이용해 주세요.",
          );
        }
      };
      frame.current = requestAnimationFrame(tick);
    } catch (cause) {
      if (id !== session.current) return;
      cleanup();
      setStatus("error");
      setError(
        stage === "model"
          ? "얼굴 모델을 불러오지 못했어요. 인터넷 연결 또는 리소스 접근을 확인하고 다시 시도해 주세요."
          : cameraError(cause),
      );
    }
  }, [cleanup]);
  return {
    videoRef,
    canvasRef,
    status,
    error,
    face,
    progress,
    stats,
    loadMs,
    start,
    stop,
  };
}
