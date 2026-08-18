import "./StatisticsPage.css";

import AgencyRegistrationTable from "./components/AgencyRegistrationTable";
import AgencyTypeBarChart from "./components/AgencyTypeBarChart";
import DiagnosisDonutCard from "./components/DiagnosisDonutCard";
import StatisticsPagination from "./components/StatisticsPagination";
import StatisticsSearchForm from "./components/StatisticsSearchForm";

import useStatistics from "./hooks/useStatistics";

function StatisticsPage() {
    const {
        agencyTypeOptions,
        agencyTypeStatistics,
        appliedFilterLabels,

        checkDiagnosisStatistics,
        commonCodes,
        currentPage,
        currentPageAgencies,
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
        totalPages
    } = useStatistics();

    return (
        <main className="statistics-page" aria-busy={isLoading}>
            <div className="statistics-page__inner">
                <header className="statistics-page__heading">
                    <h1>점검기관 등록정보 통계</h1>
                    <p>서울시에 등재된 점검기관 등록정보를 안전진단·점검진단 여부와 기관 구분별로 집계합니다.</p>
                </header>

                <StatisticsSearchForm
                    searchConditions={searchConditions}
                    districtOptions={districtOptions}
                    requestSizeOptions={requestSizeOptions}
                    diagnosisOptions={diagnosisOptions}
                    agencyTypeOptions={agencyTypeOptions}
                    isLoading={isLoading}
                    onConditionChange={handleConditionChange}
                    onSubmit={handleSearch}
                    onReset={handleReset}
                />

                <section className="statistics-result-summary" aria-live="polite">
                    <span className="statistics-result-summary__label">
                        조회 결과
                    </span>

                    <strong>{totalElements.toLocaleString("ko-KR",)}건</strong>

                    {appliedFilterLabels.length >
                        0 && (
                            <div className={"statistics-result-summary__filters"} aria-label="적용된 검색조건">
                                {appliedFilterLabels.map(
                                    (label) => (
                                        <span key={label} className={"statistics-result-summary__filter"}>
                                            {label}
                                        </span>
                                    )
                                )}
                            </div>
                        )}
                </section>

                {isLoading && (
                    <section className="statistics-result-summary" role="status">
                        통계 데이터를 불러오는 중입니다.
                    </section>
                )}

                {loadError && (
                    <section className="statistics-result-summary" role="alert">
                        {loadError}
                    </section>
                )}

                <section className="statistics-diagnosis-panel" aria-labelledby={"statistics-diagnosis-title"}>
                    <div className="statistics-diagnosis-panel__heading">
                        <h2 id="statistics-diagnosis-title">
                            진단 여부별 등록정보 현황
                        </h2>
                    </div>

                    <div className="statistics-diagnosis-panel__body">
                        <div className="statistics-diagnosis-grid">
                            <DiagnosisDonutCard title={sectionTitles.safeDiagnosis} statistics={safeDiagnosisStatistics}/>
                            <DiagnosisDonutCard title={sectionTitles.checkDiagnosis} statistics={checkDiagnosisStatistics}/>
                        </div>
                    </div>
                </section>

                <section className="statistics-agency-panel" aria-labelledby={"statistics-agency-title"}>
                    <div className="statistics-agency-panel__heading">
                        <h2 id="statistics-agency-title">
                            {sectionTitles.agencyType}
                        </h2>
                    </div>

                    <div className="statistics-agency-panel__body">
                        <AgencyTypeBarChart title={sectionTitles.agencyType} statistics={agencyTypeStatistics}/>
                    </div>
                </section>

                <section className="statistics-registration-panel" aria-labelledby={"statistics-registration-title"}>
                    <div className="statistics-registration-panel__heading">
                        <h2 id="statistics-registration-title">
                            {sectionTitles.inspectionAgency}
                        </h2>
                    </div>

                    <div className="statistics-registration-panel__body">
                        <AgencyRegistrationTable agencies={currentPageAgencies} startIndex={currentPageStartIndex} commonCodes={commonCodes}/>

                        {totalElements > 0 && (
                            <StatisticsPagination currentPage={currentPage} totalPages={totalPages} pageNumbers={pageNumbers} onPageChange={handlePageChange}/>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}

export default StatisticsPage;