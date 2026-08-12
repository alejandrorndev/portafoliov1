# Migración del portafolio a Next.js — Diseño

**Fecha:** 2026-08-11
**Autor:** Alejandro Restrepo Naranjo
**Estado:** Aprobado — pendiente de plan de implementación

---

## 1. Contexto

El portafolio actual es un único archivo `index.html` de 1.532 líneas (56 KB) con todo
inline: markup, ~765 líneas de CSS y ~355 de JavaScript.

**Qué tiene hoy:**

| Área      | Detalle                                                                                                                                                                                                      |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 3D        | Three.js r128 vía CDN — escena de agujero negro: starfield (3.500 pts), disco de acreción (5 anillos keplerianos, ~3.700 pts), jets relativistas (1.000 pts), anillos de lensing, nube de nebulosa (600 pts) |
| Animación | GSAP 3.12 + ScrollTrigger — entrada del hero, reveals, staggers, contador de stats, navbar `stuck`, nav link activo                                                                                          |
| UI custom | Cursor propio (`cursor:none` global), loader con porcentaje simulado, typewriter de 5 roles                                                                                                                  |
| Secciones | Hero · About · Skills · Projects · Experience · Contact · Footer                                                                                                                                             |
| Estilo    | Dark cósmico, tokens en `:root` (purple `#8b5cf6`, cyan `#06b6d4`, gold `#f59e0b`, pink `#ec4899`), glassmorphism, gradientes en texto                                                                       |
| Externo   | devicon vía CDN, `Segoe UI` (sin webfont)                                                                                                                                                                    |
| Idioma    | Solo español                                                                                                                                                                                                 |

**Deuda técnica identificada:**

1. Cero separación entre datos y vista — skills, proyectos, experiencia y stats están hardcodeados en el markup.
2. Los acentos de color se asignan con `:nth-child()`. Reordenar un elemento desbarata la paleta.
3. `cursor:none` global sin fallback para dispositivos táctiles ni para navegación por teclado.
4. Sin `prefers-reduced-motion`.
5. Nav móvil inexistente: `@media(max-width:900px){ .nav-links{display:none} }` y nada lo reemplaza.
6. Sin metadatos SEO, sin Open Graph, sin datos estructurados.
7. Dependencias por CDN sin `integrity` ni versión fijada localmente.
8. Tipografía `Segoe UI` — el sitio se ve distinto fuera de Windows.
9. Teléfono personal expuesto en texto plano e indexable.

---

## 2. Objetivos

1. Migrar a Next.js conservando la identidad visual y la escena 3D.
2. Separar contenido de presentación para que actualizar el portafolio no requiera tocar componentes.
3. Publicar en español e inglés.
4. Corregir la deuda de accesibilidad, responsive y SEO.
5. Formulario de contacto funcional y descarga de CV.

### No-objetivos

- Rediseñar el layout o la identidad visual.
- Blog o sección de notas técnicas.
- Tema claro. El sitio es dark-only por decisión, no por omisión.
- CMS. El contenido vive en el repositorio.

---

## 3. Alcance

**Incluido:** landing de 6 secciones (paridad con el HTML actual), bilingüe ES/EN,
formulario de contacto funcional, descarga de CV en PDF por idioma, página de aviso
de privacidad.

**Excluido:** blog, autenticación, panel de administración, tema claro.

---

## 4. Stack

| Capa       | Elección                                       | Motivo                                                                |
| ---------- | ---------------------------------------------- | --------------------------------------------------------------------- |
| Framework  | Next.js 15+ (App Router)                       | Server Components, Metadata API, Server Actions                       |
| Lenguaje   | TypeScript, `strict: true`                     | El contenido tipado es el núcleo del diseño                           |
| Estilos    | Tailwind CSS v4                                | Tokens actuales mapeados a `@theme`; elimina 765 líneas de CSS        |
| i18n       | next-intl                                      | Estándar de facto en App Router                                       |
| Animación  | Framer Motion                                  | Reemplaza GSAP + ScrollTrigger; API declarativa e idiomática en React |
| 3D         | React Three Fiber + drei                       | Three.js con ciclo de vida gestionado por React                       |
| Validación | Zod                                            | Un mismo esquema valida contenido en build y formulario en runtime    |
| Correo     | Resend                                         | Free tier, sin tarjeta; requiere verificación DNS del dominio         |
| Rate limit | Upstash Redis                                  | En serverless no sirve estado en memoria                              |
| Tests      | Vitest + Testing Library, axe-core, Playwright | Unitario/integración, accesibilidad y smoke E2E                       |
| Hosting    | Vercel (Hobby)                                 | Server Actions, middleware, OG dinámica                               |

