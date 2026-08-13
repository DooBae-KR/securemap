# ---------------------------------------------
# 프론트엔드 (Vite + React) 이미지 — 멀티스테이지 빌드
#  1단계: node 로 정적 파일(dist) 생성
#  2단계: nginx 로 dist 를 서빙 + API 프록시
# 빌드 컨텍스트: ./front
# ---------------------------------------------

# ---------- 1단계: 빌드 ----------
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite 는 빌드 "시점"에 VITE_ 변수를 코드에 박아 넣는다.
# 그래서 런타임 환경변수가 아니라 build arg 로 받아야 한다.
ARG VITE_NAVER_MAP_CLIENT_ID
ENV VITE_NAVER_MAP_CLIENT_ID=${VITE_NAVER_MAP_CLIENT_ID}

RUN npm run build

# ---------- 2단계: 서빙 ----------
FROM nginx:1.27-alpine

# vite.config.ts 의 proxy 설정을 대체하는 nginx 설정
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
