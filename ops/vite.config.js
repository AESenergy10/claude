import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base so the built app also works when hosted from a subfolder
// (e.g. GitHub Pages /ops/) without a rewrite.
export default defineConfig({
  base: './',
  plugins: [react()],
})