> La versión mayor exacta de Next.js y React se fija en la Fase 0 contra la última
> estable disponible ese día. El diseño no depende de una versión mayor concreta.

---

## 5. Arquitectura — Feature-first

### Estructura

```
src/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx            # html lang, fuentes, metadata, JSON-LD
│   │   ├── page.tsx              # composición de las 6 secciones
│   │   └── privacidad/page.tsx
│   ├── opengraph-image.tsx
│   ├── sitemap.ts
│   ├── robots.ts
│   └── manifest.ts
│
├── middleware.ts                 # detección y redirección de locale
│
├── features/
│   ├── hero/
│   │   ├── ui/
│   │   │   ├── HeroSection.tsx
│   │   │   ├── Typewriter.tsx
│   │   │   └── BlackHole/        # escena R3F aislada
│   │   └── index.ts              # interfaz pública
│   ├── about/
│   ├── skills/
│   ├── projects/
│   ├── experience/
│   ├── contact/                  # incluye el formulario y su Server Action
│   └── navigation/               # nav desktop + drawer móvil + scroll spy
│
├── shared/
│   ├── ui/                       # SectionHeading, Chip, Tag, Card, Button, Reveal
│   ├── hooks/                    # useReducedMotion, usePointerFine, useScrollSpy
│   └── lib/                      # cn(), helpers
│
├── content/                      # el "port" de datos
│   ├── types.ts
│   ├── schemas.ts                # Zod
│   ├── profile.ts
│   ├── skills.ts
│   ├── projects.ts
│   ├── experience.ts
│   └── index.ts                  # getProfile(), getProjects(), getExperience()…
│
├── i18n/
│   ├── config.ts                 # locales, default
│   └── messages/{es,en}.json     # strings de UI
│
└── styles/globals.css            # @theme con los tokens
```

### Reglas de dependencia

Se hacen cumplir con ESLint (`import/no-restricted-paths`), no por convención:

1. `app → features → shared`. Nunca en sentido contrario.
2. Una feature no importa a otra feature.
3. Fuera de `content/`, nadie importa los archivos de datos directamente; todo pasa por `content/index.ts`.
4. `shared/` no importa de `features/` ni de `app/`.

### El "port" de contenido

`content/index.ts` expone funciones (`getProjects(locale)`, `getExperience(locale)`,
`getProfile(locale)`) y es lo único que los componentes conocen. Los archivos de datos
son un detalle de implementación detrás de esa interfaz.

Esto invierte la dependencia hacia los datos sin pagar el costo de una arquitectura
hexagonal completa. Si en el futuro el contenido debe venir de un CMS o de una API,
se reescriben esas funciones y ningún componente cambia. Si además apareciera lógica
de negocio real, `domain/` y `application/` se insertan detrás del mismo port.

**Alternativas descartadas:**

- _Hexagonal / Ports & Adapters completo_: un portafolio estático no tiene reglas de
  negocio que proteger. El "dominio" serían DTOs sin comportamiento, y cuatro capas
  de indirección para renderizar listas.
- _Atomic Design_: la taxonomía atoms/molecules/organisms no describe dependencias,
  que es el problema que una arquitectura debe resolver, y clasificar consume más
  tiempo del que ahorra.

---

## 6. Modelo de contenido e i18n

### Tipos

```ts
export const LOCALES = ['es', 'en'] as const
export type Locale = (typeof LOCALES)[number]

export type Localized<T> = Record<Locale, T>

export type Accent = 'purple' | 'cyan' | 'pink' | 'gold'

export type Project = {
  id: string
  type: Localized<string>
  title: Localized<string>
  description: Localized<string>
  tags: string[] // no se traduce
  icon: string // emoji
  gradient: readonly [string, string]
  links: { demo?: string; github?: string }
}

export type SkillCategory = {
  id: string
  title: Localized<string>
  accent: Accent
  items: { name: string; icon: string }[] // icon = clase devicon
}

export type ExperienceItem = {
  id: string
  period: string
  current?: boolean
  company: string
  role: Localized<string>
  description: Localized<string>
  stack: string[]
  accent: Accent
}

export type Stat = {
  id: string
  value: number
  suffix: string
  label: Localized<string>
}
```

