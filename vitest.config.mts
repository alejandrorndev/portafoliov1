import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

/*
 * Extension .mts a proposito: el archivo usa sintaxis ESM y Vite va a cargar
 * las configuraciones de forma nativa en una version mayor futura. Con .ts lo
 * trataria como CommonJS y avisa de la ruptura; .mts lo deja resuelto de
 * antemano.
 *
 * Los alias de tsconfig ("@/*") se resuelven con `resolve.tsconfigPaths`, que
 * Vite ya trae de fabrica. No hace falta el plugin vite-tsconfig-paths.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.{test,spec}.{ts,tsx}', 'src/**/index.ts', 'src/app/**'],
    },
  },
})
