import { useEffect, useMemo, useRef, useState } from "react";
import { fetchBuildings, type Building } from "./api/buildings";

type InspectionStatus = "normal" | "warning" | "expired" | "unknown";

/*
 * null 값도 안전하게 처리하기 위한 함수
 */
function safeText(value: string | null | undefined) {
  return value ?? "";
}

/*
 * 네이버 지도 InfoWindow에 문자열을 넣을 때
 * HTML 특수문자 처리
 */
function escapeHtml(value: string | null | undefined) {
  return safeText(value).replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;",
    };

    return entities[character] ?? character;
  });
}

/*
 * 네이버 지도 SDK 로드
 */
function loadNaverMaps(clientId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.naver?.maps) {
      resolve();
      return;
    }

    const existingScript =
      document.querySelector<HTMLScriptElement>("script[data-naver-maps]");

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), {
        once: true,
      });

      existingScript.addEventListener(
        "error",
        () => reject(new Error("Naver Maps SDK load failed")),
        { once: true }
      );

      return;
    }

    const script = document.createElement("script");

    script.dataset.naverMaps = "true";
    script.src =
      `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`;
    script.async = true;

    script.onload = () => resolve();

    script.onerror = () =>
      reject(new Error("Naver Maps SDK load failed"));

    document.head.appendChild(script);
  });
}

/*
 * =========================================================
 * [가상 데이터]
 *
 * 현재 DB에는 검사기한/만료일 정보가 없기 때문에
 * 정상 / 기한 임박 / 기한 초과 상태만 임시 생성.
 *
 * 나머지 건물 상세정보는 실제 DB 데이터를 사용함.
 *
 * 추후 검사기한 데이터가 확보되면 이 함수 삭제 예정.
 * =========================================================
 */
function getMockStatus(): InspectionStatus {
  return "normal";
}

/*
 * 검사기한 상태 화면 표시명
 */
function getStatusLabel(status: InspectionStatus) {
  switch (status) {
    case "normal":
      return "정상";

    case "warning":
      return "기한 임박";

    case "expired":
      return "기한 초과";

    default:
      return "기준 미산정";
  }
}

