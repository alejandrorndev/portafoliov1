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

  // URLs cortas para compartir el CV: /cv (espanol) y /cv/en (ingles).
  // Temporales (307) y no permanentes: el destino puede cambiar y un 308
  // quedaria cacheado en los navegadores. Los redirects corren antes que el
  // proxy de idiomas, asi que /cv no termina en /es/cv.
  async redirects() {
    return [
      { source: '/cv', destination: '/cv/alejandro-restrepo-es.pdf', permanent: false },
      { source: '/cv/es', destination: '/cv/alejandro-restrepo-es.pdf', permanent: false },
      { source: '/cv/en', destination: '/cv/alejandro-restrepo-en.pdf', permanent: false },
    ]
  },

  // El CV es publico para quien tenga el enlace, pero no debe aparecer en
  // buscadores. Se usa el header y no robots.txt: un Disallow impide que el
  // crawler lea el noindex, y la URL podria indexarse igual por enlaces externos.
  async headers() {
    return [
      {
        source: '/cv/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ]
  },
}

export default withNextIntl(nextConfig)
