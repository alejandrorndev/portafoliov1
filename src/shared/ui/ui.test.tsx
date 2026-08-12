import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Button } from './Button'
import { Card } from './Card'
import { Chip } from './Chip'
import { DevIcon } from './DevIcon'
import { RichText } from './RichText'
import { SectionHeading } from './SectionHeading'

describe('RichText', () => {
  it('convierte **texto** en <strong>', () => {
    render(<RichText>{'sistemas que **escalan**'}</RichText>)

    const emphasis = screen.getByText('escalan')
    expect(emphasis.tagName).toBe('STRONG')
  })

  it('no interpreta HTML del contenido', () => {
    // El contenido es texto plano. Si alguna vez llegara de un CMS, esto es lo
    // que impide que un <script> se ejecute.
    const { container } = render(<RichText>{'<script>alert(1)</script>'}</RichText>)

    expect(container.querySelector('script')).toBeNull()
    expect(container.textContent).toBe('<script>alert(1)</script>')
  })

  it('deja intacto el texto sin marcas', () => {
    const { container } = render(<RichText>{'texto plano'}</RichText>)

    expect(container.textContent).toBe('texto plano')
    expect(container.querySelector('strong')).toBeNull()
  })

  it('no trata como enfasis un par de asteriscos vacio', () => {
    const { container } = render(<RichText>{'a ** b'}</RichText>)

    expect(container.querySelector('strong')).toBeNull()
  })
})

describe('Button', () => {
  it('renderiza un <button> cuando no hay href', () => {
    render(<Button>Enviar</Button>)

    expect(screen.getByRole('button', { name: 'Enviar' })).toBeInTheDocument()
  })

  it('renderiza un <a> cuando hay href', () => {
    render(<Button href="#projects">Ver</Button>)

    expect(screen.getByRole('link', { name: 'Ver' })).toHaveAttribute('href', '#projects')
  })

  it('protege los enlaces externos con rel="noopener noreferrer"', () => {
    // Sin esto, la pagina destino recibe acceso a window.opener y puede
    // redirigir la pestaña de origen.
    render(<Button href="https://github.com/alejandrorndev">GitHub</Button>)

    const link = screen.getByRole('link', { name: 'GitHub' })
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('no abre en otra pestaña los enlaces internos', () => {
    render(<Button href="#contact">Contacto</Button>)

    const link = screen.getByRole('link', { name: 'Contacto' })
    expect(link).not.toHaveAttribute('target')
    expect(link).not.toHaveAttribute('rel')
  })

  it('trata mailto y tel como externos', () => {
    render(<Button href="mailto:hola@ejemplo.com">Email</Button>)

    expect(screen.getByRole('link', { name: 'Email' })).toHaveAttribute(
      'rel',
      'noopener noreferrer',
    )
  })
})

describe('SectionHeading', () => {
  it('expone un h2 con el id para aria-labelledby', () => {
    render(
      <SectionHeading id="projects-heading" tag="03 / Proyectos" title="Mi" accent="Trabajo" />,
    )

    const heading = screen.getByRole('heading', { level: 2 })
    expect(heading).toHaveAttribute('id', 'projects-heading')
    expect(heading).toHaveTextContent('Mi Trabajo')
  })
})

describe('Chip', () => {
  it('oculta el icono a los lectores de pantalla', () => {
    // El nombre de la tecnologia ya esta escrito al lado: anunciar el icono
    // solo repetiria.
    const { container } = render(<Chip icon="nodejs-plain">Node.js</Chip>)

    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByText('Node.js')).toBeInTheDocument()
  })

  it('funciona sin icono', () => {
    const { container } = render(<Chip>Sin icono</Chip>)

    expect(screen.getByText('Sin icono')).toBeInTheDocument()
    expect(container.querySelector('svg')).toBeNull()
  })
})

describe('DevIcon', () => {
  it('incrusta el SVG en lugar de pedir una fuente', () => {
    const { container } = render(<DevIcon name="nodejs-plain" />)

    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('viewBox')
    expect(svg?.innerHTML.length).toBeGreaterThan(0)
  })

  it('es decorativo por defecto', () => {
    const { container } = render(<DevIcon name="docker-plain" />)

    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('aria-hidden', 'true')
    expect(svg).not.toHaveAttribute('role')
  })

  it('se vuelve anunciable cuando recibe title', () => {
    // Para cuando el icono va solo, sin texto al lado que lo explique.
    render(<DevIcon name="github-original" title="GitHub" />)

    expect(screen.getByRole('img', { name: 'GitHub' })).toBeInTheDocument()
  })
})

describe('Card', () => {
  it('aplica el acento recibido y no el de su posicion', () => {
    // En el original el color salia de :nth-child(), asi que reordenar las
    // tarjetas cambiaba sus colores.
    const { container } = render(
      <>
        <Card accent="gold">primera</Card>
        <Card accent="cyan">segunda</Card>
      </>,
    )

    const [first, second] = container.querySelectorAll('div')
    expect(first?.className).toContain('gold')
    expect(second?.className).toContain('cyan')
  })

  it('omite los estilos de interaccion cuando interactive es false', () => {
    const { container } = render(
      <Card interactive={false}>
        <span>quieta</span>
      </Card>,
    )

    expect(container.firstElementChild?.className).not.toContain('hover:-translate-y')
  })
})
