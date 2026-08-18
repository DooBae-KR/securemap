import type {
    CommonCode,
    StatisticsCommonCodes
} from "../../../types/commonCode";

import type {
    AgencyTypeBar,
    AgencyTypeStatistic,
    DiagnosisSegment,
    DiagnosisStatistic,
    SearchConditions,
    SelectOption
} from "../../../types/statistics";

import {
    DIAGNOSIS_SEGMENT_COLORS,
    UNKNOWN_DIAGNOSIS_LABEL
} from "../../../constants/inspectionAgency";

/**
 * 전달받은 문자열 중 비어 있지 않은
 * 첫 번째 문자열을 반환한다.
 */
function getFirstNonEmptyValue(...values: Array<string | null | undefined>): string | undefined {
    for (const value of values) {
        const normalizedValue = value?.trim();

        if (normalizedValue) {
            return normalizedValue;
        }
    }

    return undefined;
}

/**
 * 공통코드 목록에서 코드값에 해당하는
 * 화면 표시명을 반환한다.
 */
export function getCommonCodeLabel(commonCodes: CommonCode[], code: string, fallback = code): string {
    const commonCode = commonCodes.find(
        (item) => item.code === code
    );

    return getFirstNonEmptyValue(
        commonCode?.codeName,
        commonCode?.shortName,
        fallback
    ) ?? "";
}

/**
 * 공통코드 목록을 select 옵션 배열로 변환한다.
 */
export function toSelectOptions(commonCodes: CommonCode[]): SelectOption[] {
    return commonCodes
        .filter((commonCode) =>
            commonCode.code.trim() !== ""
        )
        .map((commonCode) => ({
            value: commonCode.code,
            label: getFirstNonEmptyValue(
                commonCode.shortName,
                commonCode.codeName,
                commonCode.code
            ) ?? commonCode.code
        }));
}

/**
 * COM_CD_TB.TITLE 조회. (통계 영역 제목)
 * CD_NM을 먼저 사용하고 만일 빈 값이면 SHORT_NM 사용 진행.
 */
export function getStatisticsTitle(titleCodes: CommonCode[], titleCode: string, fallback: string): string {
    const title = titleCodes.find(
        (item) => item.code === titleCode
    );

    return getFirstNonEmptyValue(title?.codeName, title?.shortName, fallback) ?? fallback;
}

/**
 * 현재 적용된 검색조건을 화면 표시명 배열로 변환한다.
 */
export function getAppliedFilterLabels(conditions: SearchConditions, commonCodes: StatisticsCommonCodes): string[] {
    const labels: string[] = [];

    const agencyName = conditions.agencyName.trim();

    if (agencyName) {
        labels.push(`점검기관명: ${agencyName}`);
    }

    if (conditions.districtCode) {
        labels.push(
            `자치구: ${getCommonCodeLabel(
                commonCodes.NEW_ROAD_CD,
                conditions.districtCode,
            )}`,
        );
    }

    if (conditions.requestSizeCode) {
        labels.push(
            `신청규모: ${getCommonCodeLabel(
                commonCodes.REQ_SIZE_CD,
                conditions.requestSizeCode,
            )}`,
        );
    }

    if (conditions.safeDiagnosisYn) {
        labels.push(
            `안전진단: ${getCommonCodeLabel(
                commonCodes.YN_CD,
                conditions.safeDiagnosisYn,
            )}`,
        );
    }

    if (conditions.checkDiagnosisYn) {
        labels.push(
            `점검진단: ${getCommonCodeLabel(
                commonCodes.YN_CD,
                conditions.checkDiagnosisYn,
            )}`,
        );
    }

    if (conditions.agencyTypeCode) {
        labels.push(
            `기관구분: ${getCommonCodeLabel(
                commonCodes.CHK_COM_CD,
                conditions.agencyTypeCode,
            )}`,
        );
    }

    return labels;
}

/**
 * 잘못된 건수값이 차트 계산에 사용되지 않도록 정리한다.
 */
function normalizeCount(count: number | undefined): number {
    if (count === undefined || !Number.isFinite(count)) {
        return 0;
    }

    return Math.max(0, count);
}

/**
 * /statis/left 또는 /statis/right 응답을
 * 도넛차트 데이터로 변환한다.
 *
 * A는 합계이므로 도넛 조각으로 사용하지 않는다.
 * 합계에서 Y와 N을 제외한 나머지는 UNKNOWN으로 처리한다.
 */
export function toDiagnosisSegments(statistics: DiagnosisStatistic[]): DiagnosisSegment[] {
    const statisticsByCode = new Map(
        statistics.map((item) => [item.code, item])
    );

    const yesStatistic = statisticsByCode.get("Y");

    const noStatistic = statisticsByCode.get("N");

    const totalStatistic = statisticsByCode.get("A");

    const yesCount = normalizeCount(yesStatistic?.count);

    const noCount = normalizeCount(noStatistic?.count);

    const knownCount = yesCount + noCount;

    const totalCount = Math.max(normalizeCount(totalStatistic?.count), knownCount);

    const unknownCount = totalCount - knownCount;

    return [
        {
            code: "Y",
            label: getFirstNonEmptyValue(
                yesStatistic?.shortName,
                "예",
            ) ?? "예",
            count: yesCount,
            color: DIAGNOSIS_SEGMENT_COLORS.Y,
        },
        {
            code: "N",
            label: getFirstNonEmptyValue(
                noStatistic?.shortName,
                "아니오",
            ) ?? "아니오",
            count: noCount,
            color: DIAGNOSIS_SEGMENT_COLORS.N,
        },
        {
            code: "UNKNOWN",
            label: UNKNOWN_DIAGNOSIS_LABEL,
            count: unknownCount,
            color:
            DIAGNOSIS_SEGMENT_COLORS.UNKNOWN,
        },
    ];
}

/**
 * 점검기관 구분별 통계 API 응답을
 * 막대차트 데이터로 변환한다.
 */
export function toAgencyTypeBars(statistics: AgencyTypeStatistic[],): AgencyTypeBar[] {
    return statistics.map((statistic) => ({
        code: statistic.code,

        label: getFirstNonEmptyValue(
            statistic.shortName,
            statistic.code,
        ) ?? statistic.code,

        count: normalizeCount(
            statistic.count,
        ),
    }));
}

/**
 * CHK_COM_CD 코드값을 화면 표시명으로 변환한다.
 */
export function getAgencyTypeLabel(
    agencyTypeCode: string,
    commonCodes: StatisticsCommonCodes,
): string {
    if (!agencyTypeCode) {
        return "-";
    }

    return getCommonCodeLabel(
        commonCodes.CHK_COM_CD,
        agencyTypeCode,
        agencyTypeCode,
    );
}

/**
 * REQ_SIZE_CD 코드 배열을 화면 표시명으로 변환한다.
 */
export function getRequestSizeLabel(
    requestSizeCodes: string[],
    commonCodes: StatisticsCommonCodes,
): string {
    if (requestSizeCodes.length === 0) {
        return "-";
    }

    return requestSizeCodes
        .map((code) =>
            getCommonCodeLabel(
                commonCodes.REQ_SIZE_CD,
                code,
                code,
            ),
        )
        .join(", ");
}