import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Fix: Expose API_KEY to client code to align with Gemini API guidelines.
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  }
})
