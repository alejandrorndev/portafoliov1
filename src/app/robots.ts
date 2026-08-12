import type { MetadataRoute } from 'next'
import { absoluteUrl } from '@/shared/lib/site-url'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // El aviso de privacidad no aporta nada en resultados de busqueda y
      // compite con la portada por la atencion del rastreador.
      disallow: ['/es/privacidad', '/en/privacy'],
    },
    sitemap: absoluteUrl('/sitemap.xml'),
  }
}