### Decisión: `Localized<T>` en vez de archivos por idioma

Con `projects.es.ts` y `projects.en.ts` separados, agregar un proyecto en uno y
olvidarlo en el otro es un error silencioso que aparece en producción. Con
`Localized<T>` el compilador rechaza el build si falta un idioma. Un solo registro
por proyecto, imposible que se desincronicen.

Los strings de UI (nav, botones, labels, mensajes de error) sí van aparte en
`i18n/messages/{es,en}.json`, gestionados por next-intl. Son textos sin estructura
y con volumen alto de cambios.

### Acentos como dato

El color de cada tarjeta de skills y de cada item del timeline pasa de `:nth-child()`
a un campo `accent` en el modelo. El color viaja con el contenido y reordenar el
array deja de romper la paleta.

### Validación

Cada archivo de contenido se valida con Zod al importarse. Como la importación ocurre
durante el build, un enum inválido, una URL mal formada o un idioma faltante rompen
el build en lugar de la página en producción.

### Routing

- `/` → el middleware detecta `Accept-Language` y redirige a `/es` o `/en`.
- `/es`, `/en` → landing.
- `/es/privacidad`, `/en/privacy` → aviso de privacidad.
- `hreflang` recíproco entre ambas versiones vía `alternates` en la Metadata API.

---

## 7. Design system

Los tokens de `:root` se trasladan a `@theme` de Tailwind v4 con los mismos valores
hexadecimales. La paleta no cambia.

`shared/ui` cubre lo que hoy está repetido en el CSS:

| Componente       | Reemplaza                                          |
| ---------------- | -------------------------------------------------- |
| `SectionHeading` | `.s-head` + `.s-tag` + `.s-title` + `.s-line` (×5) |
| `Chip`           | `.chip` (28 instancias)                            |
| `Tag`            | `.p-tag` y `.t-chip` (unificados)                  |
| `Card`           | `.p-card` y `.skill-box`                           |
| `Button`         | `.btn-fill` y `.btn-ghost`                         |
| `Reveal`         | `.rv`, `.rv-l`, `.rv-r` — wrapper de Framer Motion |

**Tipografía:** se abandona `Segoe UI`. Se cargan dos familias con `next/font`
(self-hosted, sin CLS): una display para titulares y una de texto. Por defecto
Space Grotesk (display) + Inter (texto); es lo primero que se revisa visualmente
en la Fase 2 y puede cambiarse sin afectar la arquitectura.

**Iconos:** devicon pasa de CDN a dependencia npm self-hosted. Elimina una
dependencia de terceros en el render y evita problemas de CSP.

---

## 8. Animación y 3D

### Movimiento

GSAP + ScrollTrigger se reemplazan por Framer Motion. Los reveals pasan a
`whileInView`, los staggers a `staggerChildren`, y el scroll spy del nav a un hook
propio con `IntersectionObserver`.

`prefers-reduced-motion` se respeta de forma global: con la preferencia activa, los
reveals se resuelven a estado final sin transición, el typewriter muestra el primer
rol fijo, el contador de stats muestra el valor final, y la escena 3D se sustituye
por su fallback estático.

### Cursor personalizado

Se renderiza únicamente si `(pointer: fine)` y `(hover: hover)`. En cualquier otro
caso el cursor nativo permanece intacto. `cursor: none` deja de aplicarse de forma
global y pasa a estar acotado a ese mismo condicional.

### Loader

El loader actual simula progreso con `Math.random()` durante ~1,5 s antes de mostrar
nada. Se sustituye por un estado ligado a la carga real de la escena 3D, y el
contenido del hero (texto, botones) se muestra de inmediato sin esperarlo. El texto
no debe estar bloqueado por una animación decorativa.

### Escena 3D

Se porta a React Three Fiber conservando la geometría y la paleta. Aislada en
`features/hero/ui/BlackHole/` y cargada con `dynamic(..., { ssr: false })`.

Degradación en cascada:

1. `prefers-reduced-motion` activo → imagen estática, no se descarga Three.js.
2. Sin WebGL → imagen estática.
3. Fuera del viewport → el bucle de render se pausa.
4. `devicePixelRatio` limitado a 2 (ya está en el código actual, se conserva).
5. Conteo de partículas reducido en viewports pequeños.

La imagen de fallback es una captura de la escena, servida como `next/image`.

---

## 9. Formulario de contacto

