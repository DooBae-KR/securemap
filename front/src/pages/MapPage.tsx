import {useEffect, useState} from "react";
import {fetchBuildings, type Building} from "../api/buildings";

function escapeHtml(value: string) {
    return value.replace(/[&<>'"]/g, (character) => (
        {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "'": "&#39;",
            '"': "&quot;",
        }[character]!
    ));
}

function loadNaverMaps(clientId: string): Promise<void> {
    return new Promise((resolve, reject) => {
        if (window.naver?.maps) {
            resolve();
            return;
        }

        const existingScript = document.querySelector<HTMLScriptElement>("script[data-naver-maps]");
        if (existingScript) {
            existingScript.addEventListener("load", () => resolve(), {once: true});
            existingScript.addEventListener("error", () => reject(new Error("Naver Maps SDK load failed")), {once: true});
            return;
        }

        const script = document.createElement("script");
        script.dataset.naverMaps = "true";
        script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Naver Maps SDK load failed"));
        document.head.appendChild(script);
    });
}

function MapPage() {
    const [buildings, setBuildings] = useState<Building[]>([]);
    const [selectedBuildingId, setSelectedBuildingId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [mapError, setMapError] = useState<string | null>(null);

    useEffect(() => {
        fetchBuildings()
            .then(setBuildings)
            .catch(() => setError("건물 목록을 불러오지 못했습니다."))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (buildings.length === 0) {
            return;
        }

        const clientId = import.meta.env.VITE_NAVER_MAP_CLIENT_ID;
        if (!clientId) {
            setMapError("VITE_NAVER_MAP_CLIENT_ID가 설정되지 않았습니다.");
            return;
        }

        let map: naver.maps.Map;
        let markers: naver.maps.Marker[] = [];
        let infoWindow: naver.maps.InfoWindow | null = null;
        let cancelled = false;

        const loadMap = async () => {
            try {
                await loadNaverMaps(clientId);

                if (cancelled) {
                    return;
                }

                const firstBuilding = buildings[0];
                const center = new naver.maps.LatLng(Number(firstBuilding.LAT), Number(firstBuilding.LNG));
                const mapElement = document.getElementById("map");

                if (!mapElement) {
                    return;
                }

                map = new naver.maps.Map(mapElement, {
                    center,
                    zoom: 12
                });
                infoWindow = new naver.maps.InfoWindow({
                    backgroundColor: "#f4f6f0",
                    borderColor: "#d5ddd4",
                    borderWidth: 1,
                    anchorSize: new naver.maps.Size(12, 14),
                    pixelOffset: new naver.maps.Point(0, -8),
                });

                markers = buildings.map((building) => {
                    const marker = new naver.maps.Marker({
                        position: new naver.maps.LatLng(Number(building.LAT), Number(building.LNG)),
                        map,
                        title: building.BUILD_NM,
                    });

                    naver.maps.Event.addListener(marker, "click", () => {
                        setSelectedBuildingId(building.BUILD_ID);
                        map.morph(marker.getPosition()!);
                        infoWindow?.setContent(`
              <div class="building-info-window">
                <strong>${escapeHtml(building.BUILD_NM)}</strong>
                <span>${escapeHtml(building.ADDRESS)}</span>
              </div>
            `);
                        infoWindow?.open(map, marker);
                    });

                    return marker;
                });
            } catch (mapLoadError) {
                console.error(mapLoadError);
                setMapError("네이버 지도를 불러오지 못했습니다. API 키와 허용 도메인을 확인해주세요.");
            }
        };

        void loadMap();

        return () => {
            cancelled = true;
            infoWindow?.close();
            markers.forEach((marker) => marker.setMap(null));
        };
    }, [buildings]);

    const selectBuilding = (building: Building) => {
        setSelectedBuildingId(building.BUILD_ID);
    };

    return (
        <div className="app-shell">
            <header className="topbar">
                <div>
                    <h1>SecureMap</h1>
                </div>
                <p className="result-count">{buildings.length} places mapped</p>
            </header>

            <main className="workspace">
                <aside className="building-panel">
                    <div className="panel-heading">
                        <div>
                            <p className="section-label">서울 건물</p>
                            <h2>건물 목록</h2>
                        </div>
                        <span className="count-badge">{buildings.length}</span>
                    </div>

                    {loading && <p className="state-message">건물 목록을 불러오는 중...</p>}
                    {error && <p className="state-message error-message">{error}</p>}
                    {!loading && !error && (
                        <div className="building-list">
                            {buildings.map((building, index) => (
                                <button
                                    className={`building-item ${selectedBuildingId === building.BUILD_ID ? "selected" : ""}`}
                                    key={building.BUILD_ID}
                                    onClick={() => selectBuilding(building)}
                                    type="button"
                                >
                                    <span className="item-number">{String(index + 1).padStart(2, "0")}</span>
                                    <span className="item-content">
                    <strong>{building.BUILD_NM}</strong>
                    <small>{building.ADDRESS}</small>
                  </span>
                                    <span className="item-arrow">↗</span>
                                </button>
                            ))}
                        </div>
                    )}
                </aside>

                <section className="map-panel" aria-label="건물 위치 지도">
                    <div id="map" className={mapError ? "map map-unavailable" : "map"}>
                        {mapError && <p>{mapError}</p>}
                    </div>
                    <div className="map-caption">
                        <span className="live-dot"/>
                        <span>Map view · Seoul</span>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default MapPage;