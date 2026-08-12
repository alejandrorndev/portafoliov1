import { render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { COARSE_POINTER, FINE_POINTER, matchMediaFor } from '@/test/media'
import { CustomCursor } from './CustomCursor'

/*
 * El cursor personalizado es la pieza con mas potencial de estropear el sitio
 * en dispositivos donde no tiene sentido. En el original `cursor: none` era
 * global y el cursor se dibujaba siempre, asi que en una tablet el usuario se
 * quedaba sin cursor visible y con un punto persiguiendo su ultimo toque.
 *
 * Estas guardas son la razon de ser del componente, asi que se prueban una
 * por una.
 */

afterEach(() => {
  delete document.documentElement.dataset.cursor
})

describe('CustomCursor', () => {
  it('no se monta sin puntero de precisión', () => {
    matchMediaFor(COARSE_POINTER)

    const { container } = render(<CustomCursor />)

    expect(container).toBeEmptyDOMElement()
  })

  it('no se monta si el usuario pidió menos movimiento', () => {
    // Un elemento en movimiento perpetuo es justo lo que esa preferencia pide
    // evitar, aunque haya ratón.
    matchMediaFor((query) => query.includes('pointer: fine') || query.includes('reduced-motion'))

    const { container } = render(<CustomCursor />)

    expect(container).toBeEmptyDOMElement()
  })

  it('se monta con ratón y sin preferencia de menos movimiento', () => {
    matchMediaFor(FINE_POINTER)

    const { container } = render(<CustomCursor />)

    expect(container.querySelectorAll('div[class*="fixed"]')).toHaveLength(2)
  })

  it('oculta el cursor nativo solo mientras está montado', () => {
    matchMediaFor(FINE_POINTER)

    const { unmount } = render(<CustomCursor />)
    expect(document.documentElement.dataset.cursor).toBe('custom')

    unmount()
    expect(document.documentElement.dataset.cursor).toBeUndefined()
  })

  it('nunca toca el cursor nativo si no se monta', () => {
    matchMediaFor(COARSE_POINTER)

    render(<CustomCursor />)

    expect(document.documentElement.dataset.cursor).toBeUndefined()
  })

  it('queda oculto a la tecnología asistiva', () => {
    matchMediaFor(FINE_POINTER)

    const { container } = render(<CustomCursor />)

    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true')
  })
})
