import {
    type ChangeEvent,
    type SubmitEvent,
    useEffect,
    useMemo,
    useState
} from "react";

import type {
    StatisticsCommonCodes
} from "../../../types/commonCode";

import type {
    AgencyTypeStatistic,
    DiagnosisSearchValue,
    DiagnosisStatistic,
    InspectionAgencyPage,
    SearchConditions
} from "../../../types/statistics";

import {
    fetchStatisticsCommonCodes,
    groupStatisticsCommonCodes
} from "../../../api/commonCodes";

import {
    fetchAgencyTypeStatistics,
    fetchCheckDiagnosisStatistics,
    fetchInspectionAgencyPage,
    fetchSafeDiagnosisStatistics
} from "../../../api/statistics";

import {
    INITIAL_SEARCH_CONDITIONS,
    PAGE_SIZE
} from "../../../constants/inspectionAgency";

import {
    getAppliedFilterLabels,
    getStatisticsTitle,
    toSelectOptions
} from "../utils/statisticsFormatters";

/**
 * 공통코드 조회 전 초기값
 */
const EMPTY_COMMON_CODES: StatisticsCommonCodes = {
    REQ_SIZE_CD: [],
    YN_CD: [],
    CHK_COM_CD: [],
    NEW_ROAD_CD: [],
    TITLE: []
};

/**
 * 등록정보 목록 API 초기값
 */
const EMPTY_INSPECTION_AGENCY_PAGE: InspectionAgencyPage = {
    items: [],
    pagination: {
        page: 1,
        size: PAGE_SIZE,
        totalElements: 0,
        totalPages: 0
    }
};

/**
 * select에서 전달된 값이 올바른 진단 검색값인지 확인한다.
 */
function isDiagnosisSearchValue(value: string): value is DiagnosisSearchValue {
    return (
        value === "" ||
        value === "Y" ||
        value === "N"
    );
}

