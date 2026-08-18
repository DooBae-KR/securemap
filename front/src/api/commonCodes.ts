import type {
    CommonCode,
    CommonCodeTableRow,
    StatisticsCommonCodeKind,
    StatisticsCommonCodes
} from "../types/commonCode";

import {
    fetchJson,
    USE_MOCK_API
} from "./apiClient";

import {
    fetchMockCommonCodeRows
} from "./mockRepository";

/**
 * 통계 페이지에서 조회할 공통코드 구분
 */
export const STATISTICS_COMMON_CODE_KINDS = [
    "REQ_SIZE_CD",
    "YN_CD",
    "CHK_COM_CD",
    "NEW_ROAD_CD",
    "TITLE",
] as const satisfies readonly StatisticsCommonCodeKind[];

/**
 * 실제 백엔드 공통코드 API URL
 */
const COMMON_CODE_URL = "/api/common-code";

/**
 * 전달받은 문자열이 통계 페이지에서 사용하는
 * 공통코드 구분인지 확인한다.
 */
function isStatisticsCommonCodeKind(
    codeKind: string,
): codeKind is StatisticsCommonCodeKind {
    return STATISTICS_COMMON_CODE_KINDS.some(
        (kind) => kind === codeKind,
    );
}

/**
 * db.json의 COM_CD_TB 데이터를
 * 프론트에서 사용할 CommonCode 형식으로 변환한다.
 */
function mapCommonCodeTableRow(row: CommonCodeTableRow,): CommonCode {
    return {
        codeKind: row.CD_KIND,
        code: row.CD,
        codeName: row.CD_NM,
        shortName: row.SHORT_NM,
        systemCode: row.SYS_CD,
    };
}

/**
 * 통계 페이지에서 사용할 공통코드 목록을 조회한다.
 *
 * Mock 모드:
 * db.json의 COM_CD_TB 조회
 *
 * Server 모드:
 * GET /api/common-code 호출
 */
export async function fetchStatisticsCommonCodes(signal?: AbortSignal,): Promise<CommonCode[]> {
    if (USE_MOCK_API) {
        const rows = await fetchMockCommonCodeRows();

        return rows
            .filter((row) =>
                isStatisticsCommonCodeKind(row.CD_KIND),
            )
            .map(mapCommonCodeTableRow);
    }

    const searchParams = new URLSearchParams({
        codeKinds:
            STATISTICS_COMMON_CODE_KINDS.join(","),
    });

    return fetchJson<CommonCode[]>(
        `${COMMON_CODE_URL}?${searchParams.toString()}`,
        signal,
    );
}

/**
 * 공통코드 목록을 CD_KIND별로 분류한다.
 */
export function groupStatisticsCommonCodes(codes: CommonCode[],): StatisticsCommonCodes {
    const groupedCodes: StatisticsCommonCodes = {
        REQ_SIZE_CD: [],
        YN_CD: [],
        CHK_COM_CD: [],
        NEW_ROAD_CD: [],
        TITLE: [],
    };

    codes.forEach((code) => {
        if (!isStatisticsCommonCodeKind(code.codeKind)) {
            return;
        }

        groupedCodes[code.codeKind].push(code);
    });

    return groupedCodes;
}