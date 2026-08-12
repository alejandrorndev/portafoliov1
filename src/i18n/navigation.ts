import { createNavigation } from 'next-intl/navigation'
import { routing } from './routing'

/**
 * Envoltorios de navegacion conscientes del idioma.
 *
 * Usar estos en vez de los de `next/link` y `next/navigation`: mantienen el
 * prefijo de idioma solos. Con el Link nativo, `<Link href="/">` desde /en
 * manda al usuario al espanol sin avisar.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing)
