import createMiddleware from 'next-intl/middleware'
import { routing } from '@/i18n/routing'

export default createMiddleware(routing)

export const config = {
  /*
   * Se excluyen del middleware:
   *   api        rutas de API (el formulario de la Fase 6)
   *   _next      artefactos del build
   *   _vercel    herramientas de la plataforma
   *   *.*        cualquier archivo con extension (favicon.ico, cv.pdf, og.png)
   *
   * Sin la ultima exclusion, una peticion a /cv/alejandro.pdf terminaria
   * redirigida a /es/cv/alejandro.pdf y el archivo dejaria de servirse.
   */
  matcher: '/((?!api|_next|_vercel|.*\\..*).*)',
}
