# Portafolio — Alejandro Restrepo Naranjo

Portafolio personal bilingüe (ES/EN) construido con Next.js.

Migración del `index.html` monolítico original, conservado como referencia en
[`docs/legacy/index.html`](docs/legacy/index.html). El diseño completo está en
[`docs/superpowers/specs/2026-08-11-migracion-nextjs-design.md`](docs/superpowers/specs/2026-08-11-migracion-nextjs-design.md).

## Stack

Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind CSS v4 · Vitest

## Requisitos

- Node.js >= 20.9
- pnpm 11

## Comandos

| Comando           | Qué hace                                            |
| ----------------- | --------------------------------------------------- |
| `pnpm dev`        | Servidor de desarrollo en http://localhost:3000     |
| `pnpm build`      | Build de producción                                 |
| `pnpm start`      | Sirve el build de producción                        |
| `pnpm verify`     | Tipos + lint + formato + tests (lo mismo que CI)    |
| `pnpm typecheck`  | `tsc --noEmit`                                      |
| `pnpm lint`       | ESLint                                              |
| `pnpm format`     | Aplica Prettier                                     |
| `pnpm test`       | Tests                                               |
| `pnpm test:watch` | Tests en modo watch                                 |
| `pnpm icons`      | Regenera los SVG de devicon usados por el contenido |

## Arquitectura

Feature-first, con una única dirección de dependencia:

```
app  ──▶  features  ──▶  shared
                │
                └──▶  content   (solo a través de su barrel)
```

```
src/
├── app/          Routing y composición. No contiene lógica de secciones.
├── features/     Una carpeta por sección. Autocontenidas y aisladas entre sí.
├── shared/       Primitivos de UI, hooks y utilidades. No conoce features.
├── content/      Los datos del portafolio, tipados y validados.
└── i18n/         Configuración de locales y strings de UI.
```

### Reglas

1. `app → features → shared`. Nunca en sentido contrario.
2. Una feature no importa a otra feature. Si dos la necesitan, ese código sube a `shared/`.
3. `app/` importa cada feature por su barrel (`@/features/hero`), nunca sus internos.
4. Nadie fuera de `content/` importa los archivos de datos: todo pasa por `@/content`.

**Estas reglas las hace cumplir ESLint, no la disciplina.** Violarlas es un error
de lint, no una observación en code review.

Y para que las reglas mismas no se degraden en silencio,
[`src/architecture.test.ts`](src/architecture.test.ts) corre ESLint contra archivos
que las violan a propósito y falla si alguno deja de ser rechazado.

### Por qué `content/` está separado

Los componentes nunca leen los archivos de datos: consumen `getProjects(locale)`
desde `@/content`. Esa indirección invierte la dependencia hacia los datos, así que
cambiar la fuente —de archivos locales a un CMS o una API— es reescribir ese barrel
sin tocar un solo componente.

## Estado

| Fase | Descripción                      | Estado |
| ---- | -------------------------------- | ------ |
| 0    | Andamiaje                        | ✅     |
| 1    | Contenido e i18n                 | ✅     |
| 2    | Design system                    | ✅     |
| 3    | Secciones                        | ✅     |
| 4    | Movimiento                       | ✅     |
| 5    | Fondo animado (ramas)            | ✅     |
| 6    | Formulario y CV                  | ✅\*   |
| 7    | SEO, performance y accesibilidad | ✅     |

\* El formulario necesita `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY` para enviar. Ver abajo.

La Fase 5 fue originalmente una escena 3D de un agujero negro con Three.js. Se
reemplazó por ramas en canvas 2D que crecen y se detienen solas (adaptadas de
antfu.me, MIT): en móvil la escena saturaba el sitio y mantenía un bucle de
render activo, y Three.js sumaba ~235 KB gzip.

## Variables de entorno

Copiar `.env.example` a `.env.local`. El sitio arranca y compila sin ninguna.

| Variable                                            | Para qué                | Sin ella                                                                                         |
| --------------------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------ |
| `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY`                  | Envío del formulario    | El formulario valida y responde, pero **no envía**: avisa por consola y ofrece el correo directo |
| `UPSTASH_REDIS_REST_URL` `UPSTASH_REDIS_REST_TOKEN` | Límite de envíos por IP | Se acepta todo envío; el honeypot sigue filtrando. Avisa por consola                             |
| `NEXT_PUBLIC_SITE_URL`                              | URLs canónicas y OG     | Se usan rutas relativas                                                                          |

**El envío lo hace el navegador, no el servidor:** el plan gratis de Web3Forms no
acepta envíos desde servidor. El servidor sigue validando y aplicando el límite por IP
antes. La access key es pública por diseño.

## CV

Un PDF por idioma en `public/cv/alejandro-restrepo-{es,en}.pdf`. URLs cortas para
compartir: `/cv` y `/cv/es` (español), `/cv/en` (inglés). Llevan `X-Robots-Tag:
noindex` para no aparecer en buscadores. Un test exige que los PDF existan.

Para actualizar el CV, reemplazar el archivo con el **mismo nombre**: los enlaces ya
enviados siguen funcionando.
