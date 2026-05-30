// 가상 뷰티샵 500+개. 익명화 + 풍부한 운영 정보 + 가상 후기 (모두 검증용 샘플).
// 실제 가게 X. 좌표는 동네별 실제 위경도 ± 반경 (mock).

export type ServiceCategory = "네일" | "속눈썹" | "왁싱" | "반영구";

export type District =
  | "강남"
  | "홍대"
  | "성수"
  | "노원"
  | "합정"
  | "잠실"
  | "이태원"
  | "건대"
  | "상계"
  | "미아"
  | "신림"
  | "사당"
  | "망원"
  | "천호"
  | "한남"
  | "목동"
  | "영등포"
  | "청량리";

export type Menu = { name: string; price: number };
export type Review = { text: string; rating: number };

export type Shop = {
  id: string;
  // 익명화 — 동네 + 카테고리 + 영업특성 조합. 실제 가게명 X.
  displayName: string;
  category: ServiceCategory;
  district: District;
  specialty: string; // 영업 특성 (이름에도 포함, 모달에도)
  // 위치
  lat: number;
  lng: number;
  x: number;
  y: number;
  // 운영 정보
  yearsInBusiness: number;
  repeatRate: number; // 재방문율 %
  visitCount: number; // 누적 방문 횟수 (가상)
  rating: number;
  reviewCount: number;
  openHours: string;
  menu: Menu[]; // 3개 메뉴
  // 할인
  originalPrice: number; // signature 메뉴 원가
  discountedPrice: number;
  emptySlot: string;
  walkMinutes: number;
  // 가상 후기
  reviews: Review[];
};

// 18개 동네 — 상권 sub-spot 기반 분산 (아파트/대사관/공원 등 비상업지 회피)
// 각 동네별 hotSpots: 실제 상가 거리/역 부근 좌표.
// 분산 시: hotSpots 중 랜덤 픽 → ±100~200m 미세 분산
type DistrictDef = {
  cx: number;
  cy: number;
  range: number;
  hotSpots: Array<{ lat: number; lng: number }>;
  spread: number; // hotSpot 주변 분산 반경 (도 단위, 약 0.0015 = 150m)
};

