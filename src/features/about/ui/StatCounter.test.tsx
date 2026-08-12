import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { matchMediaFor, REDUCED_MOTION } from '@/test/media'
import { StatCounter } from './StatCounter'

describe('StatCounter', () => {
  it('renderiza el valor final, no un cero', () => {
    // El HTML del original decia "0+" y solo GSAP lo convertia en el valor
    // real: un rastreador, un lector de pantalla o un navegador con el JS
    // caido veian ceros.
    const { container } = render(<StatCounter value={4} suffix="+" />)

    expect(container.textContent).toBe('4+')
  })

  it('con menos movimiento se queda en el valor final', () => {
    matchMediaFor(REDUCED_MOTION)

    const { container } = render(<StatCounter value={15} suffix="+" />)

    expect(container.textContent).toBe('15+')
  })

  it('funciona sin sufijo', () => {
    const { container } = render(<StatCounter value={4} suffix="" />)

    expect(container.textContent).toBe('4')
  })
})
