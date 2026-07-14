import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Sem sourcemap, um erro em producao aparece como "l is not a function":
    // impossivel saber qual funcao falhou. Com ele, o stack aponta o arquivo
    // e a linha originais.
    sourcemap: true,
  },
  server: {
    port: 5173,
    host: true,
  },
})
