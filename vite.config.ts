import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: process.env.VITE_LUMRA_API_BASE || 'https://api.eluralearning.com',
                changeOrigin: true,
                secure: true,
                rewrite: (path) => path, // Keep /api in the path
            }
        }
    },
    build: {
        target: "ES2022",
    },
})
