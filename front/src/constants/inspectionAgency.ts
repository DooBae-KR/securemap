// API 데이터와 무관한 프론트 고정값

import type {
    DiagnosisStatus,
    SearchConditions,
} from "../types/statistics";

/**
 * 검색조건 초기값
 *
 * 빈 문자열은 해당 검색조건을 적용하지 않는다는 의미다.
 */
export const INITIAL_SEARCH_CONDITIONS: SearchConditions = {
    agencyName: "",
    districtCode: "",
    requestSizeCode: "",
    safeDiagnosisYn: "",
    checkDiagnosisYn: "",
    agencyTypeCode: ""
};

/**
 * 도넛차트 항목별 색상
 *
 * 항목명은 COM_CD_TB 또는 차트 API에서 가져오지만,
 * 색상은 프론트 화면 표현에 해당하므로 상수로 관리한다.
 */
export const DIAGNOSIS_SEGMENT_COLORS = {
    Y: "#238b57",
    N: "#6b7280",
    UNKNOWN: "#d77513",
} as const satisfies Record<DiagnosisStatus, string>;

/**
 * Y/N이 아닌 데이터의 화면 표시명
 *
 * UNKNOWN은 COM_CD_TB의 YN_CD에 존재하지 않는
 * 프론트 화면용 상태이므로 별도 관리한다.
 */
export const UNKNOWN_DIAGNOSIS_LABEL = "미확인";

/**
 * 등록정보 목록에서 한 페이지에 표시할 데이터 개수
 */
export const PAGE_SIZE = 5;