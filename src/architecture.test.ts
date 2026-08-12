import { ESLint } from 'eslint'
import { beforeAll, describe, expect, it } from 'vitest'

/*
 * ---------------------------------------------------------------------------
 * Las reglas de dependencia son la arquitectura.
 * ---------------------------------------------------------------------------
 * Si dejan de aplicarse —por una actualizacion de ESLint, un cambio en el
 * orden de los bloques de flat config, o un patron mal escrito— no falla nada.
 * Simplemente dejan de bloquear, y las capas se enredan sin que nadie lo note
 * hasta que es caro deshacerlo.
 *
 * Este test hace que ese fallo sea ruidoso: corre ESLint contra archivos que
 * violan cada regla y exige que cada uno sea rechazado. Los fixtures estan en
 * globalIgnores para que `pnpm lint` no los reporte; aqui se analizan con
 * `ignore: false` justamente para saltarse esa exclusion.
 *
 * Todo se lintea de una sola pasada en beforeAll. Inicializar ESLint con la
 * config completa de Next cuesta segundos en frio —decenas en una maquina
 * cargada o en CI—, asi que hacerlo una vez por test lo volvia intermitente.
 * ---------------------------------------------------------------------------
 */

const FIXTURES = {
  sharedImportsFeature: 'src/shared/ui/__fixtures__/imports-feature.ts',
  featureImportsFeature: 'src/features/about/ui/__fixtures__/imports-other-feature.ts',
  featureImportsApp: 'src/features/skills/ui/__fixtures__/imports-app.ts',
  appSkipsContentBarrel: 'src/app/__fixtures__/imports-content-internals.ts',
  appReachesFeatureInternals: 'src/app/__fixtures__/imports-feature-internals.ts',
  contentReadsOwnData: 'src/content/__fixtures__/imports-own-file.ts',
} as const

const RESTRICTED = 'no-restricted-imports'

const toPosix = (filePath: string) => filePath.replaceAll('\\', '/')

let rulesByFixture: Map<string, string[]>

beforeAll(async () => {
  const files = Object.values(FIXTURES)
  const results = await new ESLint({ ignore: false }).lintFiles([...files])

  rulesByFixture = new Map(
    files.map((file) => {
      const result = results.find((candidate) => toPosix(candidate.filePath).endsWith(file))
      return [file, result?.messages.map((message) => message.ruleId ?? '') ?? []]
    }),
  )
}, 180_000)

const rulesFor = (fixture: string) => rulesByFixture.get(fixture) ?? []

describe('reglas de dependencia de la arquitectura', () => {
  it('shared/ no puede importar una feature', () => {
    expect(rulesFor(FIXTURES.sharedImportsFeature)).toContain(RESTRICTED)
  })

  it('una feature no puede importar otra feature', () => {
    expect(rulesFor(FIXTURES.featureImportsFeature)).toContain(RESTRICTED)
  })

  it('una feature no puede importar app/', () => {
    expect(rulesFor(FIXTURES.featureImportsApp)).toContain(RESTRICTED)
  })

  it('app/ no puede saltarse el barrel de content/', () => {
    expect(rulesFor(FIXTURES.appSkipsContentBarrel)).toContain(RESTRICTED)
  })

  it('app/ no puede entrar a los internos de una feature', () => {
    expect(rulesFor(FIXTURES.appReachesFeatureInternals)).toContain(RESTRICTED)
  })

  it('content/ si puede leer sus propios archivos de datos', () => {
    expect(rulesFor(FIXTURES.contentReadsOwnData)).not.toContain(RESTRICTED)
  })
})
