import type {
    DiagnosisStatistic
} from "../../../types/statistics";

import {
    toDiagnosisSegments
} from "../utils/statisticsFormatters";

/**
 * title: 공통코드 차트 제목
 * statistics: /statis/left 또는 /statis/right API 응답
 */
type DiagnosisDonutCardProps = {
    title: string;
    statistics: DiagnosisStatistic[];
};

/**
 *
 * @param title COM_CD_TB.CD_NM
 * @param statistics  /statis/left 또는 /statis/right API 응답
 * @constructor
 */
function DiagnosisDonutCard({title, statistics}: DiagnosisDonutCardProps) {

    const segments = toDiagnosisSegments(statistics);

    // UNKNOWN까지 포함된 전체 건수
    const totalCount = segments.reduce((total, segment) => total + segment.count, 0);

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

                <span>
                    {totalCount.toLocaleString("ko-KR")}
                    건 기준
                </span>
            </header>

            <div className="statistics-diagnosis-card__content">
                <div className="statistics-donut" role="img" aria-label={`${title}. ${chartDescription}`}>
                    <svg viewBox="0 0 176 176" aria-hidden="true">
                        <circle className="statistics-donut__track" cx="88" cy="88" r={radius}/>

                        {totalCount > 0 &&
                            segments.map((segment) => {
                                const segmentLength = (segment.count / totalCount) * circumference;

                                const dashOffset = -accumulatedLength;

                                accumulatedLength += segmentLength;

                                if (segment.count === 0) {
                                    return null;
                                }

                                return (
                                    <circle key={segment.code} cx="88" cy="88"
                                            className={"statistics-donut__segment"}
                                            r={radius}
                                            stroke={segment.color}
                                            strokeDasharray={`${segmentLength} ` + `${circumference - segmentLength}`}
                                            strokeDashoffset={dashOffset}/>
                                );
                            })}
                    </svg>

                    <div className="statistics-donut__center">
                        <strong>
                            {totalCount.toLocaleString("ko-KR",)}건
                        </strong>

                        <span>등록정보</span>
                    </div>
                </div>

                <div className="statistics-diagnosis-legend" aria-label={`${title} 범례`}>
                    {segments.map((segment) => {
                        const percentage = totalCount === 0 ? 0 : (segment.count / totalCount) * 100;

                        return (
                            <div key={segment.code} className={"statistics-diagnosis-legend__item"}>
                                <i aria-hidden="true" style={{backgroundColor: segment.color,}}/>

                                <span>
                                    {segment.label}
                                </span>

                                <strong>
                                    {segment.count.toLocaleString("ko-KR",)}건
                                </strong>

                                <em>
                                    {percentage.toFixed(1)}%
                                </em>
                            </div>
                        );
                    })}
                </div>
            </div>

            <p className="statistics-diagnosis-card__footnote">
                {totalCount === 0
                    ? "조회 결과가 없습니다."
                    : `전체 ${totalCount.toLocaleString("ko-KR")}건`}
            </p>
        </article>
    );
}

export default DiagnosisDonutCard;