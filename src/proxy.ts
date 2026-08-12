import createMiddleware from 'next-intl/middleware'
import { routing } from '@/i18n/routing'

/*
 * Deteccion y redireccion de idioma.
 *
 * El archivo se llama proxy.ts y no middleware.ts: Next 16 deprecó ese nombre.
 * La funcion que exporta next-intl sigue llamandose createMiddleware, que es
 * su API; solo cambia la convencion de nombre del archivo en Next.
 */
export default createMiddleware(routing)

export const config = {
  /*
   * Se excluyen del proxy:
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
