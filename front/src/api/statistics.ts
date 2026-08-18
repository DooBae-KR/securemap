import type {
    AgencyTypeStatistic,
    DiagnosisStatistic,
    InspectionAgencyPage,
    SearchConditions
} from "../types/statistics";

import {
    fetchJson,
    USE_MOCK_API
} from "./apiClient";

import {
    fetchMockAgencyTypeStatistics,
    fetchMockDiagnosisStatistics,
    fetchMockInspectionAgencyPage
} from "./statisticsMock";

/**
 * 통계 페이지 API URL
 */
export const STATISTICS_API_URLS = {
    safeDiagnosis: "/statis/left",
    checkDiagnosis: "/statis/right",
    agencyTypes: "/api/statistics/agency-types",
    inspectionAgencies: "/api/statistics/inspection-agencies",
} as const;

/**
 * 값이 비어 있지 않은 검색조건만
 * URL 쿼리 파라미터에 추가한다.
 */
function setSearchParam(searchParams: URLSearchParams, key: keyof SearchConditions, value: string): void {
    const normalizedValue = value.trim();

    if (normalizedValue) {
        searchParams.set(key, normalizedValue);
    }
}

/**
 * 검색조건을 API 쿼리 파라미터로 변환한다.
 */
function createSearchParams(conditions: SearchConditions,): URLSearchParams {
    const searchParams = new URLSearchParams();

    setSearchParam(searchParams, "agencyName", conditions.agencyName);

    setSearchParam(searchParams, "districtCode", conditions.districtCode);

    setSearchParam(searchParams, "requestSizeCode", conditions.requestSizeCode);

    setSearchParam(searchParams, "safeDiagnosisYn", conditions.safeDiagnosisYn);

    setSearchParam(searchParams, "checkDiagnosisYn", conditions.checkDiagnosisYn);

    setSearchParam(searchParams, "agencyTypeCode", conditions.agencyTypeCode);

    return searchParams;
}

/**
 * API URL과 쿼리 파라미터를 결합한다.
 */
function createUrl(baseUrl: string, searchParams: URLSearchParams): string {
    const queryString = searchParams.toString();

    return queryString
        ? `${baseUrl}?${queryString}`
        : baseUrl;
}

/**
 * 안전진단 여부별 통계를 조회한다.
 *
 * Mock:
 * statisticsMock.ts에서 직접 집계
 *
 * Server:
 * GET /statis/left
 */
export function fetchSafeDiagnosisStatistics(conditions: SearchConditions, signal?: AbortSignal): Promise<DiagnosisStatistic[]> {
    if (USE_MOCK_API) {
        return fetchMockDiagnosisStatistics(
            conditions,
            "safeDiagnosisYn",
        );
    }

    const searchParams = createSearchParams(conditions);

    return fetchJson<DiagnosisStatistic[]>(
        createUrl(STATISTICS_API_URLS.safeDiagnosis, searchParams),
        signal
    );
}

/**
 * 점검진단 여부별 통계를 조회한다.
 *
 * Mock:
 * statisticsMock.ts에서 직접 집계
 *
 * Server:
 * GET /statis/right
 */
export function fetchCheckDiagnosisStatistics(conditions: SearchConditions, signal?: AbortSignal): Promise<DiagnosisStatistic[]> {
    if (USE_MOCK_API) {
        return fetchMockDiagnosisStatistics(
            conditions,
            "checkDiagnosisYn"
        );
    }

    const searchParams =
        createSearchParams(conditions);

    return fetchJson<DiagnosisStatistic[]>(
        createUrl(
            STATISTICS_API_URLS.checkDiagnosis,
            searchParams
        ),
        signal
    );
}

/**
 * 점검기관 구분별 등록 통계를 조회한다.
 *
 * Mock:
 * statisticsMock.ts에서 직접 집계
 *
 * Server:
 * GET /api/statistics/agency-types
 */
export function fetchAgencyTypeStatistics(
    conditions: SearchConditions,
    signal?: AbortSignal,
): Promise<AgencyTypeStatistic[]> {
    if (USE_MOCK_API) {
        return fetchMockAgencyTypeStatistics(
            conditions,
        );
    }

    const searchParams =
        createSearchParams(conditions);

    return fetchJson<AgencyTypeStatistic[]>(
        createUrl(
            STATISTICS_API_URLS.agencyTypes,
            searchParams,
        ),
        signal,
    );
}

/**
 * 점검기관 등록정보 목록을 조회한다.
 *
 * Mock:
 * statisticsMock.ts에서 검색 및 페이지네이션 처리
 *
 * Server:
 * GET /api/statistics/inspection-agencies
 */
export function fetchInspectionAgencyPage(
    conditions: SearchConditions,
    page: number,
    size: number,
    signal?: AbortSignal,
): Promise<InspectionAgencyPage> {
    if (USE_MOCK_API) {
        return fetchMockInspectionAgencyPage(
            conditions,
            page,
            size,
        );
    }

    const searchParams =
        createSearchParams(conditions);

    searchParams.set(
        "page",
        String(page),
    );

    searchParams.set(
        "size",
        String(size),
    );

    return fetchJson<InspectionAgencyPage>(
        createUrl(
            STATISTICS_API_URLS.inspectionAgencies,
            searchParams,
        ),
        signal,
    );
}