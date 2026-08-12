import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

/*
 * jsdom no implementa matchMedia, y el sitio se apoya en el para decisiones
 * reales: prefers-reduced-motion y (pointer: fine) deciden si se anima y si
 * aparece el cursor personalizado. Sin este stub, cualquier componente que los
 * consulte revienta al montar.
 *
 * Por defecto responde `false` a todo, que es el caso comun. Los tests que
 * necesiten otra cosa usan matchMediaFor() de src/test/media.ts.
 */
const defaultMatchMedia = (query: string) =>
  ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }) as unknown as MediaQueryList

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(defaultMatchMedia),
})

/* Tampoco existe IntersectionObserver, del que dependen el scroll spy del nav
   y los reveals al entrar en viewport. */
class IntersectionObserverStub implements IntersectionObserver {
  readonly root = null
  readonly rootMargin = ''
  readonly thresholds: ReadonlyArray<number> = []
  disconnect() {}
  observe() {}
  unobserve() {}
  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
}

vi.stubGlobal('IntersectionObserver', IntersectionObserverStub)

afterEach(() => {
  cleanup()

  /*
   * matchMedia se define una sola vez, asi que un mockImplementation puesto
   * por un test sobrevive a los siguientes del mismo archivo. Un test que
   * simule prefers-reduced-motion dejaria a todos los posteriores creyendo lo
   * mismo, y fallarian por un motivo que no tiene nada que ver con lo que
   * prueban. Restaurar aqui corta esa fuga.
   */
  vi.mocked(window.matchMedia).mockImplementation(defaultMatchMedia)

  vi.stubGlobal('IntersectionObserver', IntersectionObserverStub)
})
