import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type {
  MouseEvent as ReactMouseEvent,
} from "react";

import { fetchBuildings } from "../../api/buildings";
import type { Building } from "../../types/building";

import "./MapPage.css";

type InspectionStatus =
  | "normal"
  | "warning"
  | "expired"
  | "unknown";

/*
 * null 값 안전 처리
 */
function safeText(
  value: string | null | undefined
) {
  return value ?? "";
}

/*
 * 네이버 지도 InfoWindow HTML 특수문자 처리
 */
function escapeHtml(
  value: string | null | undefined
) {
  return safeText(value).replace(
    /[&<>'"]/g,
    (character) => {
      const entities: Record<string, string> = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      };

      return entities[character] ?? character;
    }
  );
}

/*
 * 네이버 지도 SDK 로드
 */
function loadNaverMaps(
  clientId: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.naver?.maps) {
      resolve();
      return;
    }

    const existingScript =
      document.querySelector<HTMLScriptElement>(
        "script[data-naver-maps]"
      );

    if (existingScript) {
      existingScript.addEventListener(
        "load",
        () => resolve(),
        { once: true }
      );

      existingScript.addEventListener(
        "error",
        () =>
          reject(
            new Error(
              "Naver Maps SDK load failed"
            )
          ),
        { once: true }
      );

      return;
    }

    const script =
      document.createElement("script");

    script.dataset.naverMaps = "true";

    script.src =
      `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`;

    script.async = true;

    script.onload = () => resolve();

    script.onerror = () =>
      reject(
        new Error(
          "Naver Maps SDK load failed"
        )
      );

    document.head.appendChild(script);
  });
}

/*
 * =========================================================
 * 임시 검사기한 상태
 *
 * 현재 DB에 검사기한 / 만료일 데이터가 없어서
 * 우선 normal로 고정
 * =========================================================
 */
function getMockStatus(): InspectionStatus {
  return "normal";
}

