import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import saveRoomPlugin from './vite-plugin-save-room.js'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    saveRoomPlugin(),
  ],
})
