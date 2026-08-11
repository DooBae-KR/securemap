export type Building = {
    // 건물/점검기관 PK
    BUILD_ID: number;

    // 건물명
    BUILD_NM: string;

    // 점검기관명
    CHK_COMPANY_NM: string | null;

    // 운영상태
    STATE_CD: string | null;
    STATE_NM: string | null;

    // 적용규모
    REQ_SIZE_CD: string | null;
    REQ_SIZE_NM: string | null;

    // 안전진단 여부
    SAFE_CHK_YN: string | null;

    // 점검진단 여부
    CHK_YN: string | null;

    // 점검기관 구분코드
    CHK_COM_CD: string | null;

    // 위도 / 경도
    LAT: string;
    LNG: string;

    // 주소
    ADDRESS: string | null;

    // 최근 변경일시
    CHK_DATE: string | null;
};