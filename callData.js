
require('dotenv').config();

// 2. 환경 변수에서 토큰 가져오기
const apiKey = process.env.API_TOKEN;

if (!apiKey) {
    console.error('Error: .env 파일에 API_TOKEN이 설정되지 않았습니다.');
    process.exit(1);
}


// 요청할 서울시 OpenAPI 주소 (pmisInsffntDem 데이터)
const url = `http://openapi.seoul.go.kr:8088/${apiKey}/xml/pmisInsffntDem/1/5/`;

async function getPmisData() {
    try {
        const response = await fetch(url);
        
        // 상태 코드 확인
        console.log('Status:', response.status);
        console.log('url :', );
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // 응답받은 XML 데이터를 텍스트로 변환하여 출력
        const body = await response.text();
        console.log('Response received:\n', body);

    } catch (error) {
        console.error('Error occurred:', error);
    }
}

getPmisData();