- **Campos:** nombre, correo, mensaje.
- **Validación:** un único esquema Zod compartido entre cliente y Server Action. La validación de servidor es la autoritativa; la de cliente es solo experiencia de usuario.
- **Envío:** Server Action → Resend. Remitente en el dominio propio, verificado por DNS.
- **Anti-spam:** honeypot (campo oculto que debe llegar vacío) + rate limit por IP con Upstash Redis. No se usa CAPTCHA: degrada la experiencia y el honeypot combinado con rate limit cubre el volumen esperado.
- **Estados:** idle, enviando, éxito, error. Errores de campo y error general diferenciados, y ambos traducidos.
- **Accesibilidad:** labels asociados, `aria-invalid`, errores anunciados en una región `aria-live`.
- **Privacidad:** enlace visible al aviso de privacidad junto al botón de envío.

Los secretos (`RESEND_API_KEY`, credenciales de Upstash) van en variables de entorno
de Vercel. `.env.example` documenta las claves sin valores.

---

## 10. CV

Dos PDF estáticos en `public/cv/`, uno por idioma. El enlace de descarga resuelve el
archivo según el locale activo. La descarga se registra como evento de analítica.

---

## 11. SEO

- Metadata API con `title`, `description`, `openGraph` y `twitter` por idioma.
- `alternates.languages` con `hreflang` recíproco ES/EN.
- Imagen Open Graph generada con `next/og`, una por idioma.
- JSON-LD de tipo `Person` con nombre, cargo, ubicación, perfiles sociales y stack.
- `sitemap.ts` con ambas versiones de idioma; `robots.ts`; `manifest.ts`.
- Un solo `<h1>` por página; jerarquía de encabezados correcta.

---

## 12. Accesibilidad

Objetivo: **WCAG 2.1 AA**.

- Navegación completa por teclado, con indicador de foco visible en todos los interactivos.
- Nav móvil real: drawer accesible con trampa de foco, cierre con `Escape` y `aria-expanded`.
- Contraste verificado. `--muted` (`#64748b`) sobre `--bg` (`#00000d`) se audita y se aclara si no alcanza 4.5:1 en texto de cuerpo.
- `prefers-reduced-motion` respetado en todo el sitio.
- Los gradientes sobre texto (`-webkit-text-fill-color: transparent`) se verifican en modo de alto contraste forzado.
- La escena 3D es decorativa: `aria-hidden`, fuera del orden de tabulación.
- Enlace "saltar al contenido" al inicio del documento.
- `axe-core` integrado en los tests de componentes.

---

## 13. Performance

Presupuesto objetivo, medido en móvil con la escena 3D activa:

| Métrica                       | Objetivo      |
| ----------------------------- | ------------- |
| LCP                           | < 2,5 s       |
| INP                           | < 200 ms      |
| CLS                           | < 0,1         |
| JS inicial (sin la escena 3D) | < 150 KB gzip |

Three.js no entra en el bundle inicial. El texto del hero se renderiza en servidor y
es el candidato a LCP; no debe depender de la escena.

Lighthouse CI corre en cada pull request y falla el build si se rompe el presupuesto.

---

## 14. Testing

Los tests se escriben dentro de cada fase, no al final.

| Nivel         | Herramienta              | Cobertura                                                                                           |
| ------------- | ------------------------ | --------------------------------------------------------------------------------------------------- |
| Contenido     | Vitest                   | Los esquemas Zod validan todos los archivos de datos; ningún `Localized<T>` incompleto              |
| Unitario      | Vitest + Testing Library | Componentes de `shared/ui` y hooks                                                                  |
| Integración   | Vitest + Testing Library | Formulario: validación, honeypot, estados de error y éxito                                          |
| Accesibilidad | `axe-core`               | Sin violaciones en cada sección renderizada                                                         |
| E2E           | Playwright               | Smoke: carga en ambos idiomas, navegación entre secciones, envío del formulario con Resend simulado |

La escena 3D no se somete a tests unitarios; se cubre con una verificación de que el
fallback aparece cuando WebGL no está disponible o `prefers-reduced-motion` está activo.

---

## 15. CI/CD y despliegue

**GitHub Actions** en cada pull request: lint, typecheck, tests, build, Lighthouse CI.

**Vercel** conectado al repositorio: preview por rama, producción desde `main`.

**Flujo de ramas:** se conserva el actual — trabajo en `develop`, `main` es producción.

