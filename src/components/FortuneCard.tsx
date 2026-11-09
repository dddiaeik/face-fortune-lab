import type { Fortune } from "../lib/fortune";

export function FortuneCard({ fortune }: { fortune: Fortune | null }) {
  return (
    <div
      className={`result-card ${fortune ? "opened" : ""}`}
      aria-live="polite"
      aria-atomic="true"
    >
      {fortune ? (
        <>
          <div className="result-heading">
            <span>YOUR DAILY NOTE</span>
            <time>{fortune.date} · 서울</time>
          </div>
          <span className="result-spark">✧</span>
          <h3>{fortune.message}</h3>
          <p className="overall">{fortune.overall}</p>
          <dl>
            <div>
              <dt>애정운</dt>
              <dd>{fortune.love}</dd>
            </div>
            <div>
              <dt>금전운</dt>
              <dd>{fortune.money}</dd>
            </div>
            <div>
              <dt>학업·취업운</dt>
              <dd>{fortune.study}</dd>
            </div>
            <div>
              <dt>행운의 색상</dt>
              <dd>{fortune.color}</dd>
            </div>
          </dl>
          <p className="entertainment">재미로 만나보는 오늘의 메시지예요.</p>
        </>
      ) : (
        <>
          <span className="seal">✳</span>
          <div className="envelope-line" />
          <span className="unopened-label">A MESSAGE FOR YOU</span>
          <h3>어떤 하루가 기다리고 있을까요?</h3>
          <p>
            미소를 짓거나 아래 버튼을 눌러
            <br />
            선택한 카드의 이야기를 확인해 보세요.
          </p>
        </>
      )}
    </div>
  );
}
