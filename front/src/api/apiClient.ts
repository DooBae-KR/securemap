/**
 * API 실행 모드
 *
 * mock: db.json의 임시 데이터를 사용
 * server: 실제 백엔드 API를 호출
 *
 * VITE_API_MODE를 설정하지 않으면 mock 모드로 실행
 */
export const USE_MOCK_API = import.meta.env.VITE_API_MODE !== "server";

/**
 * GET API를 호출하고 JSON 응답을 반환하는 공통 함수
 */
export async function fetchJson<T>(url: string, signal?: AbortSignal,): Promise<T> {
    const response = await fetch(url, { signal });

    if (!response.ok) {
        throw new Error(
            `API 요청 실패: ${response.status} ${response.statusText}`,
        );
    }

    return response.json() as Promise<T>;
}