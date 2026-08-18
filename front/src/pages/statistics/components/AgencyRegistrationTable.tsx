import type {
    CommonCode,
    StatisticsCommonCodes
} from "../../../types/commonCode";

import type {
    DiagnosisStatus,
    InspectionAgency
} from "../../../types/statistics";

import {
    getAgencyTypeLabel,
    getCommonCodeLabel,
    getRequestSizeLabel
} from "../utils/statisticsFormatters";

type DiagnosisBadgeProps = {
    value: DiagnosisStatus;
    ynCodes: CommonCode[];
};

/**
 * 안전진단·점검진단 여부를 배지로 표시한다.
 */
function DiagnosisBadge({value, ynCodes}: DiagnosisBadgeProps) {
    const status =
        value === "Y"
            ? "yes"
            : value === "N"
                ? "no"
                : "unknown";

    const label =
        value === "UNKNOWN"
            ? "-"
            : getCommonCodeLabel(ynCodes, value, value);

    return (
        <span className={`statistics-diagnosis-badge ` + `statistics-diagnosis-badge--${status}`} title={label} aria-label={label}>
            {label}
        </span>
    );
}

type AgencyRegistrationTableProps = {
    agencies: InspectionAgency[];

    // 현재 페이지 첫 번째 데이터의 전체 목록 기준 인덱스
    startIndex: number;

    commonCodes: StatisticsCommonCodes;
};

function AgencyRegistrationTable({agencies, startIndex, commonCodes}: AgencyRegistrationTableProps) {
    return (
        <div className="statistics-registration-table__scroll">
            <table className="statistics-registration-table">
                <caption className="statistics-visually-hidden">
                    점검기관 등록정보 목록
                </caption>

                <colgroup>
                    <col className="statistics-col--row-number" />
                    <col className={"statistics-col--agency-number"}/>
                    <col className="statistics-col--agency-name" />
                    <col className="statistics-col--agency-type" />
                    <col className="statistics-col--building-name" />
                    <col className="statistics-col--address" />
                    <col className="statistics-col--request-size" />
                    <col className="statistics-col--diagnosis" />
                    <col className="statistics-col--diagnosis" />
                    <col className="statistics-col--actions" />
                </colgroup>

                <thead>
                <tr>
                    <th>번호</th>
                    <th>등록 ID</th>
                    <th>점검기관명</th>
                    <th>기관 구분</th>
                    <th>등재 건물명</th>
                    <th>주소</th>
                    <th>신청규모</th>
                    <th className="statistics-table-align-center">안전진단</th>
                    <th className="statistics-table-align-center">점검진단</th>
                    <th className="statistics-table-align-center">기능</th>
                </tr>
                </thead>

                <tbody>
                {agencies.length === 0 ? (
                    <tr>
                        <td className={"statistics-registration-table__empty"} colSpan={10}>
                            조회된 점검기관 등록정보가 없습니다.
                        </td>
                    </tr>
                ) : (
                    agencies.map((agency, index) => {
                        const agencyTypeLabel = getAgencyTypeLabel(agency.agencyTypeCode, commonCodes);
                        const requestSizeLabel = getRequestSizeLabel(agency.requestSizeCodes, commonCodes);

                        return (
                            <tr key={agency.agencyId}>
                                <td>
                                    {startIndex + index + 1}
                                </td>

                                <td>
                                    {agency.agencyId}
                                </td>

                                <td className={"statistics-registration-table__agency-name"}>
                                    <span className={"statistics-table-ellipsis"} title={agency.agencyName}>
                                        {agency.agencyName}
                                    </span>
                                </td>

                                <td>
                                    <span className={"statistics-table-ellipsis"} title={agencyTypeLabel}>
                                        {agencyTypeLabel}
                                    </span>
                                </td>

                                <td>
                                    <span className={"statistics-table-ellipsis"} title={agency.buildingName}>
                                        {agency.buildingName}
                                    </span>
                                </td>

                                <td>
                                    <span className={"statistics-table-ellipsis"} title={agency.address}>
                                        {agency.address}
                                    </span>
                                </td>

                                <td>
                                    <span className={"statistics-table-ellipsis"} title={requestSizeLabel}>
                                        {requestSizeLabel}
                                    </span>
                                </td>

                                <td className="statistics-table-align-center">
                                    <DiagnosisBadge value={agency.safeDiagnosisYn} ynCodes={commonCodes.YN_CD}/>
                                </td>

                                <td className="statistics-table-align-center">
                                    <DiagnosisBadge value={agency.checkDiagnosisYn} ynCodes={commonCodes.YN_CD}/>
                                </td>

                                <td>
                                    <div className={"statistics-registration-table__actions"}>
                                        <button type="button">
                                            상세
                                        </button>

                                        <button type="button">
                                            지도
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })
                )}
                </tbody>
            </table>
        </div>
    );
}

export default AgencyRegistrationTable;