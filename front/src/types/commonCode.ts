/**
 * COM_CD_TB 공통코드 데이터를 프론트에서 사용하기 위한 타입 파일
 */

/**
 * 통계 페이지에서 조회할 공통코드 구분
 *
 * REQ_SIZE_CD : 적용규모
 * YN_CD       : 안전진단과 점검진단 여부
 * CHK_COM_CD  : 점검기관 구분
 * NEW_ROAD_CD : 자치구
 * TITLE       : 통계 페이지 세션 제목
 */
export type StatisticsCommonCodeKind =
    | "REQ_SIZE_CD"
    | "YN_CD"
    | "CHK_COM_CD"
    | "NEW_ROAD_CD"
    | "TITLE";

/**
 * db.json의 COM_CD_TB 원본 데이터 타입
 *
 * 실제 DB 컬럼명과 동일하게 대문자 스네이크 표기법을 사용한다.
 * Mock 데이터를 읽을 때 사용한다.
 */
export type CommonCodeTableRow = {
    COM_ID: number;             // COM_CD_TB 기본키
    CD_KIND: string;            // 코드 구분
    CD: string;                 // 코드값
    CD_NM: string | null;       // 코드명
    SHORT_NM: string | null;    // 코드 약어명
    SYS_CD: string | null;      // 시스템 또는 화면 영역 구분
    MOD_DATE: string | null;    // 수정일시
};

/**
 * GET /api/common-code 응답 한 건
 *
 * 백엔드에서 DB 컬럼명을 프론트용 camelCase로 변환해서
 * 반환한다는 API 응답 형식이다.
 */
export type CommonCode = {
    codeKind: string;           // CD_KIND
    code: string;               // CD
    codeName: string | null;    // CD_NM
    shortName: string | null;   // SHORT_NM
    systemCode: string | null;  // SYS_CD
};

/**
 * 통계 페이지 공통코드를 CD_KIND별로 분류한 타입
 *
 * 각 속성에는 해당 코드 구분의 공통코드 목록이 들어간다.
 */
export type StatisticsCommonCodes = Record<
    StatisticsCommonCodeKind,
    CommonCode[]
>;