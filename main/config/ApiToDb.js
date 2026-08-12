require('dotenv').config();
const { XMLParser } = require('fast-xml-parser');
const pool = require('./db'); // 작성해주신 db.js 풀(Pool) 모듈 불러오기

const apiKey = process.env.API_TOKEN;
const MOLIT_TOKEN = process.env.MOLIT_TOKEN;
const row = process.env.ROW || 10;
const chkInsttNm = process.env.CHK_INSTT_NM || ''; // 기본값 - 검색을 원하는 점검기관명

const bjdongCd = process.env.BJDONG_CD || ''; // 기본값 - 검색을 원하는 법정동코드
const bun = process.env.BUN || ''; // 기본값 - 검색을 원하는 번
const ji = process.env.JI || ''; // 기본값 - 검색을 원하는 지
const dongNm = process.env.DONG_NM || '한국시설안전평가원'; // 기본값 - 검색을 원하는 동명


if (!apiKey) {
    console.error('Error: .env 파일에 API_TOKEN이 설정되지 않았습니다.');
    process.exit(1);
}

//const url = `http://openapi.seoul.go.kr:8088/${apiKey}/xml/pmisInsffntDem/1/5/`;
const url2 = `http://apis.data.go.kr/1613000/MtnChkHubService/getInspectionAgency?numOfRows=${row}&pageNo=1&mgmRegSidoCd=11&chkInsttNm=${chkInsttNm}&serviceKey=${MOLIT_TOKEN}`;
const url3 = `http://apis.data.go.kr/1613000/MtnChkHubService/getMaintenanceHistory?numOfRows=${row}&pageNo=1&sigunguCd=11680&bjdongCd=${bjdongCd}&bun=${bun}&ji=${ji}&dongNm=${dongNm}&serviceKey=${MOLIT_TOKEN}`;
/*
async function fetchCallData() {
    try {
        // 1. 서울시 OpenAPI 데이터 호출 (미사용)
        const response = await fetch(url);
        console.log('PMIS Status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const xmlData = await response.text();

        // 2. XML을 JSON 객체로 변환
        const parser = new XMLParser();
        const jsonObj = parser.parse(xmlData);

        // API 응답 결과 확인
        const resultCode = jsonObj.PROJECT_LIST?.RESULT?.CODE;
        console.log('PMIS Result Code:', resultCode);
        if (resultCode !== 'INFO-000') {
            console.error('API 응답 에러:', jsonObj.PROJECT_LIST?.RESULT?.MESSAGE);
            return;
        }

        // <row> 데이터 추출 (단건/복수건 예외 처리)
        let rows = jsonObj.PROJECT_LIST.row;
        if (!rows) {
            console.log('저장할 데이터가 없습니다.');
            return;
        }
        if (!Array.isArray(rows)) {
            rows = [rows];
        }

        // 3. MySQL Pool을 이용한 데이터 INSERT
        const query = `
            INSERT INTO project_stats (seq, pjt_cd, pjt_name, entprs_name, chk_div_nm, pnt_no, pnt_num, pnt_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
            pjt_name = VALUES(pjt_name), entprs_name = VALUES(entprs_name);
        `;

        for (const item of rows) {
            await pool.execute(query, [
                item.SEQ,
                item.PJT_CD,
                item.PJT_NAME,
                item.ENTPRS_NAME,
                item.CHK_DIV_NM,
                item.PNT_NO,
                item.PNT_NUM,
                item.PNT_DATE
            ]);
        }

        console.log(`성공적으로 ${rows.length}개의 데이터가 DB에 저장되었습니다.`);

    } catch (error) {
        console.error('PMIS 데이터 처리 중 오류 발생:', error);
    }
}*/

