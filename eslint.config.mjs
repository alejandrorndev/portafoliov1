import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import prettier from 'eslint-config-prettier'

/*
 * ---------------------------------------------------------------------------
 * REGLAS DE DEPENDENCIA
 * ---------------------------------------------------------------------------
 * La arquitectura es feature-first con una direccion de dependencia unica:
 *
 *     app  ->  features  ->  shared
 *
 * y una capa de contenido a la que solo se accede por su barrel.
 * Estas reglas existen para que esa direccion la haga cumplir el linter y no
 * la buena memoria de quien escribe el codigo.
 *
 * Los patrones cubren tanto los imports por alias (@/...) como los relativos
 * que escapan de su carpeta (../../features/...). La convencion del proyecto
 * es usar siempre el alias para cruzar capas.
 * ---------------------------------------------------------------------------
 */

/** Nadie fuera de content/ toca los archivos de datos: solo el barrel. */
const NO_DEEP_CONTENT = {
  group: ['@/content/*', '@/content/*/**', '**/content/*'],
  message:
    'Importa desde "@/content". Los archivos de datos son un detalle interno de esa capa; ese barrel es el unico contrato publico.',
}

/** app/ es el techo: nadie por debajo puede depender de el. */
const NO_APP = {
  group: ['@/app/*', '@/app/**', '**/app/*', '**/app/**'],
  message: 'Dependencia invertida: app/ compone, no es una dependencia.',
}

/** Solo app/ conoce features, y unicamente por su barrel. */
const NO_FEATURES = {
  group: ['@/features/*', '@/features/**', '**/features/*', '**/features/**'],
  message:
    'shared/ es la capa base: no puede conocer features/. Si el codigo necesita una feature, pertenece a esa feature.',
}

/** Entre features no hay contacto. */
const NO_CROSS_FEATURE = {
  group: ['@/features/*', '@/features/**', '**/features/*', '**/features/**'],
  message:
    'Las features estan aisladas entre si. Dentro de la propia feature usa rutas relativas; si dos features necesitan lo mismo, sube ese codigo a shared/.',
}

/** app/ entra por la puerta principal de cada feature, no por la ventana. */
const NO_FEATURE_INTERNALS = {
  group: ['@/features/*/**'],
  message:
    'Importa la feature por su barrel: "@/features/hero", no "@/features/hero/ui/Algo". El barrel es su interfaz publica.',
}

const restrict = (...patterns) => ({
  'no-restricted-imports': ['error', { patterns }],
})

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'coverage/**',
    'next-env.d.ts',
    'docs/legacy/**',
    // Violan las reglas a proposito. src/architecture.test.ts los analiza con
    // `ignore: false` para comprobar que efectivamente son rechazados.
    'src/**/__fixtures__/**',
  ]),

  /*
   * Cada bloque repite los patrones que necesita a proposito. En flat config,
   * cuando dos bloques definen la misma regla, el ultimo la reemplaza por
   * completo en vez de fusionarse; declararlos sueltos silenciaria los
   * anteriores sin previo aviso.
   */
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/content/**'],
    rules: restrict(NO_DEEP_CONTENT),
  },
  {
    files: ['src/shared/**/*.{ts,tsx}'],
    rules: restrict(NO_DEEP_CONTENT, NO_APP, NO_FEATURES),
  },
  {
    files: ['src/features/**/*.{ts,tsx}'],
    rules: restrict(NO_DEEP_CONTENT, NO_APP, NO_CROSS_FEATURE),
  },
  {
    files: ['src/app/**/*.{ts,tsx}'],
    rules: restrict(NO_DEEP_CONTENT, NO_FEATURE_INTERNALS),
  },

  // Va de ultimo: apaga las reglas de formato que se pisan con Prettier.
  prettier,
])

export default eslintConfig
