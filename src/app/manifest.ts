import type { MetadataRoute } from 'next'
import { getProfile } from '@/content'
import { DEFAULT_LOCALE } from '@/i18n/config'

/**
 * Manifiesto de aplicacion web.
 *
 * No convierte el sitio en una app instalable de verdad —no hay service
 * worker ni intencion de tenerlo— pero sí controla como se ve si alguien lo
 * añade a la pantalla de inicio, y le da al navegador el color de tema para
 * pintar la barra superior en movil en lugar del blanco por defecto.
 */
export default function manifest(): MetadataRoute.Manifest {
  const profile = getProfile(DEFAULT_LOCALE)

  return {
    name: `${profile.fullName} — ${profile.role}`,
    short_name: profile.brand,
    description: profile.summary.replaceAll('**', ''),
    start_url: `/${DEFAULT_LOCALE}`,
    display: 'standalone',
    background_color: '#00000d',
    theme_color: '#00000d',
    icons: [{ src: '/favicon.ico', sizes: 'any', type: 'image/x-icon' }],
  }
}