// 유지관리 정기점검기관 조회 테이블
async function fetchCallAgency() {
    try {
        const response = await fetch(url2);
        console.log('MOLIT Status:', response.status);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const xmlData = await response.text();

        // 2. XML을 JSON 객체로 변환
        const parser = new XMLParser();
        const jsonObj = parser.parse(xmlData);

        // 3. API 응답 결과 코드 확인
        const header = jsonObj.response?.header;
        const resultCode2 = header?.resultCode;
        const resultMsg = header?.resultMsg;

        console.log('map Result Code:', resultCode2, 'Message:', resultMsg);
        // if (resultCode2 !== '0') {
        //     console.error('국토부 API 응답 에러:', resultMsg);
        //     return;
        // }

       
        let items = jsonObj.response?.body?.items?.item;
        if (!items) {
            console.log('MOLIT 저장할 데이터가 없습니다.');
            return;
        }
        if (!Array.isArray(items)) {
            items = [items];
        }
        const query = `
            INSERT INTO getInspectionAgency (
                resultCode, resultMsg, numOfRows, pageNo, totalCount, 
                sigunguCd, bjdongCd, bun, ji, 
                mgmRegSidoCd, mgmRegSido, chkInsttNm, mgmInsttNmstPk, 
                naRoadCd, naBjdongCd, naUgrndCd, naMainBun, naSubBun, 
                bldNm, operState, operStateNm, appliScaleCd, appliScaleCdNm, 
                safeDinssYn, chckDinssYn, chkInsttGbCd, regDtime, lastTrsctDtime
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
            )
            ON DUPLICATE KEY UPDATE 
                chkInsttNm = VALUES(chkInsttNm),
                operState = VALUES(operState),
                operStateNm = VALUES(operStateNm),
                lastTrsctDtime = VALUES(lastTrsctDtime);
        `;

        for (const item of items) {
            const clean = (val) => (val !== undefined && val !== null ? String(val).trim() : null);

            await pool.execute(query, [
                clean(header?.resultCode),                  // resultCode
                clean(header?.resultMsg),                   // resultMsg
                jsonObj.response?.body?.numOfRows ? Number(jsonObj.response.body.numOfRows) : null, // numOfRows
                jsonObj.response?.body?.pageNo ? Number(jsonObj.response.body.pageNo) : null,       // pageNo
                jsonObj.response?.body?.totalCount ? Number(jsonObj.response.body.totalCount) : null, // totalCount
                clean(item.sigunguCd),
                clean(item.bjdongCd),
                clean(item.bun),
                clean(item.ji),
                clean(item.mgmRegSidoCd),
                clean(item.mgmRegSido),
                clean(item.chkInsttNm),
                item.mgmInsttNmstPk ? Number(item.mgmInsttNmstPk) : null, // mgmInsttNmstPk (Primary Key)
                clean(item.naRoadCd),
                clean(item.naBjdongCd),
                clean(item.naUgrndCd),
                clean(item.naMainBun),
                clean(item.naSubBun),
                clean(item.bldNm),
                clean(item.operState),
                clean(item.operStateNm),
                clean(item.appliScaleCd),
                clean(item.appliScaleCdNm),
                clean(item.safeDinssYn),
                clean(item.chckDinssYn),
                clean(item.chkInsttGbCd),
                clean(item.regDtime),
                clean(item.lastTrsctDtime)
            ]);
        }

        console.log(`성공적으로 ${items.length}개의 데이터가 getInspectionAgency 테이블에 저장되었습니다.`);
        // 맵테이블 동기화
        // const mapQuery = `
        //     INSERT INTO MAP_INFO (
        //         chkInsttNm, naRoadCd, bjdongCd, bun, ji, bldNm, 
        //         operState, appliScaleCdNm, safeDinssYn, chckDinssYn, 
        //         chkInsttGbCd, regDtime, lat, lng
        //     )
        //     SELECT 
        //         chkInsttNm, naRoadCd, bjdongCd, bun, ji, bldNm, 
        //         operState, appliScaleCdNm, safeDinssYn, chckDinssYn, 
        //         chkInsttGbCd, regDtime, NULL AS lat, NULL AS lng 
        //     FROM getInspectionAgency;
        // `;

        // await pool.execute(mapQuery);
        // console.log('MAP_INFO 테이블로 데이터 동기화가 완료되었습니다.');

    } catch (error) {
        console.error('MOLIT 데이터 처리 중 오류 발생:', error);
    }
}

//유지관리 정기점검이력 조회테이블
/*
async function fetchCallHistory() {
    try {
        // 1. 국토교통부 OpenAPI 데이터 호출 (누락되었던 부분 추가)
        const response = await fetch(url2);
        console.log('MOLIT Status:', response.status);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const xmlData = await response.text();

        // 2. XML을 JSON 객체로 변환
        const parser = new XMLParser();
        const jsonObj = parser.parse(xmlData);

        // 3. API 응답 결과 코드 확인
        const header = jsonObj.response?.header;
        const resultCode2 = header?.resultCode;
        const resultMsg = header?.resultMsg;

        console.log('MOLIT Result Code:', resultCode2, 'Message:', resultMsg);
        // if (resultCode2 !== '0') {
        //     console.error('국토부 API 응답 에러:', resultMsg);
        //     return;
        // }

        let items = jsonObj.response?.body?.items?.item;
        
        if (!items) {
            console.log('MOLIT 저장할 데이터가 없습니다.');
            return;
        }
        
        if (!Array.isArray(items)) {
            items = [items];
        }

       // 5. MySQL Pool을 이용한 데이터 INSERT (getInspectionHistory 테이블)
       const query = `INSERT INTO getInspectionHistory (
                        resultCode, 
                        resultMsg, 
                        sigunguCd, 
                        bjdongCd,
                        bun, 
                        ji, 
                        bldNm, 
                        dongNm, 
                        chkOprtnPk, 
                        mgmBldrgstPk, 
                        chkCoNm, 
                        chkStrtDay, 
                        submitDe 
                    ) VALUES (
                        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
                    )
                    ON DUPLICATE KEY UPDATE 
                        chkOprtnPk = VALUES(chkOprtnPk),
                        submitDe = VALUES(submitDe),
                        bldNm = VALUES(bldNm);
                `;

        for (const item of items) {
            const clean = (val) => (val !== undefined && val !== null ? String(val).trim() : null);

            await pool.execute(query, [
                clean(header?.resultCode),                  
                clean(header?.resultMsg),                  
                clean(item.sigunguCd),
                clean(item.bjdongCd),
                clean(item.bun),
                clean(item.ji),
                clean(item.bldNm),
                clean(item.dongNm),
                item.chkOprtnPk ? Number(item.chkOprtnPk) : null, // mgmInsttNmstPk (Primary Key)                 
                clean(item.mgmBldrgstPk),
                clean(item.chkCoNm),
                clean(item.chkStrtDay), 
                clean(item.submitDe)
            ]);
        }
        console.log(`성공적으로 ${items.length}개의 데이터가 getInspectionHistory 테이블에 저장되었습니다.`);
      

    } catch (error) {
        console.error('getInspectionHistory 데이터 처리 중 오류 발생:', error);
    }
}
*/
// 함수 실행
async function run() {
    await fetchCallAgency();
}

run();
