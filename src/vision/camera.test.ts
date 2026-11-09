import { expect, it } from "vitest";
import { cameraError } from "./camera";
it("distinguishes permission, unavailable hardware and busy devices", () => {
  expect(cameraError(new DOMException("", "NotAllowedError"))).toContain(
    "권한",
  );
  expect(cameraError(new DOMException("", "NotFoundError"))).toContain(
    "카메라가 없",
  );
  expect(cameraError(new DOMException("", "NotReadableError"))).toContain(
    "다른 앱",
  );
});
