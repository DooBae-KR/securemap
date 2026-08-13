# ---------------------------------------------
# 백엔드 (Express + mysql2) 이미지
# 빌드 컨텍스트: 프로젝트 최상위 폴더
# ---------------------------------------------
FROM node:22-alpine

# 컨테이너 안 작업 폴더
WORKDIR /app

# 운영용이므로 devDependencies(concurrently, json-server)는 설치하지 않음
ENV NODE_ENV=production

# 1) 의존성 먼저 복사 -> 소스만 바뀌면 이 레이어는 캐시 재사용됨
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# 2) 실제 서버 소스 복사
COPY main ./main

# server.js 가 listen(3001) 로 고정되어 있음
EXPOSE 3001

# root 대신 일반 유저로 실행 (보안)
USER node

CMD ["node", "main/config/server.js"]
