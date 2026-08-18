type StatisticsPaginationProps = {
    currentPage: number;
    totalPages: number;
    pageNumbers: number[];
    onPageChange: (page: number) => void;
};

function StatisticsPagination({currentPage, totalPages, pageNumbers, onPageChange,}: StatisticsPaginationProps) {
    if (totalPages <= 1) {
        return null;
    }

    return (
        <nav className="statistics-pagination" aria-label="점검기관 목록 페이지">
            <button type="button" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
                이전
            </button>

            {pageNumbers.map((page) => (
                <button key={page}
                        type="button" className={page === currentPage ? "statistics-pagination__button--active" : undefined}
                        aria-current={
                            page === currentPage
                                ? "page"
                                : undefined}
                        onClick={() => onPageChange(page)}>
                    {page}
                </button>
            ))}

            <button type="button" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                다음
            </button>
        </nav>
    );
}

export default StatisticsPagination;