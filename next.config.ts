import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // El build no pasa si hay errores de tipos. La opcion existe para poder
  // silenciarlos; dejarla explicita en false documenta que aqui no se silencian.
  //
  // El lint no se configura aqui: Next 16 lo saco del build. Corre como paso
  // propio en CI (`pnpm lint`) y en el hook de pre-commit.
  typescript: { ignoreBuildErrors: false },

  // El plugin de next-intl se monta en la Fase 1, cuando entre el routing por
  // locale.
}

export default nextConfig
