import {useEffect, useState} from "react";
import Topbar from "./components/layout/Topbar"
import MapPage from "./pages/map/MapPage";
import StatisticsPage from "./pages/statistics/StatisticsPage";

type AppPage = "map" | "statistics";

function getPageFromHash(): AppPage {
    return window.location.hash.startsWith("#/statistics") ? "statistics" : "map";
}

function App() {
    const [page, setPage] = useState<AppPage>(getPageFromHash);

    useEffect(() => {
        const handleHashChange = () => {
            setPage(getPageFromHash());
        };

        window.addEventListener("hashchange", handleHashChange);

        return () => {
            window.removeEventListener(
                "hashchange",
                handleHashChange,
            );
        };
    }, []);

    return (
        <div className="app-layout">
            <Topbar currentPage={page}/>

            <div className="app-layout__content">
                {page === "statistics"
                    ? <StatisticsPage/>
                    : <MapPage/>}
            </div>
        </div>
    );
}

export default App;