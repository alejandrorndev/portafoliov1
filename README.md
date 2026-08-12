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
| 5    | Escena 3D                        | ⏳     |
| 6    | Formulario y CV                  | ⏳     |
| 7    | SEO, performance y accesibilidad | ⏳     |

## Variables de entorno

Copiar `.env.example` a `.env.local`. Ninguna es necesaria hasta la Fase 6; el sitio
arranca y compila sin configurar nada.
