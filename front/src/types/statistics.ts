/**
 * 통계 페이지에서 사용하는 데이터 구조를 정의하는 타입 파일
 */

/**
 * 안전진단·점검진단의 실제 코드
 */
export type DiagnosisYn =
    | "Y"
    | "N";

/**
 * 화면 데이터에서 사용하는 진단 상태
 *
 * UNKNOWN: 원본값이 없거나 Y/N이 아닌 경우
 */
export type DiagnosisStatus =
    | DiagnosisYn
    | "UNKNOWN";

/**
 * 검색폼의 진단 여부 선택값
 *
 * 빈 문자열은 전체를 의미한다.
 */
export type DiagnosisSearchValue =
    | DiagnosisYn
    | "";

/**
 * MOLIT_MAP_INFO 테이블 데이터
 */
export type MolitMapInfoRow = {
    BUILD_ID: number;
    CHK_COMPANY_NM: string | null;

    BJD_CD: string | null;
    BJD_BUN: string | null;
    BJD_JI: string | null;

    NA_BJD_CD: string | null;
    NEW_ROAD_CD: string | null;
    NA_UGRND_CD: string | null;
    NA_BUN: string | null;
    NA_SUB_BUN: string | null;

    BUILD_NM: string | null;

    STATE_CD: string | null;
    STATE_NM: string | null;

    REQ_SIZE_CD: string | null;
    REQ_SIZE_NM: string | null;

    SAFE_CHK_YN: string | null;
    CHK_YN: string | null;

    CHK_COM_CD: string | null;

    LAT: number | string | null;
    LNG: number | string | null;

    ADDRESS: string | null;
};

/**
 * 점검기관 등록정보 화면 및 목록 API 타입
 *
 * 공통코드의 명칭은 별도로 조회한 뒤 화면에서 연결한다.
 */
export type InspectionAgency = {
    // BUILD_ID
    agencyId: number;

    // CHK_COMPANY_NM
    agencyName: string;

    // CHK_COM_CD
    agencyTypeCode: string;

    // BUILD_NM
    buildingName: string;

    // ADDRESS
    address: string;

    // 자치구 코드
    districtCode: string;

    // REQ_SIZE_CD를 배열로 변환한 값
    requestSizeCodes: string[];

    // SAFE_CHK_YN
    safeDiagnosisYn: DiagnosisStatus;

    // CHK_YN
    checkDiagnosisYn: DiagnosisStatus;
};

/**
 * 통계 페이지 검색조건
 */
export type SearchConditions = {
    // 점검기관명 검색어
    agencyName: string;

    // 자치구 선택 코드
    districtCode: string;

    // 적용규모 선택 코드
    requestSizeCode: string;

    // 안전진단 여부 선택값
    safeDiagnosisYn: DiagnosisSearchValue;

    // 점검진단 여부 선택값
    checkDiagnosisYn: DiagnosisSearchValue;

    // 점검기관 구분 선택 코드
    agencyTypeCode: string;
};

/**
 * select 옵션
 */
export type SelectOption = {
    value: string;
    label: string;
};

/**
 * Mock 데이터의 진단 집계 대상 필드
 */
export type DiagnosisField =
    | "safeDiagnosisYn"
    | "checkDiagnosisYn";

/**
 * 도넛차트 화면용 데이터
 */
export type DiagnosisSegment = {
    code: DiagnosisStatus;
    label: string;
    count: number;
    color: string;
};

/**
 * 점검기관 구분별 막대차트 화면용 데이터
 */
export type AgencyTypeBar = {
    code: string;
    label: string;
    count: number;
};

/**
 * /statis/left, /statis/right 응답 코드
 *
 * Y: 예
 * N: 아니오
 * A: 합계
 */
export type DiagnosisStatisticCode =
    | DiagnosisYn
    | "A";

/**
 * /statis/left, /statis/right 응답 한 건
 */
export type DiagnosisStatistic = {
    code: DiagnosisStatisticCode;
    count: number;
    shortName: string;
};

/**
 * /api/statistics/agency-types 응답 한 건
 */
export type AgencyTypeStatistic = {
    code: string;
    count: number;
    shortName: string;
};

/**
 * 목록 API 페이지네이션 정보
 */
export type Pagination = {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
};

/**
 * /api/statistics/inspection-agencies 응답
 */
export type InspectionAgencyPage = {
    items: InspectionAgency[];
    pagination: Pagination;
};