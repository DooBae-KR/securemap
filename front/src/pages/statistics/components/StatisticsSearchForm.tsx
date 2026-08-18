import type {
    ChangeEvent,
    SubmitEvent
} from "react";

import type {
    SearchConditions,
    SelectOption
} from "../../../types/statistics";

/**
 * select의 option 목록을 렌더링한다.
 */
type SelectOptionItemsProps = { options: readonly SelectOption[]; };

function SelectOptionItems({options}: SelectOptionItemsProps) {
    return (
        <>
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </>
    );
}

type StatisticsSearchFormProps = {
    searchConditions: SearchConditions;

    districtOptions: readonly SelectOption[];
    requestSizeOptions: readonly SelectOption[];
    diagnosisOptions: readonly SelectOption[];
    agencyTypeOptions: readonly SelectOption[];

    isLoading: boolean;

    onConditionChange: (
        event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => void;

    onSubmit: (
        event: SubmitEvent<HTMLFormElement>,
    ) => void;

    onReset: () => void;
};

function StatisticsSearchForm({searchConditions,
                                  districtOptions,
                                  requestSizeOptions,
                                  diagnosisOptions,
                                  agencyTypeOptions,
                                  isLoading,
                                  onConditionChange,
                                  onSubmit,
                                  onReset}: StatisticsSearchFormProps) {
    return (
        <section className="statistics-search" aria-labelledby="statistics-search-title">
            <div className="statistics-search__heading">
                <h2 id="statistics-search-title">
                    조건 검색
                </h2>
            </div>

            <form className="statistics-search__form" onSubmit={onSubmit} aria-busy={isLoading}>
                <div className="statistics-search__grid">
                    <div className="statistics-field">
                        <label htmlFor="agencyName">점검기관명</label>

                        <input id="agencyName"
                               name="agencyName"
                               type="search"
                               value={searchConditions.agencyName}
                               onChange={onConditionChange}
                               placeholder="점검기관명 입력"
                               disabled={isLoading}/>
                    </div>

                    <div className="statistics-field">
                        <label htmlFor="districtCode">자치구</label>

                        <select id="districtCode"
                                name="districtCode"
                                value={searchConditions.districtCode}
                                onChange={onConditionChange}
                                disabled={isLoading}>
                            <option value="">전체</option>
                            <SelectOptionItems options={districtOptions}/>
                        </select>
                    </div>

                    <div className="statistics-field">
                        <label htmlFor="requestSizeCode">신청규모</label>

                        <select id="requestSizeCode"
                                name="requestSizeCode"
                                value={searchConditions.requestSizeCode}
                                onChange={onConditionChange}
                                disabled={isLoading}>
                            <option value="">전체</option>
                            <SelectOptionItems options={requestSizeOptions}/>
                        </select>
                    </div>

                    <div className="statistics-field">
                        <label htmlFor="safeDiagnosisYn">안전진단 여부</label>

                        <select id="safeDiagnosisYn"
                                name="safeDiagnosisYn"
                                value={searchConditions.safeDiagnosisYn}
                                onChange={onConditionChange}
                                disabled={isLoading}>
                            <option value="">전체</option>
                            <SelectOptionItems options={diagnosisOptions}/>
                        </select>
                    </div>

                    <div className="statistics-field">
                        <label htmlFor="checkDiagnosisYn">점검진단 여부</label>

                        <select id="checkDiagnosisYn"
                                name="checkDiagnosisYn"
                                value={searchConditions.checkDiagnosisYn}
                                onChange={onConditionChange}
                                disabled={isLoading}>
                            <option value="">전체</option>
                            <SelectOptionItems options={diagnosisOptions}/>
                        </select>
                    </div>

                    <div className="statistics-field">
                        <label htmlFor="agencyTypeCode">점검기관 구분</label>

                        <select id="agencyTypeCode"
                                name="agencyTypeCode"
                                value={searchConditions.agencyTypeCode}
                                onChange={onConditionChange}
                                disabled={isLoading}>
                            <option value="">전체</option>
                            <SelectOptionItems options={agencyTypeOptions}/>
                        </select>
                    </div>
                </div>

                <div className="statistics-search__actions">
                    <button className={"statistics-button " + "statistics-button--secondary"}
                            type="button" onClick={onReset} disabled={isLoading}>
                        초기화
                    </button>

                    <button className={"statistics-button " + "statistics-button--primary"} type="submit" disabled={isLoading}>
                        {isLoading ? "조회 중..." : "검색"}
                    </button>
                </div>
            </form>
        </section>
    );
}

export default StatisticsSearchForm;