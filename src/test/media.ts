import { vi } from 'vitest'

/**
 * Controla que media queries dan positivo durante un test.
 *
 * vitest.setup.ts deja `matchMedia` respondiendo `false` a todo, que es el
 * caso comun. Esto permite simular el resto: un usuario con
 * `prefers-reduced-motion`, o un dispositivo tactil sin puntero de precision.
 *
 * @example
 *   matchMediaFor((query) => query.includes('reduced-motion'))
 */
export function matchMediaFor(predicate: (query: string) => boolean) {
  vi.mocked(window.matchMedia).mockImplementation(
    (query: string) =>
      ({
        matches: predicate(query),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }) as unknown as MediaQueryList,
  )
}

export const REDUCED_MOTION = (query: string) => query.includes('prefers-reduced-motion')
export const COARSE_POINTER = () => false
export const FINE_POINTER = (query: string) => query.includes('pointer: fine')
