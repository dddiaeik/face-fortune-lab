import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
export const WASM_URL =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.32/wasm";
export const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";
export async function createLandmarker() {
  const files = await FilesetResolver.forVisionTasks(WASM_URL);
  return FaceLandmarker.createFromOptions(files, {
    baseOptions: { modelAssetPath: MODEL_URL, delegate: "CPU" },
    runningMode: "VIDEO",
    numFaces: 1,
    outputFaceBlendshapes: true,
  });
}
