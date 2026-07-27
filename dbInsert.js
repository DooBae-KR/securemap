require('dotenv').config();
const { XMLParser } = require('fast-xml-parser');
const pool = require('./db'); // 작성해주신 db.js 풀(Pool) 모듈 불러오기

const apiKey = process.env.API_TOKEN;
const url = `http://openapi.seoul.go.kr:8088/${apiKey}/xml/pmisInsffntDem/1/5/`;

async function fetchAndSavePmisData() {
    try {
        // 1. 서울시 OpenAPI 데이터 호출
        const response = await fetch(url);
        console.log('Status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const xmlData = await response.text();

        // 2. XML을 JSON 객체로 변환
        const parser = new XMLParser();
        const jsonObj = parser.parse(xmlData);

        // API 응답 결과 확인
        const resultCode = jsonObj.PROJECT_LIST?.RESULT?.CODE;
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
        console.error('데이터 처리 중 오류 발생:', error);
    }
}

fetchAndSavePmisData();