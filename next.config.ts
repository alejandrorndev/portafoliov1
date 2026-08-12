import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // El build no pasa si hay errores de tipos. La opcion existe para poder
  // silenciarlos; dejarla explicita en false documenta que aqui no se silencian.
  //
  // El lint no se configura aqui: Next 16 lo saco del build. Corre como paso
  // propio en CI (`pnpm lint`) y en el hook de pre-commit.
  typescript: { ignoreBuildErrors: false },
}

export default withNextIntl(nextConfig)
