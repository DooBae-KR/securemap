export type AgencyCompanyCount = {
    COMPANY_NM: string;
    CNT: number;
};

export async function fetchAgencyCompanyCounts(
    signal?: AbortSignal,
): Promise<AgencyCompanyCount[]> {
    const response = await fetch(
        "/api/charts/statis/agency",
        {signal},
    );

    if (!response.ok) {
        throw new Error(
            `점검기관별 등록 현황 조회 실패: ${response.status}`,
        );
    }

    const data: unknown = await response.json();

    if (!Array.isArray(data)) {
        throw new Error(
            "점검기관별 등록 현황 응답이 배열 형식이 아닙니다.",
        );
    }

    return data as AgencyCompanyCount[];
}