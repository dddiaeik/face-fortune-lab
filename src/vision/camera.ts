export async function openCamera() {
  if (!navigator.mediaDevices?.getUserMedia)
    throw new Error(
      "이 브라우저에서는 카메라를 사용할 수 없어요. HTTPS 연결 또는 지원 브라우저를 확인해 주세요.",
    );
  return navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      facingMode: "user",
      width: { ideal: 640 },
      height: { ideal: 480 },
    },
  });
}
export function stopStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}
export function cameraError(error: unknown): string {
  if (error instanceof DOMException) {
    if (["NotAllowedError", "SecurityError"].includes(error.name))
      return "카메라 권한이 거부되었어요. 브라우저 설정에서 허용하거나 버튼으로 카드를 열어보세요.";
    if (["NotFoundError", "OverconstrainedError"].includes(error.name))
      return "사용 가능한 카메라가 없어요. 버튼으로도 체험할 수 있어요.";
    if (error.name === "NotReadableError")
      return "카메라를 열 수 없어요. 다른 앱에서 사용 중인지 확인해 주세요.";
  }
  return error instanceof Error ? error.message : "카메라를 시작할 수 없어요.";
}