const DISTRICTS: Record<string, DistrictDef> = {
  // 강남: 강남역·논현·신논현·역삼 상권
  강남: {
    cx: 520, cy: 720, range: 90, spread: 0.0018,
    hotSpots: [
      { lat: 37.4979, lng: 127.0276 }, // 강남역 11번 출구
      { lat: 37.5037, lng: 127.0247 }, // 논현역
      { lat: 37.5045, lng: 127.0258 }, // 신논현역
      { lat: 37.5006, lng: 127.0364 }, // 역삼동 카페거리
      { lat: 37.4960, lng: 127.0294 }, // 강남대로 상권
    ],
  },
  // 홍대: 홍대입구·어울마당·연남
  홍대: {
    cx: 220, cy: 380, range: 70, spread: 0.0015,
    hotSpots: [
      { lat: 37.5562, lng: 126.9229 }, // 홍대입구역 9번 출구
      { lat: 37.5546, lng: 126.9244 }, // 어울마당로
      { lat: 37.5586, lng: 126.9276 }, // 연남동 카페거리
      { lat: 37.5530, lng: 126.9259 }, // 홍대 정문 상권
    ],
  },
  // 성수: 성수역·연무장·서울숲
  성수: {
    cx: 700, cy: 350, range: 75, spread: 0.0017,
    hotSpots: [
      { lat: 37.5447, lng: 127.0557 }, // 성수역
      { lat: 37.5435, lng: 127.0489 }, // 성수동 카페거리
      { lat: 37.5418, lng: 127.0560 }, // 연무장5길
      { lat: 37.5469, lng: 127.0466 }, // 서울숲역 부근
    ],
  },
  // 합정: 합정역·메세나폴리스
  합정: {
    cx: 160, cy: 460, range: 60, spread: 0.0014,
    hotSpots: [
      { lat: 37.5495, lng: 126.9134 }, // 합정역
      { lat: 37.5483, lng: 126.9189 }, // 합정 동쪽 상권
      { lat: 37.5507, lng: 126.9134 }, // 합정역 북쪽
    ],
  },
  // 노원: 노원역·중계
  노원: {
    cx: 760, cy: 90, range: 70, spread: 0.0018,
    hotSpots: [
      { lat: 37.6542, lng: 127.0568 }, // 노원역
      { lat: 37.6585, lng: 127.0608 }, // 노원프라자
      { lat: 37.6516, lng: 127.0608 }, // 노원역 동쪽
    ],
  },
  // 잠실: 잠실역·송리단길
  잠실: {
    cx: 820, cy: 780, range: 70, spread: 0.0016,
    hotSpots: [
      { lat: 37.5135, lng: 127.0998 }, // 잠실역
      { lat: 37.5141, lng: 127.1054 }, // 잠실새내역
      { lat: 37.5168, lng: 127.1067 }, // 송리단길
    ],
  },
  // 이태원: 이태원역·경리단·해방촌
  이태원: {
    cx: 400, cy: 580, range: 60, spread: 0.0014,
    hotSpots: [
      { lat: 37.5345, lng: 126.9944 }, // 이태원역
      { lat: 37.5328, lng: 126.9988 }, // 이태원 메인거리
      { lat: 37.5355, lng: 126.9851 }, // 경리단길
    ],
  },
  // 건대: 건대입구·로데오
  건대: {
    cx: 870, cy: 460, range: 65, spread: 0.0015,
    hotSpots: [
      { lat: 37.5403, lng: 127.0698 }, // 건대입구역
      { lat: 37.5395, lng: 127.0682 }, // 커먼그라운드
      { lat: 37.5421, lng: 127.0704 }, // 건대 로데오거리
    ],
  },
  // 상계: 상계역·상계 메인
  상계: {
    cx: 800, cy: 50, range: 60, spread: 0.0018,
    hotSpots: [
      { lat: 37.6720, lng: 127.0566 }, // 상계역
      { lat: 37.6743, lng: 127.0598 }, // 상계백병원 옆 상권
    ],
  },
  // 미아: 미아사거리
  미아: {
    cx: 650, cy: 200, range: 60, spread: 0.0016,
    hotSpots: [
      { lat: 37.6260, lng: 127.0257 }, // 미아사거리역
      { lat: 37.6306, lng: 127.0258 }, // 미아동 상권
    ],
  },
  // 신림: 신림역·서울대입구
  신림: {
    cx: 280, cy: 800, range: 65, spread: 0.0017,
    hotSpots: [
      { lat: 37.4842, lng: 126.9296 }, // 신림역
      { lat: 37.4853, lng: 126.9314 }, // 신림 메인거리
      { lat: 37.4815, lng: 126.9272 }, // 신림 남쪽 상권
    ],
  },
  // 사당: 사당역
  사당: {
    cx: 380, cy: 760, range: 55, spread: 0.0015,
    hotSpots: [
      { lat: 37.4763, lng: 126.9817 }, // 사당역
      { lat: 37.4798, lng: 126.9810 }, // 사당역 북쪽
    ],
  },
  // 망원: 망원역·망리단길
  망원: {
    cx: 130, cy: 420, range: 55, spread: 0.0014,
    hotSpots: [
      { lat: 37.5562, lng: 126.9000 }, // 망원역
      { lat: 37.5556, lng: 126.9112 }, // 망리단길
      { lat: 37.5572, lng: 126.9020 }, // 망원시장 부근
    ],
  },
  // 천호: 천호역·로데오
  천호: {
    cx: 900, cy: 700, range: 60, spread: 0.0016,
    hotSpots: [
      { lat: 37.5384, lng: 127.1234 }, // 천호역
      { lat: 37.5395, lng: 127.1217 }, // 천호 로데오
    ],
  },
  // 한남: 한남역·이태원동
  한남: {
    cx: 440, cy: 540, range: 50, spread: 0.0012,
    hotSpots: [
      { lat: 37.5345, lng: 127.0035 }, // 한남역
      { lat: 37.5363, lng: 127.0020 }, // 한남오거리
    ],
  },
  // 목동: 오목교·목동역
  목동: {
    cx: 80, cy: 600, range: 60, spread: 0.0018,
    hotSpots: [
      { lat: 37.5408, lng: 126.8746 }, // 목동역
      { lat: 37.5326, lng: 126.8757 }, // 오목교 메인
    ],
  },
  // 영등포: 영등포역·타임스퀘어
  영등포: {
    cx: 250, cy: 620, range: 60, spread: 0.0016,
    hotSpots: [
      { lat: 37.5159, lng: 126.9069 }, // 영등포역
      { lat: 37.5169, lng: 126.9034 }, // 타임스퀘어
    ],
  },
  // 청량리: 청량리역·회기
  청량리: {
    cx: 580, cy: 320, range: 60, spread: 0.0015,
    hotSpots: [
      { lat: 37.5805, lng: 127.0468 }, // 청량리역
      { lat: 37.5839, lng: 127.0467 }, // 회기역 부근
    ],
  },
};

