import { render, type RenderResult } from '@testing-library/react'
import axe from 'axe-core'
import { NextIntlClientProvider } from 'next-intl'
import messages from '@/i18n/messages/es.json'

/**
 * Renderiza con el contexto de traducciones ya montado.
 *
 * Se usan los mensajes reales y no un objeto de prueba: asi un test falla si
 * alguien renombra una clave, en vez de pasar contra un doble que nadie
 * actualizo.
 */
export function renderWithIntl(ui: React.ReactElement): RenderResult {
  return render(
    <NextIntlClientProvider locale="es" messages={messages}>
      {ui}
    </NextIntlClientProvider>,
  )
}

/**
 * Pasa axe sobre un nodo y devuelve las violaciones en formato legible.
 *
 * Se limita a las reglas WCAG 2.1 A y AA, que es el objetivo declarado en el
 * spec. Las reglas de contraste se desactivan a proposito: jsdom no calcula
 * estilos heredados ni resuelve variables CSS, asi que las reportaria mal.
 * El contraste se verifica sobre los tokens reales en palette.test.ts.
 */
export async function findA11yViolations(container: HTMLElement): Promise<string[]> {
  const results = await axe.run(container, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
    rules: { 'color-contrast': { enabled: false } },
  })

  return results.violations.map(
    (violation) =>
      `${violation.id}: ${violation.help} (${violation.nodes.length} nodo/s)\n    ${violation.nodes[0]?.html ?? ''}`,
  )
}
