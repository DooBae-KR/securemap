import {
    type ChangeEvent,
    type SubmitEvent,
    useEffect,
    useState
} from "react";

import "./StatisticsPage.css";
// import {MOCK_INSPECTION_AGENCIES, type InspectionAgency} from "./statisticsMockData";
import {
    fetchMockInspectionAgencies,
} from "../../api/statisticsMock";

import type {
    InspectionAgency,
} from "../../types/statistics";

type SearchConditions = {
    agencyName: string;
    district: string;
    requestSizeCode: string;
    safeDiagnosisYn: string;
    checkDiagnosisYn: string;
    agencyTypeCode: string;
};

const INITIAL_SEARCH_CONDITIONS: SearchConditions = {
    agencyName: "",
    district: "",
    requestSizeCode: "",
    safeDiagnosisYn: "",
    checkDiagnosisYn: "",
    agencyTypeCode: "",
};

// 임시 데이터
const SEOUL_DISTRICTS = [
    "강남구",
    "강동구",
    "강북구",
    "강서구",
    "관악구",
    "광진구",
    "구로구",
    "금천구",
    "노원구",
    "도봉구",
    "동대문구",
    "동작구",
    "마포구",
    "서대문구",
    "서초구",
    "성동구",
    "성북구",
    "송파구",
    "양천구",
    "영등포구",
    "용산구",
    "은평구",
    "종로구",
    "중구",
    "중랑구",
] as const;

const REQUEST_SIZE_OPTIONS = [
    {value: "10", label: "3천㎡ 미만"},
    {value: "20", label: "3천㎡ 이상 1만㎡ 미만"},
    {value: "30", label: "1만㎡ 이상"},
] as const;

const DIAGNOSIS_OPTIONS = [
    {value: "Y", label: "Y"},
    {value: "N", label: "N"},
] as const;

const AGENCY_TYPE_OPTIONS = [
    {value: "01", label: "건축사사무소"},
    {value: "02", label: "건설기술용역업자"},
    {value: "03", label: "안전진단전문기관"},
    {value: "04", label: "국토안전관리원"},
    {value: "05", label: "기술사사무소"},
    {value: "06", label: "한국부동산원"},
    {value: "07", label: "한국토지주택공사"},
] as const;

const PAGE_SIZE = 5;

type SelectOption = {
    value: string;
    label: string;
};

type DiagnosisField = "safeDiagnosisYn" | "checkDiagnosisYn";

type DiagnosisSegment = {
    label: string;
    count: number;
    color: string;
};

type AgencyTypeBar = {
    code: string;
    label: string;
    count: number;
}

const DIAGNOSIS_SEGMENT_STYLES = [
    {value: "Y", label: "예(Y)", color: "#238b57"},
    {value: "N", label: "아니요(N)", color: "#6b7280"},
    {value: "UNKNOWN", label: "미확인", color: "#d77513"},
] as const;

function getOptionLabel(options: readonly SelectOption[], value: string,) {
    return options.find((option) => option.value === value)?.label ?? value;
}

function normalizeAgencyTypeCode(value: string | null | undefined,) {
    const normalizedValue = String(value ?? "").trim();

    if (!normalizedValue) {
        return "";
    }

    return /^\d+$/.test(normalizedValue)
        ? normalizedValue.padStart(2, "0")
        : normalizedValue;
}

function getAppliedFilterLabels(conditions: SearchConditions) {
    const labels: string[] = [];
    const agencyName = conditions.agencyName.trim();

    if (agencyName) {
        labels.push(`점검기관명: ${agencyName}`);
    }

    if (conditions.district) {
        labels.push(`자치구: ${conditions.district}`);
    }

    if (conditions.requestSizeCode) {
        labels.push(
            `신청규모: ${getOptionLabel(
                REQUEST_SIZE_OPTIONS,
                conditions.requestSizeCode,
            )}`,
        );
    }

    if (conditions.safeDiagnosisYn) {
        labels.push(`안전진단: ${conditions.safeDiagnosisYn}`);
    }

    if (conditions.checkDiagnosisYn) {
        labels.push(`점검진단: ${conditions.checkDiagnosisYn}`);
    }

    if (conditions.agencyTypeCode) {
        labels.push(
            `기관구분: ${getOptionLabel(
                AGENCY_TYPE_OPTIONS,
                conditions.agencyTypeCode,
            )}`,
        );
    }

    return labels;
}

