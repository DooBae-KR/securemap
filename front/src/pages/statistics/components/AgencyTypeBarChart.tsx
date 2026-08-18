import type {
    AgencyTypeStatistic
} from "../../../types/statistics";

import {
    toAgencyTypeBars
} from "../utils/statisticsFormatters";

/**
 * title: 세션제목
 * statistics: API 응답
 */
type AgencyTypeBarChartProps = {
    title: string;
    statistics: AgencyTypeStatistic[];
};

function AgencyTypeBarChart({title, statistics}: AgencyTypeBarChartProps) {

    const bars = toAgencyTypeBars(statistics);

    /**
     * 막대 길이 계산의 기준이 되는 최대 건수
     */
    const maxCount = Math.max(...bars.map((bar) => bar.count), 0);

    const chartDescription =
        bars.length === 0
            ? "조회 결과가 없습니다."
            : bars
                .map((bar) => `${bar.label} ${bar.count}건`)
                .join(", ");

    return (
        <div className="statistics-agency-bars" role="img" aria-label={`${title}. ${chartDescription}`}>
            {bars.length === 0 ? (
                <p>조회 결과가 없습니다.</p>
            ) : (
                bars.map((bar) => {
                    /**
                     * 가장 큰 건수를 100%로 두고
                     * 각 막대의 상대적인 길이를 계산한다.
                     */
                    const width = maxCount === 0 ? 0 : (bar.count / maxCount) * 100;

                    return (
                        <div key={bar.code} className={"statistics-agency-bars__row"}>
                            <span className={"statistics-agency-bars__label"}>
                                {bar.label}
                            </span>

                            <span className={"statistics-agency-bars__track"} aria-hidden="true">
                                <span className={"statistics-agency-bars__fill"} style={{width: `${width}%`,}}/>
                            </span>

                            <strong>
                                {bar.count.toLocaleString("ko-KR")}건
                            </strong>
                        </div>
                    );
                })
            )}
        </div>
    );
}

export default AgencyTypeBarChart;