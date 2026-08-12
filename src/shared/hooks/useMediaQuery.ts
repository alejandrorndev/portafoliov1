'use client'

import { useCallback, useSyncExternalStore } from 'react'

/**
 * Sigue una media query desde JavaScript.
 *
 * Usa `useSyncExternalStore`, que es la API que React ofrece para leer de una
 * fuente externa: evita el parpadeo de un `useEffect` que asigna estado tras
 * montar y deja explicito el valor que se usa en servidor.
 *
 * Ese valor de servidor es `false` a proposito. En servidor no hay forma de
 * conocer la preferencia del usuario, y el valor seguro es el que NO anima:
 * quien pidio menos movimiento no llega a ver un solo fotograma animado.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const list = window.matchMedia(query)
      list.addEventListener('change', onStoreChange)
      return () => list.removeEventListener('change', onStoreChange)
    },
    [query],
  )

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query])

  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}

/** `true` si el usuario pidio reducir el movimiento. */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}

/**
 * `true` solo con un puntero de precision — raton o trackpad.
 *
 * Es la guarda del cursor personalizado: en tactil no hay cursor que
 * reemplazar, y dibujarlo solo añade un punto persiguiendo al ultimo toque.
 */
export function usePointerFine(): boolean {
  return useMediaQuery('(pointer: fine)')
}