**Hooks locales:** Husky + lint-staged (Prettier y ESLint sobre lo modificado) y
commitlint con Conventional Commits, que ya es la convención en uso.

**Cuenta:** Vercel se registra con la cuenta personal de GitHub (`alejandrorndev`),
no con la del trabajo.

---

## 16. Plan por fases

Cada fase deja el sitio desplegable y verificable.

| #   | Fase                    | Entrega                                                                                                                                  | Riesgo   |
| --- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 0   | Andamiaje               | Next.js + TS strict + Tailwind v4, ESLint con reglas de dependencia, Prettier, Husky, commitlint, Vitest, Actions, deploy vacío a Vercel | bajo     |
| 1   | Contenido e i18n        | `content/` completo y bilingüe, tipos y esquemas Zod, `[locale]`, next-intl, middleware. Sin UI                                          | bajo     |
| 2   | Design system           | Tokens en `@theme`, `shared/ui`, `next/font`, devicon self-hosted                                                                        | bajo     |
| 3   | Secciones               | Las 6 secciones sin animación. Nav móvil real. Sitio completo y navegable                                                                | medio    |
| 4   | Movimiento              | Reveals, typewriter, contador, scroll spy, loader, cursor con guardas                                                                    | medio    |
| 5   | Escena 3D               | R3F, carga diferida, degradación en cascada                                                                                              | **alto** |
| 6   | Formulario y CV         | Server Action, Resend, honeypot, rate limit, aviso de privacidad, PDFs                                                                   | medio    |
| 7   | SEO, performance y a11y | Metadata, OG dinámica, JSON-LD, hreflang, sitemap, Lighthouse CI, auditoría de accesibilidad                                             | bajo     |

La escena 3D va de última porque concentra el riesgo técnico. Para cuando se aborde,
ya existe un portafolio publicable que funciona sin ella.

---

## 17. Riesgos

| Riesgo                                                       | Impacto                                    | Mitigación                                                                                                                  |
| ------------------------------------------------------------ | ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| La escena 3D degrada el rendimiento en móviles de gama media | Alto — es lo primero que ve un reclutador  | Carga diferida, pausa fuera de viewport, partículas reducidas por viewport, fallback estático, presupuesto verificado en CI |
| El port de Three.js a R3F introduce diferencias visuales     | Medio                                      | Fase aislada; comparación contra capturas del original; el original queda en el historial de git                            |
| La traducción al inglés queda incompleta o de baja calidad   | Medio — un inglés torpe resta credibilidad | `Localized<T>` impide omisiones; la calidad del texto requiere revisión humana                                              |
| Spam en el formulario                                        | Medio                                      | Honeypot + rate limit; escalar a CAPTCHA solo si se materializa                                                             |
| Resend requiere verificación DNS del dominio                 | Bajo pero bloqueante para la Fase 6        | Comprar y verificar el dominio antes de esa fase                                                                            |

---

## 18. Decisiones abiertas

Ninguna bloquea el inicio. Cada una tiene un valor por defecto para no detener la implementación.

| Tema             | Por defecto                                                        | Cuándo se decide                    |
| ---------------- | ------------------------------------------------------------------ | ----------------------------------- |
| Dominio          | `alejandrorestrepo.dev` sujeto a disponibilidad                    | Antes de la Fase 6 (bloquea Resend) |
| Tipografía       | Space Grotesk + Inter                                              | Fase 2, revisión visual             |
| Analítica        | Vercel Analytics                                                   | Fase 7                              |
| Teléfono público | Se retira del sitio; el formulario pasa a ser el canal de contacto | Fase 6                              |

---

## 19. Observaciones sobre el contenido

Fuera del alcance técnico, pero relevante para un sitio que funciona como carta de
presentación:

1. **Desalineación entre experiencia y proyectos.** La sección de experiencia describe
   un perfil backend semi-senior (NestJS, DDD, CQRS, AWS Lambda, GraphQL). Los seis
   proyectos mostrados son de nivel inicial: carrito de compras, slider de imágenes,
   maqueta de sitio de café. La sección "Proyectos" contradice a la sección
   "Experiencia". La arquitectura hace trivial agregar o reordenar proyectos, pero
   producir dos o tres piezas backend representativas es trabajo de contenido, no de
   implementación.
2. **Estadística inconsistente:** el contador indica "10+ proyectos" y se muestran seis.
3. **Teléfono expuesto** en texto plano en un sitio indexable.
