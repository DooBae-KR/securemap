import type {
    CommonCodeTableRow,
} from "../types/commonCode";

import type {
    MolitMapInfoRow,
} from "../types/statistics";

import {
    fetchJson,
} from "./apiClient";

let molitRowsPromise:
    Promise<MolitMapInfoRow[]> | null = null;

let commonCodeRowsPromise:
    Promise<CommonCodeTableRow[]> | null = null;

/**
 * db.json의 MOLIT_MAP_INFO 조회
 */
export function fetchMockMolitRows():
    Promise<MolitMapInfoRow[]> {

    molitRowsPromise ??=
        fetchJson<MolitMapInfoRow[]>(
            "/mock-api/MOLIT_MAP_INFO",
        ).catch((error) => {
            molitRowsPromise = null;
            throw error;
        });

    return molitRowsPromise;
}

/**
 * db.json의 COM_CD_TB 조회
 */
export function fetchMockCommonCodeRows():
    Promise<CommonCodeTableRow[]> {

    commonCodeRowsPromise ??=
        fetchJson<CommonCodeTableRow[]>(
            "/mock-api/COM_CD_TB",
        ).catch((error) => {
            commonCodeRowsPromise = null;
            throw error;
        });

    return commonCodeRowsPromise;
}