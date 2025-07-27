const API_URL = import.meta.env.VITE_API_URL;

/**
 * 공통 POST 요청 함수
 * @param path API 경로 (예: "/api/analyze")
 * @param body 요청 바디 JSON
 * @returns 응답 JSON
 */
export async function post<T = any>(path: string, body: object): Promise<T> {
  const url = `${API_URL}${path}`;

  console.log(`[📡] POST 요청: ${url}`, body);

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    console.error(`[❌] API 요청 실패 (${res.status}): ${res.statusText}`);
    throw new Error(`API 요청 실패: ${res.status}`);
  }

  const json = await res.json();
  console.log('[✅] 응답:', json);
  return json;
}
