import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { findA11yViolations, renderWithIntl } from '@/test/intl'
import { LocaleSwitcher } from './LocaleSwitcher'
import { MobileMenu } from './MobileMenu'

// next-intl navigation depende del router de Next, que no existe en jsdom.
vi.mock('@/i18n/navigation', () => ({
  usePathname: () => '/',
  Link: ({
    children,
    locale,
    ...props
  }: React.ComponentProps<'a'> & { locale?: string; href: string }) => (
    <a data-locale={locale} {...props}>
      {children}
    </a>
  ),
}))

describe('MobileMenu', () => {
  beforeEach(() => {
    // jsdom no implementa el modo modal de <dialog>.
    HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
      this.open = true
    })
    HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
      this.open = false
      this.dispatchEvent(new Event('close'))
    })
  })

  it('arranca cerrado y anuncia su estado', () => {
    renderWithIntl(<MobileMenu />)

    expect(screen.getByRole('button', { name: /abrir menú/i })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })

  it('abre el menú al pulsar el botón', async () => {
    const user = userEvent.setup()
    renderWithIntl(<MobileMenu />)

    await user.click(screen.getByRole('button', { name: /abrir menú/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /abrir menú/i })).toHaveAttribute(
        'aria-expanded',
        'true',
      )
    })
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled()
  })

  it('ofrece un enlace por cada sección', async () => {
    const user = userEvent.setup()
    renderWithIntl(<MobileMenu />)
    await user.click(screen.getByRole('button', { name: /abrir menú/i }))

    for (const section of ['#about', '#skills', '#projects', '#experience', '#contact']) {
      expect(
        screen.getByRole('link', {
          name: (_, element) => element.getAttribute('href') === section,
        }),
      ).toBeInTheDocument()
    }
  })

  it('se cierra al elegir una sección', async () => {
    const user = userEvent.setup()
    renderWithIntl(<MobileMenu />)
    await user.click(screen.getByRole('button', { name: /abrir menú/i }))

    await user.click(screen.getAllByRole('link')[0]!)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /abrir menú/i })).toHaveAttribute(
        'aria-expanded',
        'false',
      )
    })
  })

  it('vuelve a abrirse tras cerrarse con Escape', async () => {
    // Escape dispara 'close' sin pasar por ningun onClick. Si el estado de
    // React no escuchara ese evento, quedaria en "abierto" y el boton dejaria
    // de funcionar para siempre.
    const user = userEvent.setup()
    const { container } = renderWithIntl(<MobileMenu />)
    const trigger = screen.getByRole('button', { name: /abrir menú/i })

    await user.click(trigger)
    container.querySelector('dialog')!.close()

    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'))

    await user.click(trigger)
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'))
  })

  it('no tiene violaciones de accesibilidad', async () => {
    const user = userEvent.setup()
    const { container } = renderWithIntl(<MobileMenu />)
    await user.click(screen.getByRole('button', { name: /abrir menú/i }))

    expect(await findA11yViolations(container)).toEqual([])
  })
})

describe('LocaleSwitcher', () => {
  it('ofrece todos los idiomas y marca el activo', () => {
    renderWithIntl(<LocaleSwitcher current="es" />)

    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(2)

    const current = links.find((link) => link.getAttribute('aria-current') === 'true')
    expect(current).toHaveAttribute('data-locale', 'es')
  })

  it('da a cada enlace un nombre accesible legible', () => {
    // El texto visible es "ES" / "EN". Sin el nombre completo, un lector de
    // pantalla anuncia dos enlaces de dos letras sin contexto.
    renderWithIntl(<LocaleSwitcher current="es" />)

    expect(screen.getByRole('link', { name: 'Español' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'English' })).toBeInTheDocument()
  })

  it('declara hreflang en cada enlace', () => {
    renderWithIntl(<LocaleSwitcher current="es" />)

    expect(screen.getByRole('link', { name: 'English' })).toHaveAttribute('hrefLang', 'en')
  })

  it('no tiene violaciones de accesibilidad', async () => {
    const { container } = renderWithIntl(<LocaleSwitcher current="es" />)

    expect(await findA11yViolations(container)).toEqual([])
  })
})