// 카테고리별 영업 특성 풀
const SPECIALTIES: Record<ServiceCategory, string[]> = {
  네일: [
    "그라데이션 전문",
    "젤 디자인 풍성",
    "심플 클래식 전문",
    "케어 + 영양 전문",
    "내추럴 무드",
    "프렌치 전문",
    "큐티클 관리 꼼꼼",
    "1인 프라이빗",
    "예약제 운영",
    "디자인 추천 강함",
    "트렌드 패턴 빠름",
    "젤 제거 친절",
  ],
  속눈썹: [
    "내추럴 펌 전문",
    "JC컬 풍성",
    "포인트 익스텐션",
    "리프팅 전문",
    "케라틴 펌",
    "1인 프라이빗",
    "민감 눈 전문",
    "보충 신속",
    "자연스러운 결",
    "오래 가는 컬",
  ],
  왁싱: [
    "통증 적은 시술",
    "민감 피부 전문",
    "여성 전용 공간",
    "위생 1등급",
    "1인 운영",
    "예약 전용",
    "프라이빗 룸",
    "비키니 라인 친절",
    "전체 케어 꼼꼼",
  ],
  반영구: [
    "자연스러운 결 전문",
    "디자인 보정 강함",
    "보색 전문",
    "터치업 친절",
    "1인 프라이빗",
    "오래 유지되는 색감",
    "1:1 상담 길게",
    "초보 자연스럽게",
  ],
};

// 카테고리별 메뉴 풀 (이름, 가격 범위)
const MENU_POOL: Record<ServiceCategory, Array<{ name: string; min: number; max: number }>> = {
  네일: [
    { name: "원톤 젤", min: 25000, max: 45000 },
    { name: "프렌치", min: 32000, max: 50000 },
    { name: "그라데이션", min: 38000, max: 60000 },
    { name: "디자인 풀세트", min: 50000, max: 90000 },
    { name: "케어 + 매니큐어", min: 18000, max: 35000 },
    { name: "젤 제거", min: 10000, max: 22000 },
  ],
  속눈썹: [
    { name: "내추럴 풀세트", min: 50000, max: 75000 },
    { name: "볼륨 풀세트", min: 65000, max: 95000 },
    { name: "리프팅 펌", min: 40000, max: 60000 },
    { name: "케라틴 펌", min: 50000, max: 75000 },
    { name: "부분 보충", min: 25000, max: 40000 },
  ],
  왁싱: [
    { name: "겨드랑이", min: 15000, max: 22000 },
    { name: "비키니 라인", min: 25000, max: 40000 },
    { name: "팔 전체", min: 30000, max: 45000 },
    { name: "다리 전체", min: 45000, max: 70000 },
    { name: "얼굴 솜털", min: 18000, max: 28000 },
    { name: "등 왁싱", min: 35000, max: 55000 },
  ],
  반영구: [
    { name: "눈썹 자연결", min: 100000, max: 180000 },
    { name: "아이라인 점막", min: 80000, max: 150000 },
    { name: "입술 톤업", min: 150000, max: 250000 },
    { name: "헤어라인 보강", min: 200000, max: 350000 },
    { name: "터치업", min: 50000, max: 100000 },
  ],
};

// 카테고리별 가상 후기 풀 — 모두 검증용 샘플 (UI에 명시)
const REVIEW_POOL: Record<ServiceCategory, string[]> = {
  네일: [
    "디자인 너무 예쁘게 나왔어요",
    "젤 두께가 얇아서 부담 없어요",
    "원장님이 친절하시고 시술 빨라요",
    "원하는 톤 잘 잡아주세요",
    "케어까지 꼼꼼하게 해주세요",
    "디자인 추천 잘 해주세요",
    "마감 깔끔해요. 곧 또 갈게요",
    "다른 가게보다 오래 가는 느낌이에요",
  ],
  속눈썹: [
    "내추럴하게 잘 나왔어요",
    "컬이 오래 가요",
    "눈이 안 따가워요",
    "원장님 시술 정확하세요",
    "예쁘게 잘 붙여주세요",
    "자연스러워서 마음에 들어요",
    "보충도 친절하게 해주세요",
  ],
  왁싱: [
    "통증이 거의 없어요",
    "꼼꼼하게 케어해주세요",
    "분위기가 편해요",
    "위생 신뢰 가요",
    "처음인데 친절하게 알려주세요",
    "프라이빗 공간이라 좋아요",
  ],
  반영구: [
    "자연스럽게 잘 잡아주세요",
    "결 시안 그대로 나왔어요",
    "꼼꼼하게 상담해주세요",
    "터치업도 친절해요",
    "색감이 오래 가는 느낌이에요",
    "초보인데 잘 안내해주세요",
  ],
};

