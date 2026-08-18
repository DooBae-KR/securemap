import {
    defineConfig
} from "vite";

import react from "@vitejs/plugin-react";

const BACKEND_SERVER_URL = "http://127.0.0.1:3001";

const MOCK_SERVER_URL = "http://127.0.0.1:3002";

export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
        strictPort: true,

        proxy: {
            /**
             * 실제 백엔드의 일반 API
             *
             * 예:
             * /api/common-code
             * /api/statistics/agency-types
             * /api/statistics/inspection-agencies
             */
            "/api": {target: BACKEND_SERVER_URL, changeOrigin: true},

            /**
             * 실제 백엔드의 좌·우 도넛차트 API
             *
             * /statis/left
             * /statis/right
             */
            "/statis": {target: BACKEND_SERVER_URL, changeOrigin: true},

            /**
             * json-server Mock API
             *
             * /mock-api/MOLIT_MAP_INFO
             * → http://127.0.0.1:3002/MOLIT_MAP_INFO
             *
             * /mock-api/COM_CD_TB
             * → http://127.0.0.1:3002/COM_CD_TB
             */
            "/mock-api": {
                target: MOCK_SERVER_URL,
                changeOrigin: true,

                rewrite: (path) =>
                    path.replace(
                        /^\/mock-api/,
                        "",
                    ),
            },
        },
    },
});