import {useEffect, useState} from "react";
import StatisticsPage from "./pages/StatisticsPage";
import MapPage from "./pages/MapPage";

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
            window.removeEventListener("hashchange", handleHashChange);
        };
    }, []);

    return page === "statistics" ? <StatisticsPage/> : <MapPage/>;
}

export default App;