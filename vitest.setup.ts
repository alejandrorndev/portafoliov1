import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

afterEach(() => {
  cleanup()
})

/*
 * jsdom no implementa matchMedia, y el sitio se apoya en el para decisiones
 * reales: prefers-reduced-motion y (pointer: fine) deciden si se anima y si
 * aparece el cursor personalizado. Sin este stub, cualquier componente que los
 * consulte revienta al montar.
 *
 * Por defecto responde `false` a todo, que es el caso comun. Los tests que
 * necesiten la preferencia activa la simulan sobreescribiendo esta
 * implementacion.
 */
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

/* Tampoco existe IntersectionObserver, del que depende el scroll spy del nav
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