function getStatusLabel(
  status: InspectionStatus
) {
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

function MapPage() {
  /*
   * =========================================================
   * 기본 상태
   * =========================================================
   */
  const [buildings, setBuildings] =
    useState<Building[]>([]);

  const [
    selectedBuildingId,
    setSelectedBuildingId,
  ] = useState<number | null>(null);

  const [
    searchKeyword,
    setSearchKeyword,
  ] = useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [mapError, setMapError] =
    useState<string | null>(null);

  /*
   * 마커 표시 설정
   */
  const [showMarkers, setShowMarkers] =
    useState(true);

  const [
    showDeadlineMarkers,
    setShowDeadlineMarkers,
  ] = useState(true);

  /*
   * 검사기한 상태 필터
   */
  const [
    statusFilters,
    setStatusFilters,
  ] = useState<
    Record<InspectionStatus, boolean>
  >({
    normal: true,
    warning: true,
    expired: true,
    unknown: true,
  });

  /*
   * =========================================================
   * 상세 패널 위치
   * =========================================================
   */
  const [
    modalPosition,
    setModalPosition,
  ] = useState({
    x: 28,
    y: 18,
  });

  const draggingRef =
    useRef(false);

  const dragOffsetRef =
    useRef({
      x: 0,
      y: 0,
    });

  /*
   * =========================================================
   * 네이버 지도 Ref
   * =========================================================
   */
  const mapRef =
    useRef<naver.maps.Map | null>(null);

  const markerMapRef =
    useRef<
      Map<number, naver.maps.Marker>
    >(new Map());

  const infoWindowRef =
    useRef<naver.maps.InfoWindow | null>(
      null
    );

  /*
   * =========================================================
   * 상세 패널 드래그
   * =========================================================
   */
  const handleModalMouseDown = (
    event: ReactMouseEvent<HTMLDivElement>
  ) => {
    /*
     * 닫기 버튼 클릭 시 드래그 방지
     */
    if (
      (event.target as HTMLElement).closest(
        "button"
      )
    ) {
      return;
    }

    draggingRef.current = true;

    dragOffsetRef.current = {
      x:
        event.clientX -
        modalPosition.x,

      y:
        event.clientY -
        modalPosition.y,
    };

    const handleMouseMove = (
      moveEvent: MouseEvent
    ) => {
      if (!draggingRef.current) {
        return;
      }

      setModalPosition({
        x:
          moveEvent.clientX -
          dragOffsetRef.current.x,

        y:
          moveEvent.clientY -
          dragOffsetRef.current.y,
      });
    };

    const handleMouseUp = () => {
      draggingRef.current = false;

      window.removeEventListener(
        "mousemove",
        handleMouseMove
      );

      window.removeEventListener(
        "mouseup",
        handleMouseUp
      );
    };

    window.addEventListener(
      "mousemove",
      handleMouseMove
    );

    window.addEventListener(
      "mouseup",
      handleMouseUp
    );
  };

  /*
   * =========================================================
   * 백엔드 건물 데이터 조회
   * GET /api/buildings
   * =========================================================
   */
  useEffect(() => {
    fetchBuildings()
      .then(setBuildings)

      .catch((fetchError) => {
        console.error(fetchError);

        setError(
          "건물 목록을 불러오지 못했습니다."
        );
      })

      .finally(() => {
        setLoading(false);
      });
  }, []);

  /*
   * =========================================================
   * 검사기한 임시 상태 추가
   * =========================================================
   */
  const buildingsWithStatus =
    useMemo(() => {
      return buildings.map(
        (building) => ({
          ...building,

          inspectionStatus:
            getMockStatus(),
        })
      );
    }, [buildings]);

  /*
   * =========================================================
   * 검색 + 상태 필터
   * =========================================================
   */
  const filteredBuildings =
    useMemo(() => {
      const keyword =
        searchKeyword
          .trim()
          .toLowerCase();

      return buildingsWithStatus.filter(
        (building) => {
          const buildingName =
            safeText(
              building.BUILD_NM
            ).toLowerCase();

          const address =
            safeText(
              building.ADDRESS
            ).toLowerCase();

          const companyName =
            safeText(
              building.CHK_COMPANY_NM
            ).toLowerCase();

          const matchesSearch =
            !keyword ||
            buildingName.includes(
              keyword
            ) ||
            address.includes(keyword) ||
            companyName.includes(
              keyword
            );

          const matchesStatus =
            !showDeadlineMarkers ||
            statusFilters[
              building.inspectionStatus
            ];

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      buildingsWithStatus,
      searchKeyword,
      statusFilters,
      showDeadlineMarkers,
    ]);

  /*
   * 현재 선택된 건물
   */
  const selectedBuilding =
    useMemo(() => {
      return buildingsWithStatus.find(
        (building) =>
          building.BUILD_ID ===
          selectedBuildingId
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
    if (
      buildingsWithStatus.length === 0
    ) {
      return;
    }

    const clientId =
      import.meta.env
        .VITE_NAVER_MAP_CLIENT_ID;

    if (!clientId) {
      setMapError(
        "VITE_NAVER_MAP_CLIENT_ID가 설정되지 않았습니다."
      );

      return;
    }

    let cancelled = false;

    const loadMap = async () => {
      try {
        await loadNaverMaps(
          clientId
        );

        if (cancelled) {
          return;
        }

        /*
         * 좌표가 있는 첫 번째 건물을
         * 초기 중심으로 사용
         */
        const firstBuilding =
          buildingsWithStatus.find(
            (building) =>
              Number(
                building.LAT
              ) !== 0 &&
              Number(
                building.LNG
              ) !== 0
          ) ??
          buildingsWithStatus[0];

        const mapElement =
          document.getElementById(
            "map"
          );

        if (!mapElement) {
          return;
        }

        const map =
          new naver.maps.Map(
            mapElement,
            {
              center:
                new naver.maps.LatLng(
                  Number(
                    firstBuilding.LAT
                  ),

                  Number(
                    firstBuilding.LNG
                  )
                ),

              zoom: 14,
            }
          );

        mapRef.current = map;

        /*
         * InfoWindow
         */
        const infoWindow =
          new naver.maps.InfoWindow({
            backgroundColor:
              "#ffffff",

            borderColor:
              "#d7dee8",

            borderWidth: 1,

            anchorSize:
              new naver.maps.Size(
                12,
                14
              ),

            pixelOffset:
              new naver.maps.Point(
                0,
                -12
              ),
          });

        infoWindowRef.current =
          infoWindow;

        /*
         * 마커 목록
         */
        const markerMap =
          new Map<
            number,
            naver.maps.Marker
          >();

        buildingsWithStatus.forEach(
          (building) => {
            const lat =
              Number(building.LAT);

            const lng =
              Number(building.LNG);

            /*
             * 좌표가 없으면 마커 생성 X
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
                  building.BUILD_NM ??
                  "",
              });

            markerMap.set(
              building.BUILD_ID,
              marker
            );

            /*
             * 지도 마커 클릭
             */
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
                      ${escapeHtml(
                        building.BUILD_NM
                      )}
                    </strong>

                    <span>
                      ${
                        escapeHtml(
                          building.ADDRESS
                        ) || "-"
                      }
                    </span>

                    <span>
                      ${
                        escapeHtml(
                          building.CHK_COMPANY_NM
                        ) || "-"
                      }
                    </span>

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
          }
        );

        markerMapRef.current =
          markerMap;
      } catch (mapLoadError) {
        console.error(
          mapLoadError
        );

        setMapError(
          "네이버 지도를 불러오지 못했습니다. API 키와 허용 도메인을 확인해주세요."
        );
      }
    };

    void loadMap();

    /*
     * 페이지 이동 / 언마운트 시 정리
     */
    return () => {
      cancelled = true;

      infoWindowRef.current?.close();

      markerMapRef.current.forEach(
        (marker) => {
          marker.setMap(null);
        }
      );

      markerMapRef.current.clear();

      mapRef.current = null;
      infoWindowRef.current = null;
    };
  }, [buildingsWithStatus]);

  /*
   * =========================================================
   * 마커 ON/OFF + 상태 필터
   * =========================================================
   */
  useEffect(() => {
    markerMapRef.current.forEach(
      (
        marker,
        buildingId
      ) => {
        const building =
          buildingsWithStatus.find(
            (item) =>
              item.BUILD_ID ===
              buildingId
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
      inspectionStatus:
        InspectionStatus;
    }
  ) => {
    setSelectedBuildingId(
      building.BUILD_ID
    );

    /*
     * 새 건물 클릭 시 상세 패널 위치 초기화
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
            ${escapeHtml(
              building.BUILD_NM
            )}
          </strong>

          <span>
            ${
              escapeHtml(
                building.ADDRESS
              ) || "-"
            }
          </span>

          <span>
            ${
              escapeHtml(
                building.CHK_COMPANY_NM
              ) || "-"
            }
          </span>

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
   * 상태 체크박스
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
    <main className="workspace">

      {/* ==============================================
          왼쪽 사이드바
          ============================================== */}
      <aside className="sidebar">

        {/* 검색 */}
        <section
          className="
            sidebar-section
            search-section
          "
        >
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
              type="text"
              placeholder="건물명 · 주소 · 점검기관명"
              value={searchKeyword}
              onChange={(event) =>
                setSearchKeyword(
                  event.target.value
                )
              }
            />

            <span className="search-icon">
              ⌕
            </span>
          </div>

          <button
            className="reset-button"
            type="button"
            onClick={() =>
              setSearchKeyword("")
            }
          >
            검색 초기화
          </button>
        </section>

        {/* 검색 결과 */}
        <section
          className="
            sidebar-section
            result-section
          "
        >
          <div className="section-title-row">
            <h3>
              검색 결과
            </h3>

            <span>
              {filteredBuildings.length}
              건
            </span>
          </div>

          {loading && (
            <p className="state-message">
              건물 목록을 불러오는 중...
            </p>
          )}

          {error && (
            <p
              className="
                state-message
                error-message
              "
            >
              {error}
            </p>
          )}

          {!loading && !error && (
            <div className="building-list">
              {filteredBuildings.map(
                (building) => (
                  <button
                    key={
                      building.BUILD_ID
                    }
                    type="button"
                    className={`building-card ${
                      selectedBuildingId ===
                      building.BUILD_ID
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      selectBuilding(
                        building
                      )
                    }
                  >
                    <div className="building-card-top">

                      <strong>
                        {building.BUILD_NM ||
                          "-"}
                      </strong>

                      <span
                        className={`status-badge ${building.inspectionStatus}`}
                      >
                        <span className="status-dot" />

                        {getStatusLabel(
                          building.inspectionStatus
                        )}
                      </span>
                    </div>

                    <p>
                      {building.ADDRESS ||
                        "-"}
                    </p>

                    <small>
                      {building.CHK_COMPANY_NM ||
                        "-"}
                    </small>
                  </button>
                )
              )}
            </div>
          )}
        </section>

        {/* 표시 설정 */}
        <section
          className="
            sidebar-section
            settings-section
          "
        >
          <h3>
            표시 설정
          </h3>

          <label className="switch-row">
            <span>
              건물 부표 표시
            </span>

            <input
              type="checkbox"
              checked={showMarkers}
              onChange={(event) =>
                setShowMarkers(
                  event.target.checked
                )
              }
            />
          </label>

          <label className="switch-row">
            <span>
              검사기한 상태 마커 표시
            </span>

            <input
              type="checkbox"
              checked={
                showDeadlineMarkers
              }
              onChange={(event) =>
                setShowDeadlineMarkers(
                  event.target.checked
                )
              }
            />
          </label>
        </section>

        {/* 검사기한 상태 필터 */}
        <section
          className="
            sidebar-section
            filter-section
          "
        >
          <h3>
            검사기한 상태 필터
          </h3>

          {(
            [
              [
                "normal",
                "정상",
              ],
              [
                "warning",
                "기한 임박",
              ],
              [
                "expired",
                "기한 초과",
              ],
              [
                "unknown",
                "기준 미산정",
              ],
            ] as const
          ).map(
            ([status, label]) => (
              <label
                key={status}
                className="filter-row"
              >
                <input
                  type="checkbox"
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

      {/* ==============================================
          지도 영역
          ============================================== */}
      <section className="map-area">

        <div
          id="map"
          className={
            mapError
              ? "map map-unavailable"
              : "map"
          }
        >
          {mapError && (
            <p>
              {mapError}
            </p>
          )}
        </div>

        {/* 건물 상세 패널 */}
        {selectedBuilding && (
          <div
            className="building-detail-panel"
            style={{
              left:
                modalPosition.x,
              top:
                modalPosition.y,
            }}
          >
            <div
              className="detail-header"
              onMouseDown={
                handleModalMouseDown
              }
            >
              <div>
                <strong>
                  {selectedBuilding.BUILD_NM ||
                    "-"}
                </strong>

                <p>
                  {selectedBuilding.ADDRESS ||
                    "-"}
                </p>
              </div>

              <button
                type="button"
                aria-label="상세 정보 닫기"
                onClick={() =>
                  setSelectedBuildingId(
                    null
                  )
                }
              >
                ×
              </button>
            </div>

            <div className="detail-row">
              <span>
                점검기관명
              </span>

              <strong>
                {selectedBuilding.CHK_COMPANY_NM ||
                  "-"}
              </strong>
            </div>

            <div className="detail-row">
              <span>
                운영상태
              </span>

              <strong>
                {selectedBuilding.STATE_NM ||
                  "-"}
              </strong>
            </div>

            <div className="detail-row">
              <span>
                적용규모
              </span>

              <strong>
                {selectedBuilding.REQ_SIZE_NM ||
                  "-"}
              </strong>
            </div>

            <div className="detail-row">
              <span>
                안전진단 여부
              </span>

              <strong>
                {selectedBuilding.SAFE_CHK_YN ||
                  "-"}
              </strong>
            </div>

            <div className="detail-row">
              <span>
                점검진단 여부
              </span>

              <strong>
                {selectedBuilding.CHK_YN ||
                  "-"}
              </strong>
            </div>

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

            <div className="recent-history">
              <strong>
                최근 변경일시
              </strong>

              <p>
                {selectedBuilding.CHK_DATE ||
                  "-"}
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

        {/* 상태 범례 */}
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
  );
}

export default MapPage;