import { ESLint } from 'eslint'
import { describe, expect, it } from 'vitest'

/*
 * ---------------------------------------------------------------------------
 * Las reglas de dependencia son la arquitectura.
 * ---------------------------------------------------------------------------
 * Si dejan de aplicarse —por una actualizacion de ESLint, un cambio en el
 * orden de los bloques de flat config, o un patron mal escrito— no falla
 * nada. Simplemente dejan de bloquear, y las capas se enredan sin que nadie
 * lo note hasta que es caro deshacerlo.
 *
 * Este test hace que ese fallo sea ruidoso: corre ESLint contra archivos que
 * violan cada regla y exige que cada uno sea rechazado. Los fixtures estan en
 * globalIgnores para que `pnpm lint` no los reporte; aqui se analizan con
 * `ignore: false` justamente para saltarse esa exclusion.
 * ---------------------------------------------------------------------------
 */

const eslint = new ESLint({ ignore: false })

async function lint(file: string) {
  const [result] = await eslint.lintFiles([file])
  return result?.messages ?? []
}

const RESTRICTED = 'no-restricted-imports'

describe('reglas de dependencia de la arquitectura', () => {
  it('shared/ no puede importar una feature', async () => {
    const messages = await lint('src/shared/ui/__fixtures__/imports-feature.ts')
    expect(messages.map((m) => m.ruleId)).toContain(RESTRICTED)
  })

  it('una feature no puede importar otra feature', async () => {
    const messages = await lint('src/features/about/ui/__fixtures__/imports-other-feature.ts')
    expect(messages.map((m) => m.ruleId)).toContain(RESTRICTED)
  })

  it('una feature no puede importar app/', async () => {
    const messages = await lint('src/features/skills/ui/__fixtures__/imports-app.ts')
    expect(messages.map((m) => m.ruleId)).toContain(RESTRICTED)
  })

  it('app/ no puede saltarse el barrel de content/', async () => {
    const messages = await lint('src/app/__fixtures__/imports-content-internals.ts')
    expect(messages.map((m) => m.ruleId)).toContain(RESTRICTED)
  })

  it('app/ no puede entrar a los internos de una feature', async () => {
    const messages = await lint('src/app/__fixtures__/imports-feature-internals.ts')
    expect(messages.map((m) => m.ruleId)).toContain(RESTRICTED)
  })

  it('content/ si puede leer sus propios archivos de datos', async () => {
    const messages = await lint('src/content/__fixtures__/imports-own-file.ts')
    expect(messages.map((m) => m.ruleId)).not.toContain(RESTRICTED)
  })
})