function getDiagnosisSegments(agencies: InspectionAgency[], field: DiagnosisField,): DiagnosisSegment[] {
    const counts = agencies.reduce(
        (result, agency) => {
            const value = String(agency[field] ?? "")
                .trim()
                .toUpperCase();

            if (value === "Y") {
                result.Y += 1;
            } else if (value === "N") {
                result.N += 1;
            } else {
                result.UNKNOWN += 1;
            }

            return result;
        },
        {Y: 0, N: 0, UNKNOWN: 0},
    );

    return DIAGNOSIS_SEGMENT_STYLES.map((segment) => ({
        label: segment.label,
        count: counts[segment.value],
        color: segment.color,
    }));
}

function getAgencyTypeBars(agencies: InspectionAgency[],): AgencyTypeBar[] {
    const counts = new Map<string, number>(
        AGENCY_TYPE_OPTIONS.map((option) => [option.value, 0]),
    );

    let unknownCount = 0;

    agencies.forEach((agency) => {
        const code = normalizeAgencyTypeCode(
            agency.agencyTypeCode,
        );

        if (counts.has(code)) {
            counts.set(code, (counts.get(code) ?? 0) + 1);
        } else {
            unknownCount += 1;
        }
    });

    const bars: AgencyTypeBar[] = AGENCY_TYPE_OPTIONS.map(
        (option) => ({
            code: option.value,
            label: option.label,
            count: counts.get(option.value) ?? 0,
        }),
    );

    if (unknownCount > 0) {
        bars.push({
            code: "UNKNOWN",
            label: "값 없음 또는 기타",
            count: unknownCount,
        });
    }

    return bars;
}

function getAgencyTypeLabel(code: string) {
    const normalizedCode = normalizeAgencyTypeCode(code);

    if (!normalizedCode) {
        return "-";
    }

    return getOptionLabel(
        AGENCY_TYPE_OPTIONS,
        normalizedCode,
    );
}

function getRequestSizeLabel(codes: string[]) {
    if (codes.length === 0) {
        return "-";
    }

    return codes
        .map((code) =>
            getOptionLabel(REQUEST_SIZE_OPTIONS, code),
        )
        .join(", ");
}

type DiagnosisDonutCardProps = {
    title: string;
    field: DiagnosisField;
    agencies: InspectionAgency[];
};

function DiagnosisDonutCard({title, field, agencies,}: DiagnosisDonutCardProps) {
    const total = agencies.length;
    const segments = getDiagnosisSegments(agencies, field);
    const radius = 64;
    const circumference = 2 * Math.PI * radius;
    let accumulatedLength = 0;

    const chartDescription = segments
        .map((segment) => `${segment.label} ${segment.count}건`)
        .join(", ");

    return (
        <article className="statistics-diagnosis-card">
            <header className="statistics-diagnosis-card__heading">
                <div>
                    <h3>{title}</h3>
                </div>

                <span>{total.toLocaleString("ko-KR")}건 기준</span>
            </header>

            <div className="statistics-diagnosis-card__content">
                <div
                    className="statistics-donut"
                    role="img"
                    aria-label={`${title}. ${chartDescription}`}>
                    <svg viewBox="0 0 176 176" aria-hidden="true">
                        <circle
                            className="statistics-donut__track"
                            cx="88"
                            cy="88"
                            r={radius}/>

                        {total > 0 && segments.map((segment) => {
                            const segmentLength =
                                (segment.count / total) * circumference;
                            const dashOffset = -accumulatedLength;

                            accumulatedLength += segmentLength;

                            if (segment.count === 0) {
                                return null;
                            }

                            return (
                                <circle
                                    key={segment.label}
                                    className="statistics-donut__segment"
                                    cx="88"
                                    cy="88"
                                    r={radius}
                                    stroke={segment.color}
                                    strokeDasharray={`${segmentLength} ${
                                        circumference - segmentLength
                                    }`}
                                    strokeDashoffset={dashOffset}/>
                            );
                        })}
                    </svg>

                    <div className="statistics-donut__center">
                        <strong>
                            {total.toLocaleString("ko-KR")}건
                        </strong>
                        <span>등록정보</span>
                    </div>
                </div>

                <div
                    className="statistics-diagnosis-legend"
                    aria-label={`${title} 범례`}>
                    {segments.map((segment) => {
                        const percentage = total === 0
                            ? 0
                            : (segment.count / total) * 100;

                        return (
                            <div
                                key={segment.label}
                                className="statistics-diagnosis-legend__item">
                                <i
                                    aria-hidden="true"
                                    style={{backgroundColor: segment.color}}/>

                                <span>{segment.label}</span>

                                <strong>
                                    {segment.count.toLocaleString("ko-KR")}건
                                </strong>

                                <em>{percentage.toFixed(1)}%</em>
                            </div>
                        );
                    })}
                </div>
            </div>

            <p className="statistics-diagnosis-card__footnote">
                {total === 0 ? "조회 결과가 없습니다." : title}
            </p>
        </article>
    );
}

