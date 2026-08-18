# securemap
안전지도 프로젝트

# 전체 디렉토리 구조

```text
securemap/
├── front/                      # React + TypeScript 프론트엔드
│   ├── src/                    # 프론트엔드 소스 코드
│   ├── .env                    # Vite 프론트엔드 환경변수
│   ├── Dockerfile              # 프론트엔드 Docker 이미지 빌드 설정
│   ├── index.html              # Vite가 사용하는 HTML 진입 파일
│   ├── package.json            # 프론트엔드 실행 스크립트와 의존성
│   ├── package-lock.json       # 프론트엔드 의존성 버전 잠금
│   ├── tsconfig.json           # TypeScript 공통 설정
│   ├── tsconfig.app.json       # 브라우저 애플리케이션 TypeScript 설정
│   ├── tsconfig.node.json      # Vite 설정 파일용 TypeScript 설정
│   └── vite.config.ts          # Vite 개발 서버, 포트, 프록시 설정
│
├── main/                       # Express 백엔드
│   ├── config/                 # 환경변수 폴더
│   ├── controllers/            # 라우트 핸들러 (비즈니스 로직)
│   ├── models/                 # 데이터 모델 정의 (쿼리문)
│   ├── routes/                 # API URL과 Controller를 연결하는 라우트 정의
│   └── services/               # 데이터 처리 흐름을 담당하는 서비스 계층
│
├── .env                        # 백엔드 실행에 필요한 환경변수
├── .gitignore                  # Git 추적 제외 대상
├── db.json                     # json-server에서 사용하는 Mock 데이터
├── Dockerfile                  # 프로젝트 Docker 이미지 빌드 설정
├── Dockerfile.mock             # Mock 서버 Docker 이미지 빌드 설정
├── package.json                # 백엔드, 프론트, Mock 서버 실행 스크립트와 의존성
├── package-lock.json           # 루트 프로젝트 의존성 버전 잠금
└── README.md                   # 프로젝트 안내 문서
```

## 프론트엔드 구조

```text
front/src/
├── api/                        # API 호출
├── components/                 # 여러 화면에서 사용되는 공통 React 컴포넌트
│   └── layout/
├── constants/                  # 고정값 데이터 정리 (검색 초기값, 페이지 크기, 차트 색상)
├── pages/                      # 화면 단위 React 컴포넌트와 css
│   ├── map/                    # 지도 페이지
│   └── statistics/             # 통계 페이지
│       ├── components/         # 통계 페이지 구성하는 하위 UI 컴포넌트
│       ├── hooks/              # 상태, API 호출, 이벤트를 관리하는 hook
│       └── utils/              # 순수 함수 모음
├── types/                      # 화면 데이터 구조를 나타내는 타입 설정
├── App.tsx                     # 최상위 React 컴포넌트. URL 해시에 따라 페이지 전환
├── index.css                   # 애플리케이션 전체에 적용하는 전역 CSS
├── main.tsx                    # HTML의 #root 에 React 애플리케이션을 연결하는 실행 진입점
├── naver-maps.d.ts             # 네이버 지도 JavaScript SDK 객체를 TypeScript가 인식하도록 선언
└── vite-env.d.ts               # Vite가 제공하는 import.meta.env 등의 타입 선언을 연결
```

## 요청 처리 흐름

### 프론트엔드

```text
main.tsx
→ App.tsx
→ pages
→ hooks
→ api
→ Express API 또는 json-server Mock API
→ React state
→ 화면 컴포넌트 렌더링
```

### 백엔드

```text
클라이언트 요청
→ routes
→ controllers
→ services
→ models
→ MySQL
→ models
→ services
→ controllers
→ JSON 응답
```