const TIME_SLOTS = [
  "오늘 14:00",
  "오늘 14:30",
  "오늘 15:00",
  "오늘 15:30",
  "오늘 16:00",
  "오늘 17:00",
  "오늘 17:30",
  "오늘 18:00",
  "오늘 19:00",
  "오늘 20:00",
  "내일 11:00",
  "내일 12:00",
  "내일 13:00",
  "내일 14:00",
];

const OPEN_HOURS = [
  "10:00 - 21:00",
  "11:00 - 22:00",
  "10:30 - 20:30",
  "12:00 - 21:00",
  "10:00 - 20:00",
  "11:00 - 21:00",
];

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function generate(): Shop[] {
  const rand = seeded(7919);
  const pick = <T,>(arr: readonly T[]) => arr[Math.floor(rand() * arr.length)];

  const districts = Object.keys(DISTRICTS) as District[];
  const cats: ServiceCategory[] = ["네일", "속눈썹", "왁싱", "반영구"];

  // 카테고리 분배 (500개): 네일 200, 속눈썹 140, 왁싱 70, 반영구 90
  const catDist: ServiceCategory[] = [];
  cats.forEach((c) => {
    const n = c === "네일" ? 200 : c === "속눈썹" ? 140 : c === "왁싱" ? 70 : 90;
    for (let i = 0; i < n; i++) catDist.push(c);
  });
  catDist.sort(() => rand() - 0.5);

  const shops: Shop[] = [];
  let id = 1;

  for (const cat of catDist) {
    const district = districts[Math.floor(rand() * districts.length)];
    const d = DISTRICTS[district];

    // 위경도: hotSpot 중 하나 랜덤 픽 → ±spread 미세 분산 (상권 거리에만 분포)
    const spot = d.hotSpots[Math.floor(rand() * d.hotSpots.length)];
    const dLat = (rand() - 0.5) * 2 * d.spread; // -spread ~ +spread
    const dLng = (rand() - 0.5) * 2 * d.spread;
    const lat = Number((spot.lat + dLat).toFixed(6));
    const lng = Number((spot.lng + dLng).toFixed(6));

    // SVG mock 좌표 (fallback용, 동네 중심 ± range 그대로)
    const angle = rand() * Math.PI * 2;
    const r = rand() * d.range;
    const x = Math.round(d.cx + Math.cos(angle) * r);
    const y = Math.round(d.cy + Math.sin(angle) * r);

    const specialty = pick(SPECIALTIES[cat]);
    const displayName = `${district} ${cat}샵 · ${specialty}`;

    // 메뉴 3개 픽 (중복 없이)
    const menuPool = [...MENU_POOL[cat]].sort(() => rand() - 0.5).slice(0, 3);
    const menu: Menu[] = menuPool.map((m) => ({
      name: m.name,
      price: Math.round((m.min + rand() * (m.max - m.min)) / 1000) * 1000,
    }));

    // 시그니처 메뉴는 첫 번째
    const sigPrice = menu[0].price;
    const discRate = 0.65 + rand() * 0.2; // 0.65 ~ 0.85
    const disc = Math.round((sigPrice * discRate) / 1000) * 1000;

    // 후기 2개 (중복 없이)
    const revPool = [...REVIEW_POOL[cat]].sort(() => rand() - 0.5).slice(0, 2);
    const reviews: Review[] = revPool.map((text) => ({
      text,
      rating: Math.round((4.3 + rand() * 0.65) * 10) / 10,
    }));

    shops.push({
      id: `s${id++}`,
      displayName,
      category: cat,
      district,
      specialty,
      lat,
      lng,
      x,
      y,
      yearsInBusiness: Math.floor(1 + rand() * 14),
      repeatRate: Math.floor(60 + rand() * 36),
      visitCount: Math.floor(50 + rand() * 950),
      rating: Math.round((4.3 + rand() * 0.65) * 10) / 10,
      reviewCount: Math.floor(15 + rand() * 380),
      openHours: pick(OPEN_HOURS),
      menu,
      originalPrice: sigPrice,
      discountedPrice: disc,
      emptySlot: pick(TIME_SLOTS),
      walkMinutes: Math.floor(2 + rand() * 18),
      reviews,
    });
  }

  return shops;
}

export const SHOPS: Shop[] = generate();

export const CATEGORY_COLORS: Record<ServiceCategory, string> = {
  네일: "#ec4899",
  속눈썹: "#8b5cf6",
  왁싱: "#f59e0b",
  반영구: "#0891b2",
};

export const CATEGORY_ORDER: ServiceCategory[] = ["네일", "속눈썹", "왁싱", "반영구"];
