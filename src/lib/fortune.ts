export const CARDS = [
  { id: "seed", name: "새로운 씨앗", symbol: "✧" },
  { id: "breeze", name: "다정한 바람", symbol: "〰" },
  { id: "star", name: "작은 별빛", symbol: "✳" },
] as const;
export type CardId = (typeof CARDS)[number]["id"];
const content = {
  overall: [
    "작은 시작이 기분 좋은 변화를 만들어요. 미뤄둔 일 하나를 가볍게 시작해 보세요.",
    "익숙한 하루에서도 새로운 즐거움을 발견할 수 있어요. 주변을 천천히 둘러보세요.",
    "서두르지 않아도 괜찮아요. 오늘은 나만의 속도를 지켜보세요.",
  ],
  love: [
    "고마운 사람에게 짧은 안부를 건네보세요.",
    "이야기를 끝까지 들어주는 마음이 빛나는 날이에요.",
    "나 자신에게도 다정한 말을 건네보세요.",
  ],
  money: [
    "작은 지출을 돌아보며 나만의 기준을 정해보세요.",
    "필요한 것과 원하는 것을 적어보면 마음이 가벼워져요.",
    "오늘은 이미 가진 것의 가치를 발견해 보세요.",
  ],
  study: [
    "작은 목표 하나를 끝내며 자신감을 쌓아보세요.",
    "막혔던 문제는 잠깐 쉬고 새롭게 바라보세요.",
    "배운 것을 한 줄로 정리하면 다음 걸음이 선명해져요.",
  ],
  color: ["세이지 그린", "살구빛 오렌지", "하늘색", "크림 옐로", "라벤더"],
  message: [
    "오늘의 작은 미소가 좋은 시작이 될 거예요.",
    "당신의 속도로 피어나도 괜찮아요.",
    "완벽한 하루보다 다정한 하루를 만들어보세요.",
    "작은 용기에도 충분한 의미가 있어요.",
  ],
};
export function seoulDate(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
function hash(input: string): number {
  let value = 2166136261;
  for (const char of input)
    value = Math.imul(value ^ char.charCodeAt(0), 16777619);
  return value >>> 0;
}
export function getFortune(cardId: CardId, date = seoulDate()) {
  const pick = (key: keyof typeof content) => {
    const values = content[key];
    return values[hash(`${date}:${cardId}:${key}`) % values.length];
  };
  return {
    cardId,
    date,
    overall: pick("overall"),
    love: pick("love"),
    money: pick("money"),
    study: pick("study"),
    color: pick("color"),
    message: pick("message"),
  };
}
export type Fortune = ReturnType<typeof getFortune>;
