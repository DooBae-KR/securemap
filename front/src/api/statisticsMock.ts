import type {
    DiagnosisYn,
    InspectionAgency,
} from "../types/statistics";

type MolitMapInfoRow = {
    BUILD_ID: number;
    CHK_COMPANY_NM: string | null;
    BUILD_NM: string | null;

    ADDRESS?: string | null;
    NEW_ROAD_CD?: string | number | null;

    REQ_SIZE_CD: string | null;
    REQ_SIZE_NM: string | null;

    SAFE_CHK_YN: string | null;
    CHK_YN: string | null;

    CHK_COM_CD: string | number | null;
    CHK_COM_NM?: string | null;
};

const DISTRICT_NAMES: Record<string, string> = {
    "11110": "종로구",
    "11140": "중구",
    "11170": "용산구",
    "11200": "성동구",
    "11215": "광진구",
    "11230": "동대문구",
    "11260": "중랑구",
    "11290": "성북구",
    "11305": "강북구",
    "11320": "도봉구",
    "11350": "노원구",
    "11380": "은평구",
    "11410": "서대문구",
    "11440": "마포구",
    "11470": "양천구",
    "11500": "강서구",
    "11530": "구로구",
    "11545": "금천구",
    "11560": "영등포구",
    "11590": "동작구",
    "11620": "관악구",
    "11650": "서초구",
    "11680": "강남구",
    "11710": "송파구",
    "11740": "강동구",
};

function splitValues(
    value: string | null | undefined,
): string[] {
    return String(value ?? "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
}

function normalizeDiagnosisYn(
    value: string | null,
): DiagnosisYn {
    const normalizedValue = String(value ?? "")
        .trim()
        .toUpperCase();

    if (
        normalizedValue === "Y" ||
        normalizedValue === "N"
    ) {
        return normalizedValue;
    }

    return "";
}

function normalizeAgencyTypeCode(value: string | number | null | undefined,): string {
    const normalizedValue = String(value ?? "").trim();

    if (!normalizedValue) {
        return "";
    }

    return /^\d+$/.test(normalizedValue)
        ? normalizedValue.padStart(2, "0")
        : normalizedValue;
}

function getDistrictFromAddress(address: string): string {
    const match = address.match(
        /(?:서울특별시|서울시)\s+([가-힣]+구)(?:\s|$)/,
    );

    return match?.[1] ?? "";
}

function getDistrictName(
    newRoadCode: string | number | null | undefined,
): string {
    const districtCode = String(newRoadCode ?? "")
        .trim()
        .slice(0, 5);

    return DISTRICT_NAMES[districtCode] ?? "";
}

function mapMolitRow(
    row: MolitMapInfoRow,
): InspectionAgency {
    const address = String(row.ADDRESS ?? "").trim();

    return {
        agencyId: row.BUILD_ID,
        agencyNumber: String(row.BUILD_ID),

        agencyName:
            String(row.CHK_COMPANY_NM ?? "").trim() || "-",

        agencyTypeCode:
            normalizeAgencyTypeCode(row.CHK_COM_CD),

        agencyTypeName:
            String(row.CHK_COM_NM ?? "").trim(),

        buildingName:
            String(row.BUILD_NM ?? "").trim() || "-",

        address: address || "-",

        district:
            getDistrictFromAddress(address) ||
            getDistrictName(row.NEW_ROAD_CD),

        requestSizeCodes:
            splitValues(row.REQ_SIZE_CD),

        requestSizeNames:
            splitValues(row.REQ_SIZE_NM),

        safeDiagnosisYn:
            normalizeDiagnosisYn(row.SAFE_CHK_YN),

        checkDiagnosisYn:
            normalizeDiagnosisYn(row.CHK_YN),
    };
}

export async function fetchMockInspectionAgencies(
    signal?: AbortSignal,
): Promise<InspectionAgency[]> {
    const response = await fetch(
        "/mock-api/MOLIT_MAP_INFO",
        {signal},
    );

    if (!response.ok) {
        throw new Error(
            `Mock 데이터 조회 실패: ${response.status}`,
        );
    }

    const data: unknown = await response.json();

    if (!Array.isArray(data)) {
        throw new Error(
            "MOLIT_MAP_INFO 응답이 배열 형식이 아닙니다.",
        );
    }

    return (data as MolitMapInfoRow[]).map(mapMolitRow);
}