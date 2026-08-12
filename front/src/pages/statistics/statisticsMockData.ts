export type DiagnosisYn = "Y" | "N" | "";

export type InspectionAgency = {
    agencyId: number;
    agencyNumber: string;
    agencyName: string;
    agencyTypeCode: string;
    buildingName: string;
    address: string;
    district: string;
    requestSizeCodes: string[];
    safeDiagnosisYn: DiagnosisYn;
    checkDiagnosisYn: DiagnosisYn;
};

// 통계 API 연동 전 검색 기능을 확인하기 위한 개발용 데이터입니다.
export const MOCK_INSPECTION_AGENCIES: InspectionAgency[] = [
    {
        agencyId: 1,
        agencyNumber: "11194",
        agencyName: "서울건축사사무소",
        agencyTypeCode: "01",
        buildingName: "강남 업무시설",
        address: "서울특별시 강남구 테헤란로 10",
        district: "강남구",
        requestSizeCodes: ["10"],
        safeDiagnosisYn: "Y",
        checkDiagnosisYn: "Y",
    },
    {
        agencyId: 2,
        agencyNumber: "11196",
        agencyName: "한빛건설기술",
        agencyTypeCode: "02",
        buildingName: "송파 복합시설",
        address: "서울특별시 송파구 올림픽로 120",
        district: "송파구",
        requestSizeCodes: ["20"],
        safeDiagnosisYn: "Y",
        checkDiagnosisYn: "Y",
    },
    {
        agencyId: 3,
        agencyNumber: "11212",
        agencyName: "도시안전진단연구소",
        agencyTypeCode: "03",
        buildingName: "서초 공동주택",
        address: "서울특별시 서초구 서초대로 45",
        district: "서초구",
        requestSizeCodes: ["30"],
        safeDiagnosisYn: "Y",
        checkDiagnosisYn: "N",
    },
    {
        agencyId: 4,
        agencyNumber: "11700",
        agencyName: "국토안전관리원 서울지사",
        agencyTypeCode: "04",
        buildingName: "용산 업무시설",
        address: "서울특별시 용산구 한강대로 80",
        district: "용산구",
        requestSizeCodes: ["20", "30"],
        safeDiagnosisYn: "Y",
        checkDiagnosisYn: "Y",
    },
    {
        agencyId: 5,
        agencyNumber: "11702",
        agencyName: "가온기술사사무소",
        agencyTypeCode: "05",
        buildingName: "마곡 연구시설",
        address: "서울특별시 강서구 마곡중앙로 58",
        district: "강서구",
        requestSizeCodes: ["10", "20"],
        safeDiagnosisYn: "",
        checkDiagnosisYn: "",
    },
    {
        agencyId: 6,
        agencyNumber: "11805",
        agencyName: "한국부동산원 서울지사",
        agencyTypeCode: "06",
        buildingName: "을지로 상업시설",
        address: "서울특별시 중구 을지로 75",
        district: "중구",
        requestSizeCodes: ["30"],
        safeDiagnosisYn: "Y",
        checkDiagnosisYn: "Y",
    },
    {
        agencyId: 7,
        agencyNumber: "11910",
        agencyName: "한국토지주택공사 서울본부",
        agencyTypeCode: "07",
        buildingName: "강남 공공업무시설",
        address: "서울특별시 강남구 선릉로 121",
        district: "강남구",
        requestSizeCodes: ["30"],
        safeDiagnosisYn: "N",
        checkDiagnosisYn: "N",
    },
    {
        agencyId: 8,
        agencyNumber: "12031",
        agencyName: "정원건축사사무소",
        agencyTypeCode: "01",
        buildingName: "홍대 복합문화공간",
        address: "서울특별시 마포구 와우산로 18",
        district: "마포구",
        requestSizeCodes: ["10"],
        safeDiagnosisYn: "N",
        checkDiagnosisYn: "Y",
    },
    {
        agencyId: 9,
        agencyNumber: "12144",
        agencyName: "미래시설안전",
        agencyTypeCode: "03",
        buildingName: "왕십리 판매시설",
        address: "서울특별시 성동구 왕십리로 241",
        district: "성동구",
        requestSizeCodes: ["20"],
        safeDiagnosisYn: "Y",
        checkDiagnosisYn: "N",
    },
    {
        agencyId: 10,
        agencyNumber: "12308",
        agencyName: "새길건축사사무소",
        agencyTypeCode: "01",
        buildingName: "구로 업무시설",
        address: "서울특별시 구로구 디지털로 32",
        district: "구로구",
        requestSizeCodes: ["10", "20"],
        safeDiagnosisYn: "N",
        checkDiagnosisYn: "Y",
    },
];