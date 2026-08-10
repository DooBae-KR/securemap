export type DiagnosisYn = "Y" | "N" | "";

export type InspectionAgency = {
    agencyId: number;
    agencyNumber: string;
    agencyName: string;

    agencyTypeCode: string;
    agencyTypeName: string;

    buildingName: string;
    address: string;
    district: string;

    requestSizeCodes: string[];
    requestSizeNames: string[];

    safeDiagnosisYn: DiagnosisYn;
    checkDiagnosisYn: DiagnosisYn;
};