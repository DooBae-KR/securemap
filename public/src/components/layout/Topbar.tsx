import "./Topbar.css";

type TopbarPage = "map" | "statistics";

type TopbarProps = {
    currentPage: TopbarPage;
};

const NAVIGATION_ITEMS = [
    {
        page: "map",
        label: "지도",
        href: "#/",
    },
    {
        page: "statistics",
        label: "통계",
        href: "#/statistics",
    },
] as const;

function Topbar({currentPage}: TopbarProps) {
    return (
        <header className="app-topbar">
            <a className="app-topbar__brand" href="#" aria-label="지도 페이지로 이동">
                <span className="app-topbar__brand-mark">
                    서울
                </span>

                <span className="app-topbar__brand-copy">
                    <strong>
                        건축물 안전점검 관리 시스템
                    </strong>

                    <span>
                        서울시 건축물 안전점검 현황 조회
                    </span>
                </span>
            </a>

            <nav className="app-topbar__navigation" aria-label="주 메뉴">
                {NAVIGATION_ITEMS.map((item) => {
                    const isActive = currentPage === item.page;

                    return (
                        <a key={item.page}
                            className={["app-topbar__navigation-link",
                                isActive
                                    ? "app-topbar__navigation-link--active"
                                    : "",]
                                .filter(Boolean)
                                .join(" ")}
                            href={item.href}
                            aria-current={isActive ? "page" : undefined}>
                            {item.label}
                        </a>
                    );
                })}

                <span
                    className="app-topbar__navigation-link app-topbar__navigation-link--disabled"
                    aria-disabled="true"
                    title="검사기한 초과 관리 페이지 구현 예정">
                    검사기한 초과 관리
                </span>
            </nav>
        </header>
    );
}

export default Topbar;