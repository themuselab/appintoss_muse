// 두 좌표 사이 거리 (미터) — Haversine
export function distanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371e3;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lng2 - lng1);
  const a =
    Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// 미터 → 사용자 친화 문자열
export function fmtDistance(m: number): string {
  if (m < 1000) return `${Math.round(m / 10) * 10}m`;
  return `${(m / 1000).toFixed(1)}km`;
}

// 서울 중심 — 위치 권한 거부 시 fallback
export const SEOUL_CENTER = { lat: 37.5665, lng: 126.978 };

// 사용자 위치 가져오기 (Promise)
export function getUserPosition(timeout = 6000): Promise<{
  lat: number;
  lng: number;
  fallback: boolean;
}> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve({ ...SEOUL_CENTER, fallback: true });
      return;
    }
    let resolved = false;
    const fallbackTimer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve({ ...SEOUL_CENTER, fallback: true });
      }
    }, timeout);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (resolved) return;
        resolved = true;
        clearTimeout(fallbackTimer);
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          fallback: false,
        });
      },
      () => {
        if (resolved) return;
        resolved = true;
        clearTimeout(fallbackTimer);
        resolve({ ...SEOUL_CENTER, fallback: true });
      },
      { timeout, maximumAge: 300_000, enableHighAccuracy: false },
    );
  });
}
