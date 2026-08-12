'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/shared/lib/cn'

/**
 * Cabecera que se compacta al desplazarse.
 *
 * Es lo unico de la cabecera que necesita JavaScript, asi que se aisla aqui y
 * el resto —marca, enlaces, selector de idioma— sigue renderizandose en
 * servidor.
 *
 * El listener es pasivo y solo compara un booleano contra el estado anterior,
 * de modo que React no re-renderiza en cada pixel de scroll.
 */
export function HeaderShell({ children }: { children: React.ReactNode }) {
  const [stuck, setStuck] = useState(false)

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 60)

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'ease-brand sticky top-0 z-50 backdrop-blur-2xl transition-all duration-300',
        stuck ? 'bg-bg/85 border-hairline border-b' : 'border-b border-transparent bg-transparent',
      )}
    >
      {children}
    </header>
  )
}
