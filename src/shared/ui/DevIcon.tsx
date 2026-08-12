import { cn } from '@/shared/lib/cn'
import { ICONS, type IconName } from './icons.generated'

/**
 * Icono de tecnologia, en SVG inline.
 *
 * El original cargaba la fuente de iconos de devicon desde un CDN. Traerla al
 * repo resolvia la dependencia externa pero no el peso: son 1.46 MB en woff
 * (devicon no publica woff2) para mostrar 28 iconos. Aqui van solo los SVG que
 * el contenido usa —unos 53 KB en total—, incrustados en el HTML: sin peticion
 * extra y sin el parpadeo de esperar a que llegue una fuente.
 *
 * `dangerouslySetInnerHTML` es seguro en este caso concreto: el contenido lo
 * genera scripts/generate-icons.mjs a partir de un paquete npm con version
 * fijada, y queda commiteado en el repo. No es texto de usuario ni de un CMS,
 * a diferencia de lo que maneja RichText.
 *
 * Decorativo por defecto: junto a cada icono se escribe el nombre de la
 * tecnologia, asi que anunciarlo solo repetiria. Si alguna vez aparece sin
 * texto al lado, hay que pasarle `title`.
 */
export function DevIcon({
  name,
  className,
  title,
}: {
  name: IconName
  className?: string
  /** Nombre accesible. Solo cuando el icono va sin texto que lo acompañe. */
  title?: string
}) {
  const icon = ICONS[name]

  return (
    <svg
      viewBox={icon.viewBox}
      className={cn('h-[1.15em] w-[1.15em] shrink-0', className)}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : 'true'}
      focusable="false"
      dangerouslySetInnerHTML={{ __html: icon.body }}
    />
  )
}
