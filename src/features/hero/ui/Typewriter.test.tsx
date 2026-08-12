import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { matchMediaFor, REDUCED_MOTION } from '@/test/media'
import { Typewriter } from './Typewriter'

const ROLES = ['Backend Developer', 'API Architect']

afterEach(() => {
  vi.useRealTimers()
})

describe('Typewriter', () => {
  it('con menos movimiento muestra el primer rol fijo', () => {
    matchMediaFor(REDUCED_MOTION)

    const { container } = render(<Typewriter roles={ROLES} />)

    expect(container.textContent).toBe('Backend Developer')
    // Ni cursor parpadeante ni texto que se reescribe solo.
    expect(container.querySelector('.animate-caret')).toBeNull()
  })

  it('anuncia el rol completo aunque en pantalla se escriba letra a letra', () => {
    // Un lector de pantalla que siguiera el cambio caracter a caracter leeria
    // un galimatias continuo mientras el usuario intenta usar la pagina.
    render(<Typewriter roles={ROLES} />)

    expect(screen.getByText('Backend Developer')).toHaveClass('sr-only')
  })

  it('oculta a la tecnología asistiva el texto que se escribe', () => {
    const { container } = render(<Typewriter roles={ROLES} />)

    const animated = container.querySelector('[aria-hidden="true"]')
    expect(animated).not.toBeNull()
    expect(animated?.querySelector('.animate-caret')).not.toBeNull()
  })

  it('escribe progresivamente', () => {
    vi.useFakeTimers()
    const { container } = render(<Typewriter roles={ROLES} />)

    const visible = () => container.querySelector('[aria-hidden="true"]')?.textContent ?? ''
    expect(visible()).toBe('')

    act(() => {
      vi.advanceTimersByTime(70 * 7)
    })

    expect('Backend Developer'.startsWith(visible())).toBe(true)
    expect(visible().length).toBeGreaterThan(0)
  })

  it('no se cae con una lista vacía', () => {
    const { container } = render(<Typewriter roles={[]} />)

    expect(container).toBeInTheDocument()
  })
})
