// 백엔드 구현 전까지 사용할 파일
import type {
    AgencyTypeStatistic,
    DiagnosisField,
    DiagnosisStatistic,
    DiagnosisStatus,
    InspectionAgency,
    InspectionAgencyPage,
    MolitMapInfoRow,
    SearchConditions
} from "../types/statistics";

import type {
    CommonCode
} from "../types/commonCode";

import {
    fetchMockMolitRows
} from "./mockRepository";

import {
    fetchStatisticsCommonCodes,
    groupStatisticsCommonCodes
} from "./commonCodes";

/**
 * 쉼표로 구분된 REQ_SIZE_CD 문자열을 배열로 변환한다.
 *
 * 예:
 * "10,20" → ["10", "20"]
 */
function splitValues(value: MolitMapInfoRow["REQ_SIZE_CD"]): string[] {
    return (value ?? "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
}

/**
 * SAFE_CHK_YN 또는 CHK_YN 값을
 * 화면에서 사용할 진단 상태로 변환한다.
 */
function normalizeDiagnosisStatus(value: MolitMapInfoRow["SAFE_CHK_YN"]): DiagnosisStatus {
    const normalizedValue = value?.trim().toUpperCase() ?? "";

    if (normalizedValue === "Y" || normalizedValue === "N") {
        return normalizedValue;
    }

    return "UNKNOWN";
}

/**
 * MOLIT_MAP_INFO.NEW_ROAD_CD에서
 * 자치구 검색에 사용할 코드값을 구한다.
 *
 * 앞 5자리를 사용한다.
 */
function getDistrictCode(newRoadCode: MolitMapInfoRow["NEW_ROAD_CD"]): string {
    return newRoadCode
        ?.trim()
        .slice(0, 5) ?? "";
}

/**
 * MOLIT_MAP_INFO 원본 데이터를
 * 화면 및 목록 API용 데이터로 변환한다.
 */
function mapMolitRow(row: MolitMapInfoRow,): InspectionAgency {
    return {
        agencyId: row.BUILD_ID,

        agencyName: row.CHK_COMPANY_NM?.trim() || "-",

        agencyTypeCode: row.CHK_COM_CD?.trim() ?? "",

        buildingName: row.BUILD_NM?.trim() || "-",

        address: row.ADDRESS?.trim() || "-",

        districtCode: getDistrictCode(row.NEW_ROAD_CD),

        requestSizeCodes: splitValues(row.REQ_SIZE_CD),

        safeDiagnosisYn: normalizeDiagnosisStatus(row.SAFE_CHK_YN),

        checkDiagnosisYn: normalizeDiagnosisStatus(row.CHK_YN),
    };
}

/**
 * db.json의 MOLIT_MAP_INFO 전체 데이터를 조회하고
 * InspectionAgency 배열로 변환한다.
 */
export async function fetchMockInspectionAgencies(_signal?: AbortSignal): Promise<InspectionAgency[]> {
    const rows = await fetchMockMolitRows();

    return rows.map(mapMolitRow);
}

/**
 * 검색조건을 적용한다.
 *
 * 실제 백엔드에서는 이 로직에 해당하는 작업을
 * SQL WHERE 조건으로 처리한다.
 */
function filterInspectionAgencies(agencies: InspectionAgency[], conditions: SearchConditions): InspectionAgency[] {
    const agencyName = conditions.agencyName
        .trim()
        .toLowerCase();

    return agencies.filter((agency) => {
        const matchesAgencyName =
            agencyName === "" ||
            agency.agencyName
                .toLowerCase()
                .includes(agencyName);

        const matchesDistrict =
            conditions.districtCode === "" ||
            agency.districtCode === conditions.districtCode;

        const matchesRequestSize =
            conditions.requestSizeCode === "" ||
            agency.requestSizeCodes.includes(
                conditions.requestSizeCode,
            );

        const matchesSafeDiagnosis =
            conditions.safeDiagnosisYn === "" ||
            agency.safeDiagnosisYn ===
            conditions.safeDiagnosisYn;

        const matchesCheckDiagnosis =
            conditions.checkDiagnosisYn === "" ||
            agency.checkDiagnosisYn ===
            conditions.checkDiagnosisYn;

        const matchesAgencyType =
            conditions.agencyTypeCode === "" ||
            agency.agencyTypeCode ===
            conditions.agencyTypeCode;

        return (
            matchesAgencyName &&
            matchesDistrict &&
            matchesRequestSize &&
            matchesSafeDiagnosis &&
            matchesCheckDiagnosis &&
            matchesAgencyType
        );
    });
}

/**
 * 공통코드 목록에서 코드에 해당하는 화면 표시명을 찾는다.
 */
function getCommonCodeName(code: string, commonCodes: CommonCode[], fallback: string): string {
    const commonCode = commonCodes.find(
        (item) => item.code === code,
    );

    return (
        commonCode?.shortName ??
        commonCode?.codeName ??
        fallback
    );
}

/**
 * /statis/left 또는 /statis/right Mock 응답
 *
 * field가 safeDiagnosisYn이면 왼쪽 차트,
 * checkDiagnosisYn이면 오른쪽 차트 데이터를 만든다.
 */
export async function fetchMockDiagnosisStatistics(conditions: SearchConditions, field: DiagnosisField): Promise<DiagnosisStatistic[]> {
    const [
        agencies,
        commonCodeList,
    ] = await Promise.all([
        fetchMockInspectionAgencies(),
        fetchStatisticsCommonCodes(),
    ]);

    const filteredAgencies = filterInspectionAgencies(
        agencies,
        conditions,
    );

    const commonCodes =
        groupStatisticsCommonCodes(commonCodeList);

    const yesCount = filteredAgencies.filter(
        (agency) => agency[field] === "Y",
    ).length;

    const noCount = filteredAgencies.filter(
        (agency) => agency[field] === "N",
    ).length;

    const totalCount = filteredAgencies.length;

    return [
        {
            code: "Y",
            count: yesCount,
            shortName: getCommonCodeName(
                "Y",
                commonCodes.YN_CD,
                "예",
            ),
        },
        {
            code: "N",
            count: noCount,
            shortName: getCommonCodeName(
                "N",
                commonCodes.YN_CD,
                "아니오",
            ),
        },
        {
            code: "A",
            count: totalCount,
            shortName: "합계",
        },
    ];
}

/**
 * /api/statistics/agency-types Mock 응답
 *
 * CHK_COM_CD별 등록 건수를 계산한다.
 */
export async function fetchMockAgencyTypeStatistics(
    conditions: SearchConditions,
): Promise<AgencyTypeStatistic[]> {
    const [
        agencies,
        commonCodeList,
    ] = await Promise.all([
        fetchMockInspectionAgencies(),
        fetchStatisticsCommonCodes(),
    ]);

    const filteredAgencies = filterInspectionAgencies(
        agencies,
        conditions,
    );

    const commonCodes =
        groupStatisticsCommonCodes(commonCodeList);

    const counts = new Map<string, number>();

    filteredAgencies.forEach((agency) => {
        const code = agency.agencyTypeCode;

        if (!code) {
            return;
        }

        counts.set(
            code,
            (counts.get(code) ?? 0) + 1,
        );
    });

    return commonCodes.CHK_COM_CD.map((commonCode) => ({
        code: commonCode.code,
        count: counts.get(commonCode.code) ?? 0,
        shortName:
            commonCode.shortName ??
            commonCode.codeName ??
            commonCode.code,
    }));
}

/**
 * /api/statistics/inspection-agencies Mock 응답
 *
 * 검색조건 적용 후 현재 페이지의 목록과
 * 페이지네이션 정보를 반환한다.
 */
export async function fetchMockInspectionAgencyPage(
    conditions: SearchConditions,
    page: number,
    size: number,
): Promise<InspectionAgencyPage> {
    const agencies =
        await fetchMockInspectionAgencies();

    const filteredAgencies =
        filterInspectionAgencies(
            agencies,
            conditions,
        );

    const normalizedPage =
        Number.isFinite(page) && page >= 1
            ? Math.floor(page)
            : 1;

    const normalizedSize =
        Number.isFinite(size) && size >= 1
            ? Math.floor(size)
            : 5;

    const totalElements = filteredAgencies.length;

    const totalPages = Math.ceil(
        totalElements / normalizedSize,
    );

    const startIndex =
        (normalizedPage - 1) * normalizedSize;

    const items = filteredAgencies.slice(
        startIndex,
        startIndex + normalizedSize,
    );

    return {
        items,
        pagination: {
            page: normalizedPage,
            size: normalizedSize,
            totalElements,
            totalPages,
        },
    };
}