function useStatistics() {
    /**
     * 검색폼에 현재 입력되어 있는 조건
     */
    const [
        searchConditions,
        setSearchConditions,
    ] = useState<SearchConditions>(
        INITIAL_SEARCH_CONDITIONS,
    );

    /**
     * 검색 버튼을 눌러 실제 API 조회에 적용된 조건
     */
    const [
        appliedSearchConditions,
        setAppliedSearchConditions,
    ] = useState<SearchConditions>(
        INITIAL_SEARCH_CONDITIONS,
    );

    /**
     * 동일한 검색조건으로 다시 검색하는 경우에도
     * API를 재호출하기 위한 값
     */
    const [
        queryVersion,
        setQueryVersion,
    ] = useState(0);

    /**
     * 공통코드
     */
    const [
        commonCodes,
        setCommonCodes,
    ] = useState<StatisticsCommonCodes>(
        EMPTY_COMMON_CODES,
    );

    /**
     * 왼쪽 안전진단 도넛차트 데이터
     */
    const [
        safeDiagnosisStatistics,
        setSafeDiagnosisStatistics,
    ] = useState<DiagnosisStatistic[]>([]);

    /**
     * 오른쪽 점검진단 도넛차트 데이터
     */
    const [
        checkDiagnosisStatistics,
        setCheckDiagnosisStatistics,
    ] = useState<DiagnosisStatistic[]>([]);

    /**
     * 점검기관 구분별 막대차트 데이터
     */
    const [
        agencyTypeStatistics,
        setAgencyTypeStatistics,
    ] = useState<AgencyTypeStatistic[]>([]);

    /**
     * 점검기관 등록정보 목록
     */
    const [
        inspectionAgencyPage,
        setInspectionAgencyPage,
    ] = useState<InspectionAgencyPage>(
        EMPTY_INSPECTION_AGENCY_PAGE,
    );

    /**
     * 현재 페이지 번호
     */
    const [
        currentPage,
        setCurrentPage,
    ] = useState(1);

    /**
     * API별 로딩 상태
     */
    const [
        isCommonCodesLoading,
        setIsCommonCodesLoading,
    ] = useState(true);

    const [
        isChartsLoading,
        setIsChartsLoading,
    ] = useState(true);

    const [
        isListLoading,
        setIsListLoading,
    ] = useState(true);

    /**
     * API별 오류 상태
     */
    const [
        commonCodeError,
        setCommonCodeError,
    ] = useState<string | null>(null);

    const [
        chartError,
        setChartError,
    ] = useState<string | null>(null);

    const [
        listError,
        setListError,
    ] = useState<string | null>(null);

    /**
     * 공통코드는 통계 페이지 최초 진입 시 한 번 조회한다.
     */
    useEffect(() => {
        const controller =
            new AbortController();

        async function loadCommonCodes() {
            try {
                setIsCommonCodesLoading(true);
                setCommonCodeError(null);

                const codes =
                    await fetchStatisticsCommonCodes(
                        controller.signal,
                    );

                if (controller.signal.aborted) {
                    return;
                }

                setCommonCodes(
                    groupStatisticsCommonCodes(codes),
                );
            } catch (error: unknown) {
                if (controller.signal.aborted) {
                    return;
                }

                setCommonCodes(
                    EMPTY_COMMON_CODES,
                );

                setCommonCodeError(
                    error instanceof Error
                        ? error.message
                        : "공통코드를 불러오지 못했습니다.",
                );
            } finally {
                if (!controller.signal.aborted) {
                    setIsCommonCodesLoading(false);
                }
            }
        }

        void loadCommonCodes();

        return () => {
            controller.abort();
        };
    }, []);

    /**
     * 검색조건이 변경되면 세 개의 차트 API를 다시 조회한다.
     *
     * 페이지 이동만으로는 차트를 다시 조회하지 않는다.
     */
    useEffect(() => {
        const controller =
            new AbortController();

        async function loadChartStatistics() {
            try {
                setIsChartsLoading(true);
                setChartError(null);

                const [
                    safeStatistics,
                    checkStatistics,
                    agencyStatistics,
                ] = await Promise.all([
                    fetchSafeDiagnosisStatistics(
                        appliedSearchConditions,
                        controller.signal,
                    ),

                    fetchCheckDiagnosisStatistics(
                        appliedSearchConditions,
                        controller.signal,
                    ),

                    fetchAgencyTypeStatistics(
                        appliedSearchConditions,
                        controller.signal,
                    ),
                ]);

                if (controller.signal.aborted) {
                    return;
                }

                setSafeDiagnosisStatistics(
                    safeStatistics,
                );

                setCheckDiagnosisStatistics(
                    checkStatistics,
                );

                setAgencyTypeStatistics(
                    agencyStatistics,
                );
            } catch (error: unknown) {
                if (controller.signal.aborted) {
                    return;
                }

                setSafeDiagnosisStatistics([]);
                setCheckDiagnosisStatistics([]);
                setAgencyTypeStatistics([]);

                setChartError(
                    error instanceof Error
                        ? error.message
                        : "차트 데이터를 불러오지 못했습니다.",
                );
            } finally {
                if (!controller.signal.aborted) {
                    setIsChartsLoading(false);
                }
            }
        }

        void loadChartStatistics();

        return () => {
            controller.abort();
        };
    }, [
        appliedSearchConditions,
        queryVersion,
    ]);

    /**
     * 검색조건 또는 현재 페이지가 변경되면
     * 등록정보 목록 API를 다시 조회한다.
     */
    useEffect(() => {
        const controller =
            new AbortController();

        async function loadInspectionAgencyPage() {
            try {
                setIsListLoading(true);
                setListError(null);

                const pageData =
                    await fetchInspectionAgencyPage(
                        appliedSearchConditions,
                        currentPage,
                        PAGE_SIZE,
                        controller.signal,
                    );

                if (controller.signal.aborted) {
                    return;
                }

                setInspectionAgencyPage(
                    pageData,
                );
            } catch (error: unknown) {
                if (controller.signal.aborted) {
                    return;
                }

                setInspectionAgencyPage({
                    items: [],
                    pagination: {
                        page: currentPage,
                        size: PAGE_SIZE,
                        totalElements: 0,
                        totalPages: 0,
                    },
                });

                setListError(
                    error instanceof Error
                        ? error.message
                        : "등록정보 목록을 불러오지 못했습니다.",
                );
            } finally {
                if (!controller.signal.aborted) {
                    setIsListLoading(false);
                }
            }
        }

        void loadInspectionAgencyPage();

        return () => {
            controller.abort();
        };
    }, [
        appliedSearchConditions,
        currentPage,
        queryVersion,
    ]);

    /**
     * 공통코드를 검색 select 옵션으로 변환한다.
     */
    const districtOptions = useMemo(
        () =>
            toSelectOptions(
                commonCodes.NEW_ROAD_CD,
            ),
        [commonCodes.NEW_ROAD_CD],
    );

    const requestSizeOptions = useMemo(
        () =>
            toSelectOptions(
                commonCodes.REQ_SIZE_CD,
            ),
        [commonCodes.REQ_SIZE_CD],
    );

    const diagnosisOptions = useMemo(
        () =>
            toSelectOptions(
                commonCodes.YN_CD,
            ),
        [commonCodes.YN_CD],
    );

    const agencyTypeOptions = useMemo(
        () =>
            toSelectOptions(
                commonCodes.CHK_COM_CD,
            ),
        [commonCodes.CHK_COM_CD],
    );

    /**
     * TITLE 공통코드를 각 영역의 제목으로 변환한다.
     */
    const sectionTitles = useMemo(
        () => ({
            safeDiagnosis:
                getStatisticsTitle(
                    commonCodes.TITLE,
                    "T1",
                    "안전진단 여부별 현황",
                ),

            checkDiagnosis:
                getStatisticsTitle(
                    commonCodes.TITLE,
                    "T2",
                    "점검진단 여부별 현황",
                ),

            agencyType:
                getStatisticsTitle(
                    commonCodes.TITLE,
                    "T3",
                    "점검기관 구분별 등록 현황",
                ),

            inspectionAgency:
                getStatisticsTitle(
                    commonCodes.TITLE,
                    "T4",
                    "점검기관별 건축물현황",
                ),
        }),
        [commonCodes.TITLE],
    );

    /**
     * 적용된 검색조건의 화면 표시명
     */
    const appliedFilterLabels = useMemo(
        () =>
            getAppliedFilterLabels(
                appliedSearchConditions,
                commonCodes,
            ),
        [
            appliedSearchConditions,
            commonCodes,
        ],
    );

    const totalElements =
        inspectionAgencyPage.pagination
            .totalElements;

    const totalPages =
        inspectionAgencyPage.pagination
            .totalPages;

    const currentPageStartIndex =
        (
            inspectionAgencyPage.pagination.page -
            1
        ) *
        inspectionAgencyPage.pagination.size;

    const pageNumbers = Array.from(
        {
            length: totalPages,
        },
        (_, index) => index + 1,
    );

    /**
     * 검색폼 입력값 변경
     */
    const handleConditionChange = (
        event: ChangeEvent<
            HTMLInputElement | HTMLSelectElement
        >,
    ) => {
        const {
            name,
            value,
        } = event.target;

        setSearchConditions(
            (previousConditions) => {
                switch (name) {
                    case "agencyName":
                        return {
                            ...previousConditions,
                            agencyName: value,
                        };

                    case "districtCode":
                        return {
                            ...previousConditions,
                            districtCode: value,
                        };

                    case "requestSizeCode":
                        return {
                            ...previousConditions,
                            requestSizeCode: value,
                        };

                    case "safeDiagnosisYn":
                        if (
                            !isDiagnosisSearchValue(
                                value,
                            )
                        ) {
                            return previousConditions;
                        }

                        return {
                            ...previousConditions,
                            safeDiagnosisYn: value,
                        };

                    case "checkDiagnosisYn":
                        if (
                            !isDiagnosisSearchValue(
                                value,
                            )
                        ) {
                            return previousConditions;
                        }

                        return {
                            ...previousConditions,
                            checkDiagnosisYn: value,
                        };

                    case "agencyTypeCode":
                        return {
                            ...previousConditions,
                            agencyTypeCode: value,
                        };

                    default:
                        return previousConditions;
                }
            },
        );
    };

    /**
     * 검색 버튼
     */
    const handleSearch = (
        event: SubmitEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        setAppliedSearchConditions({
            ...searchConditions,
        });

        setCurrentPage(1);

        setQueryVersion(
            (previousVersion) =>
                previousVersion + 1,
        );
    };

    /**
     * 검색조건 초기화
     */
    const handleReset = () => {
        setSearchConditions({
            ...INITIAL_SEARCH_CONDITIONS,
        });

        setAppliedSearchConditions({
            ...INITIAL_SEARCH_CONDITIONS,
        });

        setCurrentPage(1);

        setQueryVersion(
            (previousVersion) =>
                previousVersion + 1,
        );
    };

    /**
     * 페이지 이동
     */
    const handlePageChange = (
        page: number,
    ) => {
        if (
            isListLoading ||
            page < 1 ||
            page > totalPages ||
            page === currentPage
        ) {
            return;
        }

        setCurrentPage(page);
    };

    /**
     * 화면 전체 로딩 상태
     */
    const isLoading =
        isCommonCodesLoading ||
        isChartsLoading ||
        isListLoading;

    /**
     * 화면에 표시할 오류 메시지
     */
    const loadError =
        commonCodeError ??
        chartError ??
        listError;

    return {
        agencyTypeOptions,
        agencyTypeStatistics,
        appliedFilterLabels,

        checkDiagnosisStatistics,
        commonCodes,
        currentPage,
        currentPageAgencies:
        inspectionAgencyPage.items,
        currentPageStartIndex,

        diagnosisOptions,
        districtOptions,

        handleConditionChange,
        handlePageChange,
        handleReset,
        handleSearch,

        isLoading,
        loadError,

        pageNumbers,
        requestSizeOptions,

        safeDiagnosisStatistics,
        searchConditions,
        sectionTitles,

        totalElements,
        totalPages,
    };
}

export default useStatistics;