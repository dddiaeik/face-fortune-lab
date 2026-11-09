import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import { createLandmarker } from "./vision/landmarker";
vi.mock("./vision/landmarker", () => ({ createLandmarker: vi.fn() }));
beforeEach(() => {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
it("opens a complete fortune using only the manual button and switches cards", async () => {
  const getUserMedia = vi.fn();
  Object.defineProperty(navigator, "mediaDevices", {
    value: { getUserMedia },
    configurable: true,
  });
  render(<App />);
  const user = userEvent.setup();
  await user.click(
    screen.getByRole("button", { name: /오늘의 운세 카드 열기/ }),
  );
  expect(screen.getByText("애정운")).toBeTruthy();
  expect(screen.getByText("금전운")).toBeTruthy();
  expect(screen.getByText("학업·취업운")).toBeTruthy();
  expect(screen.getByText("행운의 색상")).toBeTruthy();
  await user.click(screen.getByRole("radio", { name: /다정한 바람/ }));
  expect(screen.queryByText("애정운")).toBeNull();
  await user.tab();
  await user.tab();
  screen.getByRole("button", { name: /오늘의 운세 카드 열기/ }).focus();
  await user.keyboard("{Enter}");
  expect(screen.getByText("애정운")).toBeTruthy();
  expect(getUserMedia).not.toHaveBeenCalled();
  expect(createLandmarker).not.toHaveBeenCalled();
});
it("explains permission denial and keeps manual path usable", async () => {
  Object.defineProperty(navigator, "mediaDevices", {
    value: {
      getUserMedia: vi
        .fn()
        .mockRejectedValue(new DOMException("denied", "NotAllowedError")),
    },
    configurable: true,
  });
  render(<App />);
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: /카메라 시작하기/ }));
  expect((await screen.findByRole("alert")).textContent).toContain(
    "권한이 거부",
  );
  await user.click(
    screen.getByRole("button", { name: /오늘의 운세 카드 열기/ }),
  );
  expect(screen.getByText("애정운")).toBeTruthy();
});
it("stops a stream that arrives after cancellation", async () => {
  let resolve!: (value: MediaStream) => void;
  const stop = vi.fn();
  Object.defineProperty(navigator, "mediaDevices", {
    value: {
      getUserMedia: vi.fn(
        () =>
          new Promise<MediaStream>((r) => {
            resolve = r;
          }),
      ),
    },
    configurable: true,
  });
  render(<App />);
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: /카메라 시작하기/ }));
  await user.click(screen.getByRole("button", { name: /카메라 중지/ }));
  resolve({ getTracks: () => [{ stop }] } as unknown as MediaStream);
  await waitFor(() => expect(stop).toHaveBeenCalledOnce());
  expect(createLandmarker).not.toHaveBeenCalled();
});
it("stops camera tracks when model loading fails", async () => {
  const stop = vi.fn();
  Object.defineProperty(navigator, "mediaDevices", {
    value: {
      getUserMedia: vi.fn().mockResolvedValue({ getTracks: () => [{ stop }] }),
    },
    configurable: true,
  });
  vi.mocked(createLandmarker).mockRejectedValueOnce(new Error("network"));
  render(<App />);
  await userEvent
    .setup()
    .click(screen.getByRole("button", { name: /카메라 시작하기/ }));
  expect((await screen.findByRole("alert")).textContent).toContain("모델");
  expect(stop).toHaveBeenCalledOnce();
});

it("processes unique frames, opens on sustained smile and releases resources", async () => {
  const stop = vi.fn();
  const close = vi.fn();
  Object.defineProperty(navigator, "mediaDevices", {
    value: {
      getUserMedia: vi.fn().mockResolvedValue({ getTracks: () => [{ stop }] }),
    },
    configurable: true,
  });
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
  vi.spyOn(HTMLMediaElement.prototype, "readyState", "get").mockReturnValue(4);
  let videoTime = 0;
  vi.spyOn(HTMLMediaElement.prototype, "currentTime", "get").mockImplementation(
    () => videoTime,
  );
  let nextFrame!: FrameRequestCallback;
  vi.stubGlobal(
    "requestAnimationFrame",
    vi.fn((cb: FrameRequestCallback) => {
      nextFrame = cb;
      return 1;
    }),
  );
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
  const result = {
    faceLandmarks: [[{ x: 0.5, y: 0.5, z: 0 }]],
    faceBlendshapes: [
      {
        categories: [
          { categoryName: "mouthSmileLeft", score: 0.8 },
          { categoryName: "mouthSmileRight", score: 0.8 },
        ],
      },
    ],
  };
  const detectForVideo = vi.fn(() => result);
  vi.mocked(createLandmarker).mockResolvedValueOnce({
    detectForVideo,
    close,
  } as unknown as Awaited<ReturnType<typeof createLandmarker>>);
  const view = render(<App />);
  await userEvent
    .setup()
    .click(screen.getByRole("button", { name: /카메라 시작하기/ }));
  await waitFor(() =>
    expect(screen.getByRole("button", { name: /카메라 중지/ })).toBeTruthy(),
  );
  for (let i = 0; i <= 8; i++) {
    videoTime = i / 10;
    act(() => nextFrame(i * 100));
  }
  expect(screen.getByText("애정운")).toBeTruthy();
  expect(detectForVideo).toHaveBeenCalledTimes(9);
  act(() => nextFrame(1000)); // same video frame must be skipped
  expect(detectForVideo).toHaveBeenCalledTimes(9);
  view.unmount();
  expect(stop).toHaveBeenCalledOnce();
  expect(close).toHaveBeenCalledOnce();
});
it("closes a model that finishes loading after unmount", async () => {
  const stop = vi.fn();
  const close = vi.fn();
  let finish!: (model: Awaited<ReturnType<typeof createLandmarker>>) => void;
  Object.defineProperty(navigator, "mediaDevices", {
    value: {
      getUserMedia: vi.fn().mockResolvedValue({ getTracks: () => [{ stop }] }),
    },
    configurable: true,
  });
  vi.mocked(createLandmarker).mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  const view = render(<App />);
  await userEvent
    .setup()
    .click(screen.getByRole("button", { name: /카메라 시작하기/ }));
  await waitFor(() => expect(finish).toBeTypeOf("function"));
  view.unmount();
  await act(async () =>
    finish({ close } as unknown as Awaited<
      ReturnType<typeof createLandmarker>
    >),
  );
  expect(stop).toHaveBeenCalledOnce();
  expect(close).toHaveBeenCalledOnce();
});
