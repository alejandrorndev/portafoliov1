import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Reveal } from './Reveal'

/**
 * Deja controlar cuando "entra en viewport" el elemento observado.
 * El stub por defecto de vitest.setup.ts nunca dispara.
 */
function mockIntersection(intersecting: boolean) {
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(private callback: IntersectionObserverCallback) {}
      observe(target: Element) {
        this.callback(
          [{ isIntersecting: intersecting, target } as IntersectionObserverEntry],
          this as unknown as IntersectionObserver,
        )
      }
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return []
      }
      root = null
      rootMargin = ''
      thresholds = []
    },
  )
}

describe('Reveal', () => {
  it('renderiza el contenido aunque nunca entre en viewport', () => {
    // Lo esencial: el contenido siempre esta en el DOM. La animacion es
    // decorativa; si fallara, el portafolio no puede quedarse en blanco.
    mockIntersection(false)

    render(<Reveal>contenido</Reveal>)

    expect(screen.getByText('contenido')).toBeInTheDocument()
  })

  it('marca data-visible al entrar en viewport', () => {
    mockIntersection(true)

    const { container } = render(<Reveal>contenido</Reveal>)

    expect(container.firstElementChild).toHaveAttribute('data-visible', 'true')
  })

  it('no marca data-visible mientras está fuera de viewport', () => {
    mockIntersection(false)

    const { container } = render(<Reveal>contenido</Reveal>)

    expect(container.firstElementChild).not.toHaveAttribute('data-visible')
  })

  it('expone la dirección para que la resuelva el CSS', () => {
    mockIntersection(false)

    const { container } = render(<Reveal direction="left">contenido</Reveal>)

    expect(container.firstElementChild).toHaveAttribute('data-reveal', 'left')
  })

  it('renderiza la etiqueta pedida, para no romper el marcado de listas', () => {
    mockIntersection(false)

    const { container } = render(
      <ul>
        <Reveal as="li">item</Reveal>
      </ul>,
    )

    expect(container.querySelector('li')).toBeInTheDocument()
  })

  it('aplica el retardo como transition-delay', () => {
    mockIntersection(false)

    const { container } = render(<Reveal delay={180}>contenido</Reveal>)

    expect(container.firstElementChild).toHaveStyle({ transitionDelay: '180ms' })
  })
})
