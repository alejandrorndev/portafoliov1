import { describe, expect, it } from 'vitest'
import { cn } from './cn'

describe('cn', () => {
  it('une varias clases', () => {
    expect(cn('flex', 'items-center')).toBe('flex items-center')
  })

  it('descarta valores falsy', () => {
    expect(cn('flex', false, undefined, null, 'gap-2')).toBe('flex gap-2')
  })

  it('acepta objetos condicionales', () => {
    expect(cn('base', { active: true, hidden: false })).toBe('base active')
  })

  it('resuelve conflictos de Tailwind quedandose con el ultimo', () => {
    expect(cn('p-4', 'p-8')).toBe('p-8')
    expect(cn('text-slate-500', 'text-cyan-400')).toBe('text-cyan-400')
  })

  it('permite que una prop className sobreescriba el valor por defecto', () => {
    const defaults = 'rounded-md px-4 py-2'
    expect(cn(defaults, 'px-8')).toBe('rounded-md py-2 px-8')
  })
})
