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

  /*
    주소
   
    기존 프론트에서 ADDRESS를 사용하고 있어서 유지.
    백엔드 SQL에서 ADDRESS라는 이름으로 내려줘야 함.
   */
  ADDRESS: string | null;

  /*
    최근 변경일시
   
    MOLIT_HISTORY.CHK_DATE
   */
  CHK_DATE: string | null;
};

/*
  건물 목록 조회 API
 
  Vite proxy를 통해
  /api/buildings -> 백엔드 3001 포트로 요청
 */
export async function fetchBuildings(): Promise<Building[]> {
  const response = await fetch("/api/buildings");

  if (!response.ok) {
    throw new Error(`건물 목록 조회 실패: ${response.status}`);
  }

  return response.json() as Promise<Building[]>;
}