function App() {
  const [buildings, setBuildings] = useState<Building[]>([]);

  const [selectedBuildingId, setSelectedBuildingId] =
    useState<number | null>(null);

  const [searchKeyword, setSearchKeyword] = useState("");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [mapError, setMapError] = useState<string | null>(null);

  const [showMarkers, setShowMarkers] = useState(true);

  /*
   * 검사기한 상태 마커 표시 여부
   *
   * 현재 검사기한 상태 자체가 가상 데이터임.
   */
  const [showDeadlineMarkers, setShowDeadlineMarkers] =
    useState(true);

  /*
   * 검사기한 상태 필터
   *
   * 현재는 가상 상태를 기준으로 필터링.
   */
  const [statusFilters, setStatusFilters] = useState<
    Record<InspectionStatus, boolean>
  >({
    normal: true,
    warning: true,
    expired: true,
    unknown: true,
  });

  /*
   * =========================================================
   * 상세 모달 드래그 위치
   * =========================================================
   */
  const [modalPosition, setModalPosition] = useState({
    x: 28,
    y: 18,
  });

  const draggingRef = useRef(false);

  const dragOffsetRef = useRef({
    x: 0,
    y: 0,
  });

  const mapRef = useRef<naver.maps.Map | null>(null);

  const markerMapRef =
    useRef<Map<number, naver.maps.Marker>>(new Map());

  const infoWindowRef =
    useRef<naver.maps.InfoWindow | null>(null);

  /*
   * =========================================================
   * 상세 모달 드래그
   * =========================================================
   */
  const handleModalMouseDown = (
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    /*
     * X 버튼에서는 드래그하지 않음
     */
    if ((event.target as HTMLElement).closest("button")) {
      return;
    }

    draggingRef.current = true;

    dragOffsetRef.current = {
      x: event.clientX - modalPosition.x,
      y: event.clientY - modalPosition.y,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!draggingRef.current) {
        return;
      }

      setModalPosition({
        x: moveEvent.clientX - dragOffsetRef.current.x,
        y: moveEvent.clientY - dragOffsetRef.current.y,
      });
    };

    const handleMouseUp = () => {
      draggingRef.current = false;

      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  /*
   * =========================================================
   * 실제 백엔드 API 호출
   *
   * GET /api/buildings
   *
   * models/building.js에서
   * MOLIT_MAP_INFO + MOLIT_HISTORY 조회
   * =========================================================
   */
  useEffect(() => {
    fetchBuildings()
      .then(setBuildings)

      .catch((fetchError) => {
        console.error(fetchError);

        setError("건물 목록을 불러오지 못했습니다.");
      })

      .finally(() => {
        setLoading(false);
      });
  }, []);

  /*
   * =========================================================
   * [가상 데이터 적용]
   *
   * 실제 DB 데이터에 검사기한 상태만 임시로 추가.
   * =========================================================
   */
 const buildingsWithStatus = useMemo(() => {
  return buildings.map((building) => ({
    ...building,
    inspectionStatus: getMockStatus(),
  }));
}, [buildings]);

  /*
   * =========================================================
   * 검색 + 검사기한 상태 필터
   *
   * 실제 검색 대상:
   * 건물명
   * 주소
   * 점검기관명
   * =========================================================
   */
  const filteredBuildings = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();

    return buildingsWithStatus.filter((building) => {
      const buildingName =
        safeText(building.BUILD_NM).toLowerCase();

      const address =
        safeText(building.ADDRESS).toLowerCase();

      const companyName =
        safeText(building.CHK_COMPANY_NM).toLowerCase();

      const matchesSearch =
        !keyword ||
        buildingName.includes(keyword) ||
        address.includes(keyword) ||
        companyName.includes(keyword);

      /*
       * 검사기한 상태 표시가 꺼져 있으면
       * 상태 필터를 적용하지 않음
       */
      const matchesStatus =
        !showDeadlineMarkers ||
        statusFilters[building.inspectionStatus];

      return matchesSearch && matchesStatus;
    });
  }, [
    buildingsWithStatus,
    searchKeyword,
    statusFilters,
    showDeadlineMarkers,
  ]);

  /*
   * 현재 선택된 건물
   */
  const selectedBuilding = useMemo(() => {
    return buildingsWithStatus.find(
      (building) =>
        building.BUILD_ID === selectedBuildingId
    );
  }, [
    buildingsWithStatus,
    selectedBuildingId,
  ]);

  /*
   * =========================================================
   * 네이버 지도 생성
   * =========================================================
   */
  useEffect(() => {
    if (buildingsWithStatus.length === 0) {
      return;
    }

    const clientId =
      import.meta.env.VITE_NAVER_MAP_CLIENT_ID;

    if (!clientId) {
      setMapError(
        "VITE_NAVER_MAP_CLIENT_ID가 설정되지 않았습니다."
      );

      return;
    }

    let cancelled = false;

    const loadMap = async () => {
      try {
        await loadNaverMaps(clientId);

        if (cancelled) {
          return;
        }

        /*
         * LAT/LNG가 0이 아닌 첫 번째 건물을
         * 지도 초기 중심점으로 사용
         */
        const firstBuilding =
          buildingsWithStatus.find(
            (building) =>
              Number(building.LAT) !== 0 &&
              Number(building.LNG) !== 0
          ) ?? buildingsWithStatus[0];

        const mapElement =
          document.getElementById("map");

        if (!mapElement) {
          return;
        }

        const map = new naver.maps.Map(
          mapElement,
          {
            center: new naver.maps.LatLng(
              Number(firstBuilding.LAT),
              Number(firstBuilding.LNG)
            ),

            zoom: 14,
          }
        );

        mapRef.current = map;

        const infoWindow =
          new naver.maps.InfoWindow({
            backgroundColor: "#ffffff",

            borderColor: "#d7dee8",

            borderWidth: 1,

            anchorSize:
              new naver.maps.Size(12, 14),

            pixelOffset:
              new naver.maps.Point(0, -12),
          });

        infoWindowRef.current = infoWindow;

        const markerMap =
          new Map<number, naver.maps.Marker>();

        buildingsWithStatus.forEach((building) => {
          const lat = Number(building.LAT);
          const lng = Number(building.LNG);

          /*
           * 좌표가 없거나 0,0이면
           * 지도 마커 생성하지 않음.
           */
          if (
            !Number.isFinite(lat) ||
            !Number.isFinite(lng) ||
            lat === 0 ||
            lng === 0
          ) {
            return;
          }

          const marker =
            new naver.maps.Marker({
              position:
                new naver.maps.LatLng(
                  lat,
                  lng
                ),

              map,

              title:
                building.BUILD_NM ?? "",
            });

          markerMap.set(
            building.BUILD_ID,
            marker
          );

          naver.maps.Event.addListener(
            marker,
            "click",
            () => {
              setSelectedBuildingId(
                building.BUILD_ID
              );

              map.panTo(
                marker.getPosition()!
              );

              infoWindow.setContent(`
                <div class="building-info-window">

                  <strong>
                    ${escapeHtml(building.BUILD_NM)}
                  </strong>

                  <span>
                    ${escapeHtml(building.ADDRESS) || "-"}
                  </span>

                  <span>
                    ${escapeHtml(building.CHK_COMPANY_NM) || "-"}
                  </span>

                  <!--
                    검사기한 상태만 가상 데이터
                  -->
                  <span
                    class="
                      popup-status
                      popup-${building.inspectionStatus}
                    "
                  >
                    ${getStatusLabel(
                      building.inspectionStatus
                    )}
                  </span>

                </div>
              `);

              infoWindow.open(
                map,
                marker
              );
            }
          );
        });

        markerMapRef.current =
          markerMap;

      } catch (mapLoadError) {
        console.error(mapLoadError);

        setMapError(
          "네이버 지도를 불러오지 못했습니다. API 키와 허용 도메인을 확인해주세요."
        );
      }
    };

    void loadMap();

    return () => {
      cancelled = true;

      infoWindowRef.current?.close();

      markerMapRef.current.forEach(
        (marker) => {
          marker.setMap(null);
        }
      );

      markerMapRef.current.clear();
    };

  }, [buildingsWithStatus]);

  /*
   * =========================================================
   * 마커 표시 ON/OFF + 상태 필터
   * =========================================================
   */
  useEffect(() => {
    markerMapRef.current.forEach(
      (marker, buildingId) => {
        const building =
          buildingsWithStatus.find(
            (item) =>
              item.BUILD_ID === buildingId
          );

        if (!building) {
          return;
        }

        const statusVisible =
          !showDeadlineMarkers ||
          statusFilters[
            building.inspectionStatus
          ];

        const isVisible =
          showMarkers &&
          statusVisible;

        marker.setMap(
          isVisible
            ? mapRef.current
            : null
        );
      }
    );

  }, [
    showMarkers,
    showDeadlineMarkers,
    statusFilters,
    buildingsWithStatus,
  ]);

  /*
   * =========================================================
   * 왼쪽 건물 목록 클릭
   * =========================================================
   */
  const selectBuilding = (
    building: Building & {
      inspectionStatus: InspectionStatus;
    }
  ) => {
    setSelectedBuildingId(
      building.BUILD_ID
    );

    /*
     * 다른 건물 선택 시 상세 모달을
     * 기본 위치로 다시 이동
     */
    setModalPosition({
      x: 28,
      y: 18,
    });

    const marker =
      markerMapRef.current.get(
        building.BUILD_ID
      );

    const map =
      mapRef.current;

    if (marker && map) {
      map.panTo(
        marker.getPosition()!
      );

      map.setZoom(16);

      infoWindowRef.current?.setContent(`
        <div class="building-info-window">

          <strong>
            ${escapeHtml(building.BUILD_NM)}
          </strong>

          <span>
            ${escapeHtml(building.ADDRESS) || "-"}
          </span>

          <span>
            ${escapeHtml(building.CHK_COMPANY_NM) || "-"}
          </span>

          <!-- 검사기한 상태만 가상 데이터 -->
          <span
            class="
              popup-status
              popup-${building.inspectionStatus}
            "
          >
            ${getStatusLabel(
              building.inspectionStatus
            )}
          </span>

        </div>
      `);

      infoWindowRef.current?.open(
        map,
        marker
      );
    }
  };

  /*
   * 상태 필터 체크박스
   */
  const toggleStatusFilter = (
    status: InspectionStatus
  ) => {
    setStatusFilters(
      (current) => ({
        ...current,

        [status]:
          !current[status],
      })
    );
  };

  return (
    <div className="app-shell">

      {/* =====================================================
          상단 메뉴
          ===================================================== */}
      <header className="top-navigation">

        <div className="brand">
          <span className="brand-icon">
            ◉
          </span>

          <strong>
            건축물 안전점검 관리 시스템
          </strong>
        </div>

        <nav className="navigation-menu">

          <button
            className="nav-button active"
            type="button"
          >
            지도
          </button>

          <button
            className="nav-button"
            type="button"
          >
            통계
          </button>

          <button
            className="nav-button"
            type="button"
          >
            검사기한 초과 관리
          </button>

        </nav>
      </header>

      <main className="workspace">

        {/* =====================================================
            왼쪽 사이드바
            ===================================================== */}
        <aside className="sidebar">

          {/* 검색 영역 */}
          <section className="sidebar-section search-section">

            <h2>
              지도 조회
            </h2>

            <p className="section-description">
              건물명, 주소, 점검기관명으로
              등록 위치와 검사기한 상태를
              확인합니다.
            </p>

            <label
              className="field-label"
              htmlFor="building-search"
            >
              건물 · 기관 검색
            </label>

            <div className="search-box">

              <input
                id="building-search"

                onChange={(event) =>
                  setSearchKeyword(
                    event.target.value
                  )
                }

                placeholder="건물명 · 주소 · 점검기관명"

                type="text"

                value={searchKeyword}
              />

              <span className="search-icon">
                ⌕
              </span>

            </div>

            <button
              className="reset-button"

              onClick={() =>
                setSearchKeyword("")
              }

              type="button"
            >
              검색 초기화
            </button>

          </section>

          {/* ===================================================
              검색 결과
              =================================================== */}
          <section className="sidebar-section result-section">

            <div className="section-title-row">

              <h3>
                검색 결과
              </h3>

              <span>
                {filteredBuildings.length}건
              </span>

            </div>

            {loading && (
              <p className="state-message">
                건물 목록을 불러오는 중...
              </p>
            )}

            {error && (
              <p className="state-message error-message">
                {error}
              </p>
            )}

            {!loading && !error && (
              <div className="building-list">

                {filteredBuildings.map(
                  (building) => (
                    <button
                      className={`building-card ${
                        selectedBuildingId ===
                        building.BUILD_ID
                          ? "selected"
                          : ""
                      }`}

                      key={building.BUILD_ID}

                      onClick={() =>
                        selectBuilding(
                          building
                        )
                      }

                      type="button"
                    >

                      <div className="building-card-top">

                        {/* 실제 DB 건물명 */}
                        <strong>
                          {building.BUILD_NM || "-"}
                        </strong>

                        {/*
                         * =============================
                         * 검사기한 상태만 가상 데이터
                         * =============================
                         */}
                        <span
                          className={`status-badge ${building.inspectionStatus}`}
                        >
                          <span className="status-dot" />

                          {getStatusLabel(
                            building.inspectionStatus
                          )}
                        </span>

                      </div>

                      {/* 실제 주소 */}
                      <p>
                        {building.ADDRESS || "-"}
                      </p>

                      {/* 실제 점검기관명 */}
                      <small>
                        {building.CHK_COMPANY_NM || "-"}
                      </small>

                    </button>
                  )
                )}

              </div>
            )}

          </section>

          {/* ===================================================
              표시 설정
              =================================================== */}
          <section className="sidebar-section settings-section">

            <h3>
              표시 설정
            </h3>

            <label className="switch-row">

              <span>
                건물 부표 표시
              </span>

              <input
                checked={showMarkers}

                onChange={(event) =>
                  setShowMarkers(
                    event.target.checked
                  )
                }

                type="checkbox"
              />

            </label>

            <label className="switch-row">

              <span>
                검사기한 상태 마커 표시
              </span>

              <input
                checked={
                  showDeadlineMarkers
                }

                onChange={(event) =>
                  setShowDeadlineMarkers(
                    event.target.checked
                  )
                }

                type="checkbox"
              />

            </label>

          </section>

          {/*
           * ===================================================
           * 검사기한 상태 필터
           *
           * 현재 검사기한 데이터가 없으므로
           * 아래 상태는 가상 데이터 기반
           * ===================================================
           */}
          <section className="sidebar-section filter-section">

            <h3>
              검사기한 상태 필터
            </h3>

            {(
              [
                ["normal", "정상"],
                ["warning", "기한 임박"],
                ["expired", "기한 초과"],
                ["unknown", "기준 미산정"],
              ] as const
            ).map(
              ([status, label]) => (
                <label
                  className="filter-row"
                  key={status}
                >

                  <input
                    checked={
                      statusFilters[
                        status
                      ]
                    }

                    onChange={() =>
                      toggleStatusFilter(
                        status
                      )
                    }

                    type="checkbox"
                  />

                  <span
                    className={`filter-dot ${status}`}
                  />

                  <span>
                    {label}
                  </span>

                </label>
              )
            )}

          </section>

        </aside>

        {/* =====================================================
            지도
            ===================================================== */}
        <section className="map-area">

          <div
            className={
              mapError
                ? "map map-unavailable"
                : "map"
            }

            id="map"
          >
            {mapError && (
              <p>
                {mapError}
              </p>
            )}
          </div>

          {/* ===================================================
              건물 상세 모달
              =================================================== */}
          {selectedBuilding && (
            <div
              className="building-detail-panel"

              style={{
                left: modalPosition.x,
                top: modalPosition.y,
              }}
            >

              {/*
               * 파란 헤더를 잡고 드래그 가능
               */}
              <div
                className="detail-header"
                onMouseDown={
                  handleModalMouseDown
                }
              >

                <div>

                  {/* 실제 DB 건물명 */}
                  <strong>
                    {selectedBuilding.BUILD_NM || "-"}
                  </strong>

                  {/* 실제 주소 */}
                  <p>
                    {selectedBuilding.ADDRESS || "-"}
                  </p>

                </div>

                <button
                  aria-label="상세 정보 닫기"

                  onClick={() =>
                    setSelectedBuildingId(
                      null
                    )
                  }

                  type="button"
                >
                  ×
                </button>

              </div>

              {/*
               * =================================================
               * 여기부터 실제 DB 데이터
               * =================================================
               */}

              <div className="detail-row">

                <span>
                  점검기관명
                </span>

                <strong>
                  {selectedBuilding.CHK_COMPANY_NM || "-"}
                </strong>

              </div>

              <div className="detail-row">

                <span>
                  운영상태
                </span>

                <strong>
                  {selectedBuilding.STATE_NM || "-"}
                </strong>

              </div>

              <div className="detail-row">

                <span>
                  적용규모
                </span>

                <strong>
                  {selectedBuilding.REQ_SIZE_NM || "-"}
                </strong>

              </div>

              <div className="detail-row">

                <span>
                  안전진단 여부
                </span>

                <strong>
                  {selectedBuilding.SAFE_CHK_YN || "-"}
                </strong>

              </div>

              <div className="detail-row">

                <span>
                  점검진단 여부
                </span>

                <strong>
                  {selectedBuilding.CHK_YN || "-"}
                </strong>

              </div>

              {/*
               * =================================================
               * 검사기한 상태만 가상 데이터
               *
               * DB에 실제 검사기한/만료일 컬럼 추가 후 변경 예정
               * =================================================
               */}
              <div className="detail-row">

                <span>
                  검사기한 상태
                </span>

                <span
                  className={`status-badge ${selectedBuilding.inspectionStatus}`}
                >

                  <span className="status-dot" />

                  {getStatusLabel(
                    selectedBuilding.inspectionStatus
                  )}

                </span>

              </div>

              {/*
               * =================================================
               * 실제 MOLIT_HISTORY.CHK_DATE
               * =================================================
               */}
              <div className="recent-history">

                <strong>
                  최근 변경일시
                </strong>

                <p>
                  {selectedBuilding.CHK_DATE || "-"}
                </p>

              </div>

              <div className="detail-actions">

                <button
                  className="secondary-button"
                  type="button"
                >
                  초과 관리 보기
                </button>

                <button
                  className="primary-button"
                  type="button"
                >
                  상세정보 보기
                </button>

              </div>

            </div>
          )}

          {/*
           * =====================================================
           * 검사기한 상태 범례
           *
           * 현재는 가상 검사기한 상태 기준
           * =====================================================
           */}
          {showDeadlineMarkers && (
            <div className="legend-box">

              <strong>
                검사기한 상태 범례
              </strong>

              <div>
                <span className="filter-dot normal" />
                정상
              </div>

              <div>
                <span className="filter-dot warning" />
                기한 임박
              </div>

              <div>
                <span className="filter-dot expired" />
                기한 초과
              </div>

              <div>
                <span className="filter-dot unknown" />
                기준 미산정
              </div>

            </div>
          )}

        </section>

      </main>

    </div>
  );
}

export default App;