type AgencyTypeBarChartProps = {
    agencies: InspectionAgency[];
};

function AgencyTypeBarChart({agencies,}: AgencyTypeBarChartProps) {
    const bars = getAgencyTypeBars(agencies);

    const maxCount = Math.max(
        ...bars.map((bar) => bar.count),
        0,
    );

    const chartDescription = bars
        .map((bar) => `${bar.label} ${bar.count}건`)
        .join(", ");

    return (
        <div
            className="statistics-agency-bars"
            role="img"
            aria-label={
                `점검기관 구분별 등록 건수. ${chartDescription}`
            }
        >
            {bars.map((bar) => {
                const width =
                    maxCount === 0
                        ? 0
                        : (bar.count / maxCount) * 100;

                return (
                    <div
                        key={bar.code}
                        className="statistics-agency-bars__row"
                    >
                        <span className="statistics-agency-bars__label">
                            {bar.label}
                        </span>

                        <span
                            className="statistics-agency-bars__track"
                            aria-hidden="true"
                        >
                            <span
                                className="statistics-agency-bars__fill"
                                style={{width: `${width}%`}}
                            />
                        </span>

                        <strong>
                            {bar.count.toLocaleString("ko-KR")}건
                        </strong>
                    </div>
                );
            })}
        </div>
    );
}

type DiagnosisBadgeProps = {
    value: string | null | undefined;
};

function DiagnosisBadge({value,}: DiagnosisBadgeProps) {
    const normalizedValue = String(value ?? "")
        .trim()
        .toUpperCase();

    const status =
        normalizedValue === "Y"
            ? "yes"
            : normalizedValue === "N"
                ? "no"
                : "unknown";

    const label =
        normalizedValue === "Y"
            ? "Y"
            : normalizedValue === "N"
                ? "N"
                : "-";

    return (
        <span
            className={
                `statistics-diagnosis-badge ` +
                `statistics-diagnosis-badge--${status}`
            }
        >
            {label}
        </span>
    );
}

type AgencyRegistrationTableProps = {
    agencies: InspectionAgency[];
    startIndex: number;
};

