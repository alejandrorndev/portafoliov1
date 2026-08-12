/**
 * URL base del sitio.
 *
 * La necesitan `canonical`, `hreflang`, Open Graph, el sitemap y el JSON-LD.
 * Un buscador no puede resolver `<link rel="canonical" href="/es">` sin ella:
 * necesita la direccion completa.
 *
 * Se resuelve en cascada para que cada entorno funcione sin configurar nada:
 *
 *   1. NEXT_PUBLIC_SITE_URL — el dominio propio, cuando exista.
 *   2. VERCEL_PROJECT_PRODUCTION_URL — el dominio estable del proyecto en
 *      Vercel. Se usa a proposito en lugar de VERCEL_URL, que cambia en cada
 *      despliegue: un canonical apuntando a una URL de preview le diria a
 *      Google que la version buena es un despliegue que morira en dias.
 *   3. localhost, para desarrollo.
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL
  if (explicit) return explicit.replace(/\/$/, '')

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL
  if (vercel) return `https://${vercel}`

  return 'http://localhost:3000'
}

export const SITE_URL = resolveSiteUrl()

/** URL absoluta a partir de una ruta que empieza por "/". */
export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString()
}
