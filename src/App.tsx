import { useCallback, useState } from "react";
import { CARDS, getFortune, type CardId, type Fortune } from "./lib/fortune";
import { useFaceCamera } from "./vision/useFaceCamera";
import "./styles.css";
import { FortuneCard } from "./components/FortuneCard";
export default function App() {
  const [selected, setSelected] = useState<CardId>("seed");
  const [fortune, setFortune] = useState<Fortune | null>(null);
  const open = useCallback(() => setFortune(getFortune(selected)), [selected]);
  const {
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
  } = useFaceCamera(open);
  const active = ["permission", "loading", "running"].includes(status);
  const statusText =
    status === "permission"
      ? "카메라 권한을 기다리고 있어요"
      : status === "loading"
        ? "얼굴 분석 모델을 준비하고 있어요…"
        : status === "running"
          ? face
            ? "얼굴을 찾았어요 · 편안하게 웃어보세요"
            : "얼굴이 보이지 않아요 · 화면 중앙을 바라봐 주세요"
          : status === "error"
            ? "카메라 연결을 확인해 주세요"
            : "카메라 없이도 아래 버튼으로 시작할 수 있어요";
  return (
    <div className="app-shell">
      <header>
        <a className="brand" href="#">
          <span className="brand-mark">✳</span>
          <span>
            표정 운세 연구소<small>FACE FORTUNE LAB</small>
          </span>
        </a>
        <span className="edition">
          EXPERIMENT 001 <span>·</span> 오늘의 미소
        </span>
      </header>
      <main>
        <section className="intro">
          <div className="eyebrow">
            <span /> A LITTLE SMILE, A LITTLE LUCK
          </div>
          <h1>
            오늘의 행운은,
            <br />
            <em>당신의 미소에서.</em>
          </h1>
          <p>
            잠깐 웃어볼까요? 미소로 카드를 열고
            <br />
            오늘을 위한 작은 메시지를 만나보세요.
          </p>
        </section>
        <div className="experience-grid">
          <section className="camera-panel" aria-labelledby="camera-title">
            <div className="panel-heading">
              <h2 id="camera-title">
                <span className="step">01</span> 미소를 준비해요
              </h2>
              <span className="local-badge">◉ 기기 안에서만 처리</span>
            </div>
            <div className={`viewfinder ${status === "running" ? "live" : ""}`}>
              <video
                ref={videoRef}
                muted
                playsInline
                aria-label="내 카메라 영상"
              />
              <canvas ref={canvasRef} aria-label="얼굴 랜드마크" />
              {status !== "running" && (
                <div className="camera-placeholder">
                  <div className="orbit">
                    <span>⌣</span>
                    <i />
                    <b>✧</b>
                  </div>
                  <h3>
                    {status === "loading"
                      ? "미소를 만날 준비 중"
                      : "당신의 미소를 기다려요"}
                  </h3>
                  <p>
                    카메라를 켜고 약 0.7초 동안 웃어주세요.
                    <br />
                    미소는 카드를 여는 열쇠로만 사용돼요.
                  </p>
                </div>
              )}
              <div className="frame-corner tl" />
              <div className="frame-corner tr" />
              <div className="frame-corner bl" />
              <div className="frame-corner br" />
              <div className="video-label">
                <span className={face ? "dot on" : "dot"} />
                {status === "running" ? "LIVE · MIRRORED" : "CAMERA STANDBY"}
              </div>
            </div>
            <div className="camera-controls">
              <p role="status">{statusText}</p>
              <div
                className="progress-track"
                role="progressbar"
                aria-label="미소 유지 진행률"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(progress * 100)}
              >
                <div style={{ width: `${progress * 100}%` }} />
              </div>
              <button className="camera-button" onClick={active ? stop : start}>
                {active
                  ? "카메라 중지"
                  : status === "error"
                    ? "카메라 다시 시작"
                    : "카메라 시작하기"}{" "}
                <span>{active ? "■" : "↗"}</span>
              </button>
              {error && (
                <p className="error" role="alert">
                  {error}
                </p>
              )}
            </div>
            <p className="privacy-note">
              ♧ 영상과 얼굴 정보는 전송·저장하지 않아요.
              <br />
              카메라 시작 시 모델 파일 다운로드를 위한 인터넷 연결이 필요해요.
            </p>
          </section>
          <section className="fortune-panel" aria-labelledby="fortune-title">
            <div className="panel-heading">
              <h2 id="fortune-title">
                <span className="step">02</span> 오늘의 카드를 열어요
              </h2>
              <span className="tiny-label">DAILY FORTUNE</span>
            </div>
            <fieldset>
              <legend>마음이 가는 카드를 선택하세요</legend>
              <div className="card-picker">
                {CARDS.map((card, i) => (
                  <label
                    className={`choice ${selected === card.id ? "selected" : ""}`}
                    key={card.id}
                  >
                    <input
                      type="radio"
                      name="fortune-card"
                      value={card.id}
                      checked={selected === card.id}
                      onChange={() => {
                        setSelected(card.id);
                        setFortune(null);
                      }}
                    />
                    <span className="card-index">0{i + 1}</span>
                    <span className="card-symbol">{card.symbol}</span>
                    <span>{card.name}</span>
                    <span className="choice-indicator">
                      {selected === card.id ? "●" : "○"}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <FortuneCard fortune={fortune} />
            <button className="open-button" onClick={open}>
              {fortune ? "선택한 카드 다시 보기" : "오늘의 운세 카드 열기"}{" "}
              <span>✧</span>
            </button>
            <p className="manual-note">
              카메라 없이도 클릭·터치·키보드로 열 수 있어요.
            </p>
          </section>
        </div>
        <details className="dev-panel">
          <summary>
            개발자 패널 <span>PERFORMANCE & DIAGNOSTICS</span>
          </summary>
          <div className="metrics">
            {[
              ["분석 FPS", stats.fps.toFixed(1)],
              ["평균 추론", `${stats.mean.toFixed(1)} ms`],
              [
                "P50 / P95",
                `${stats.p50.toFixed(1)} / ${stats.p95.toFixed(1)} ms`,
              ],
              ["최근 표본", `${stats.count} / 120`],
              ["얼굴 감지", face ? "감지됨" : "미감지"],
              ["모델 로딩", loadMs === null ? "—" : `${loadMs.toFixed(0)} ms`],
            ].map(([label, value]) => (
              <div key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
          <p>
            양쪽 미소 ≥ 0.55 · 700ms 유지 · 양쪽 중 작은 값 &lt; 0.30에서 350ms
            후 재무장
          </p>
        </details>
        <aside className="disclaimer">
          ✧{" "}
          <span>
            재미를 위한 운세 체험이며 실제 미래를 예측하지 않습니다.
            <br />
            <small>
              표정은 카드 선택에만 사용되며, 얼굴 특징으로 성격이나 운명을
              판단하지 않아요.
            </small>
          </span>
        </aside>
      </main>
      <footer>
        <span>FACE FORTUNE LAB</span>
        <span>오늘도, 가볍게 웃어보세요. ☺</span>
        <span>LOCAL FIRST · V1.0</span>
      </footer>
    </div>
  );
}