function AgencyRegistrationTable({agencies, startIndex,}: AgencyRegistrationTableProps) {
    return (
        <div className="statistics-registration-table__scroll">
            <table className="statistics-registration-table">
                <caption className="statistics-visually-hidden">
                    점검기관 등록정보 목록
                </caption>

                <colgroup>
                    <col className="statistics-col--row-number" />
                    <col className="statistics-col--agency-number" />
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
                    <th>점검기관번호</th>
                    <th>점검기관명</th>
                    <th>기관 구분</th>
                    <th>등재 건물명</th>
                    <th>주소</th>
                    <th>신청규모</th>
                    <th className="statistics-table-align-center">
                        안전진단
                    </th>
                    <th className="statistics-table-align-center">
                        점검진단
                    </th>
                    <th className="statistics-table-align-center">
                        기능
                    </th>
                </tr>
                </thead>

                <tbody>
                {agencies.length === 0 ? (
                    <tr>
                        <td className="statistics-registration-table__empty" colSpan={10}>
                            조회된 점검기관 등록정보가 없습니다.
                        </td>
                    </tr>
                ) : (
                    agencies.map((agency, index) => {
                        const agencyTypeLabel =
                            getAgencyTypeLabel(
                                agency.agencyTypeCode,
                            );

                        const requestSizeLabel =
                            getRequestSizeLabel(
                                agency.requestSizeCodes,
                            );

                        return (
                            <tr key={agency.agencyId}>
                                <td>
                                    {startIndex + index + 1}
                                </td>

                                <td>
                                    {agency.agencyNumber}
                                </td>

                                <td className="statistics-registration-table__agency-name">
                                        <span className="statistics-table-ellipsis" title={agency.agencyName}>
                                            {agency.agencyName}
                                        </span>
                                </td>

                                <td>
                                        <span className="statistics-table-ellipsis" title={agencyTypeLabel}>
                                            {agencyTypeLabel}
                                        </span>
                                </td>

                                <td>
                                        <span className="statistics-table-ellipsis" title={agency.buildingName}>
                                            {agency.buildingName}
                                        </span>
                                </td>

                                <td>
                                        <span className="statistics-table-ellipsis" title={agency.address}
                                        >
                                            {agency.address}
                                        </span>
                                </td>

                                <td>
                                        <span
                                            className="statistics-table-ellipsis"
                                            title={requestSizeLabel}
                                        >
                                            {requestSizeLabel}
                                        </span>
                                </td>

                                <td className="statistics-table-align-center">
                                    <DiagnosisBadge
                                        value={agency.safeDiagnosisYn}
                                    />
                                </td>

                                <td className="statistics-table-align-center">
                                    <DiagnosisBadge
                                        value={agency.checkDiagnosisYn}
                                    />
                                </td>

                                <td>
                                    <div className="statistics-registration-table__actions">
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

// 페이지
function StatisticsPage() {
    const [searchConditions, setSearchConditions] =
        useState<SearchConditions>(INITIAL_SEARCH_CONDITIONS);

    const [allAgencies, setAllAgencies] =
        useState<InspectionAgency[]>([]);

    const [filteredAgencies, setFilteredAgencies] =
        useState<InspectionAgency[]>([]);

    const [isLoading, setIsLoading] = useState(true);

    const [loadError, setLoadError] =
        useState<string | null>(null);

    const [appliedSearchConditions, setAppliedSearchConditions] =
        useState<SearchConditions>(INITIAL_SEARCH_CONDITIONS);

    const appliedFilterLabels = getAppliedFilterLabels(
        appliedSearchConditions,
    );

    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredAgencies.length / PAGE_SIZE),
    );

    const currentPageStartIndex =
        (currentPage - 1) * PAGE_SIZE;

    const currentPageAgencies =
        filteredAgencies.slice(
            currentPageStartIndex,
            currentPageStartIndex + PAGE_SIZE,
        );

    const pageNumbers = Array.from(
        {length: totalPages},
        (_, index) => index + 1,
    );

    useEffect(() => {
        const controller = new AbortController();

        const loadAgencies = async () => {
            try {
                setIsLoading(true);
                setLoadError(null);

                const agencies =
                    await fetchMockInspectionAgencies(
                        controller.signal,
                    );

                if (controller.signal.aborted) {
                    return;
                }

                setAllAgencies(agencies);
                setFilteredAgencies(agencies);
                setCurrentPage(1);
            } catch (error: unknown) {
                if (controller.signal.aborted) {
                    return;
                }

                setAllAgencies([]);
                setFilteredAgencies([]);

                setLoadError(
                    error instanceof Error
                        ? error.message
                        : "Mock 데이터를 불러오지 못했습니다.",
                );
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        };

        void loadAgencies();

        return () => {
            controller.abort();
        };
    }, []);

    const handlePageChange = (page: number) => {
        if (
            page < 1 ||
            page > totalPages ||
            page === currentPage
        ) {
            return;
        }

        setCurrentPage(page);
    };

    const handleConditionChange = (
        event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        const {name, value} = event.target;

        setSearchConditions((previousConditions) => ({
            ...previousConditions,
            [name]: value,
        }));
    };

    const handleSearch = (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();

        const agencyName = searchConditions.agencyName
            .trim()
            .toLowerCase();

        const searchResults = allAgencies.filter((agency) => {
            const matchesAgencyName =
                agencyName === "" ||
                agency.agencyName.toLowerCase().includes(agencyName);

            const matchesDistrict =
                searchConditions.district === "" ||
                agency.district === searchConditions.district;

            const matchesRequestSize =
                searchConditions.requestSizeCode === "" ||
                agency.requestSizeCodes.includes(
                    searchConditions.requestSizeCode,
                );

            const matchesSafeDiagnosis =
                searchConditions.safeDiagnosisYn === "" ||
                agency.safeDiagnosisYn ===
                searchConditions.safeDiagnosisYn;

            const matchesCheckDiagnosis =
                searchConditions.checkDiagnosisYn === "" ||
                agency.checkDiagnosisYn ===
                searchConditions.checkDiagnosisYn;

            const matchesAgencyType =
                searchConditions.agencyTypeCode === "" ||
                normalizeAgencyTypeCode(agency.agencyTypeCode) ===
                normalizeAgencyTypeCode(
                    searchConditions.agencyTypeCode,
                );

            return (
                matchesAgencyName &&
                matchesDistrict &&
                matchesRequestSize &&
                matchesSafeDiagnosis &&
                matchesCheckDiagnosis &&
                matchesAgencyType
            );
        });

        setFilteredAgencies(searchResults);
        setAppliedSearchConditions(searchConditions);
        setCurrentPage(1);
    };

    const handleReset = () => {
        setSearchConditions(INITIAL_SEARCH_CONDITIONS);
        setAppliedSearchConditions(INITIAL_SEARCH_CONDITIONS);
        setFilteredAgencies(allAgencies);
        setCurrentPage(1);
    };

    return (
        <main className="statistics-page">
            <div className="statistics-page__inner">
                <header className="statistics-page__heading">
                    <h1>점검기관 등록정보 통계</h1>

                    <p>
                        서울시에 등재된 점검기관 등록정보를 안전진단 · 점검진단
                        여부와 기관 구분별로 집계합니다.
                    </p>
                </header>

                <section
                    className="statistics-search"
                    aria-labelledby="statistics-search-title">
                    <div className="statistics-search__heading">
                        <h2 id="statistics-search-title">조건 검색</h2>
                    </div>

                    <form
                        className="statistics-search__form"
                        onSubmit={handleSearch}>
                        <div className="statistics-search__grid">
                            <div className="statistics-field">
                                <label htmlFor="agencyName">
                                    점검기관명
                                </label>

                                <input
                                    id="agencyName"
                                    name="agencyName"
                                    type="search"
                                    value={searchConditions.agencyName}
                                    onChange={handleConditionChange}
                                    placeholder="점검기관명 입력"/>
                            </div>

                            <div className="statistics-field">
                                <label htmlFor="district">자치구</label>

                                <select
                                    id="district"
                                    name="district"
                                    value={searchConditions.district}
                                    onChange={handleConditionChange}>
                                    <option value="">전체</option>

                                    {SEOUL_DISTRICTS.map((district) => (
                                        <option
                                            key={district}
                                            value={district}>
                                            {district}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="statistics-field">
                                <label htmlFor="requestSizeCode">
                                    신청규모
                                </label>

                                <select
                                    id="requestSizeCode"
                                    name="requestSizeCode"
                                    value={searchConditions.requestSizeCode}
                                    onChange={handleConditionChange}>
                                    <option value="">전체</option>

                                    {REQUEST_SIZE_OPTIONS.map((option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="statistics-field">
                                <label htmlFor="safeDiagnosisYn">
                                    안전진단 여부
                                </label>

                                <select
                                    id="safeDiagnosisYn"
                                    name="safeDiagnosisYn"
                                    value={searchConditions.safeDiagnosisYn}
                                    onChange={handleConditionChange}>
                                    <option value="">전체</option>

                                    {DIAGNOSIS_OPTIONS.map((option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="statistics-field">
                                <label htmlFor="checkDiagnosisYn">
                                    점검진단 여부
                                </label>

                                <select
                                    id="checkDiagnosisYn"
                                    name="checkDiagnosisYn"
                                    value={searchConditions.checkDiagnosisYn}
                                    onChange={handleConditionChange}>
                                    <option value="">전체</option>

                                    {DIAGNOSIS_OPTIONS.map((option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="statistics-field">
                                <label htmlFor="agencyTypeCode">
                                    점검기관 구분
                                </label>

                                <select
                                    id="agencyTypeCode"
                                    name="agencyTypeCode"
                                    value={searchConditions.agencyTypeCode}
                                    onChange={handleConditionChange}>
                                    <option value="">전체</option>

                                    {AGENCY_TYPE_OPTIONS.map((option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="statistics-search__actions">
                            <button
                                className="statistics-button statistics-button--secondary"
                                type="button"
                                onClick={handleReset}>
                                초기화
                            </button>

                            <button
                                className="statistics-button statistics-button--primary"
                                type="submit">
                                검색
                            </button>
                        </div>
                    </form>
                </section>

                <section className="statistics-result-summary" aria-live="polite">
                    <span className="statistics-result-summary__label">
                        조회 결과
                    </span>

                    <strong>
                        {filteredAgencies.length.toLocaleString("ko-KR")}건
                    </strong>

                    {appliedFilterLabels.length > 0 && (
                        <div
                            className="statistics-result-summary__filters"
                            aria-label="적용된 검색조건">
                            {appliedFilterLabels.map((label) => (
                                <span
                                    key={label}
                                    className="statistics-result-summary__filter">
                                    {label}
                                </span>
                            ))}
                        </div>
                    )}
                </section>

                {isLoading && (
                    <section className="statistics-result-summary" role="status">
                        Mock 데이터를 불러오는 중입니다.
                    </section>
                )}

                {loadError && (
                    <section className="statistics-result-summary" role="alert">
                        {loadError}
                    </section>
                )}

                <section
                    className="statistics-diagnosis-panel"
                    aria-labelledby="statistics-diagnosis-title">
                    <div className="statistics-diagnosis-panel__heading">
                        <h2 id="statistics-diagnosis-title">
                            진단 여부별 등록정보 현황
                        </h2>
                    </div>

                    <div className="statistics-diagnosis-panel__body">
                        <div className="statistics-diagnosis-grid">
                            <DiagnosisDonutCard
                                title="안전진단 여부별 현황"
                                field="safeDiagnosisYn"
                                agencies={filteredAgencies}/>

                            <DiagnosisDonutCard
                                title="점검진단 여부별 현황"
                                field="checkDiagnosisYn"
                                agencies={filteredAgencies}/>
                        </div>
                    </div>
                </section>


                <section
                    className="statistics-agency-panel"
                    aria-labelledby="statistics-agency-title"
                >
                    <div className="statistics-agency-panel__heading">
                        <h2 id="statistics-agency-title">
                            점검기관 구분별 등록 현황
                        </h2>
                    </div>

                    <div className="statistics-agency-panel__body">
                        <AgencyTypeBarChart
                            agencies={filteredAgencies}
                        />
                    </div>
                </section>

                <section
                    className="statistics-registration-panel"
                    aria-labelledby="statistics-registration-title">
                    <div className="statistics-registration-panel__heading">
                        <h2 id="statistics-registration-title">
                            점검기관 등록정보
                        </h2>
                    </div>

                    <div className="statistics-registration-panel__body">
                        <AgencyRegistrationTable
                            agencies={currentPageAgencies}
                            startIndex={currentPageStartIndex}/>

                        {filteredAgencies.length > 0 &&
                            totalPages > 1 && (
                                <nav
                                    className="statistics-pagination"
                                    aria-label="점검기관 목록 페이지">
                                    <button
                                        type="button"
                                        onClick={() => handlePageChange(currentPage - 1,)} disabled={currentPage === 1}>
                                        이전
                                    </button>

                                    {pageNumbers.map((page) => (
                                        <button
                                            key={page}
                                            type="button"
                                            className={page === currentPage ? "statistics-pagination__button--active" : undefined}
                                            aria-current={page === currentPage ? "page" : undefined}
                                            onClick={() => handlePageChange(page)}>
                                            {page}
                                        </button>
                                    ))}

                                    <button
                                        type="button"
                                        onClick={() => handlePageChange(currentPage + 1,)}
                                        disabled={currentPage === totalPages}>
                                        다음
                                    </button>
                                </nav>
                            )}
                    </div>
                </section>
            </div>
        </main>
    );
}

export default StatisticsPage;