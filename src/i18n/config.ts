/**
 * Fuente unica de verdad de los idiomas del sitio.
 *
 * Todo lo demas —routing, middleware, tipos de contenido, esquemas de
 * validacion, hreflang— se deriva de aqui. Agregar un idioma es agregarlo a
 * esta tupla; a partir de ahi el compilador va senalando cada lugar que falta
 * traducir en vez de dejar huecos silenciosos.
 */
export const LOCALES = ['es', 'en'] as const

export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'es'

/** Nombre de cada idioma en su propio idioma, para el selector. */
export const LOCALE_LABELS: Record<Locale, string> = {
  es: 'Español',
  en: 'English',
}

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value)
}

/**
 * Namespaces de mensajes que necesitan los componentes de cliente.
 *
 * next-intl envia TODOS los mensajes al navegador por defecto. La mayor parte
 * de este sitio se renderiza en servidor, asi que eso significa serializar en
 * cada carga textos que nadie va a leer en el cliente — el aviso de privacidad
 * entero, por ejemplo, en una portada que no lo muestra.
 *
 * Solo cuatro componentes de cliente usan traducciones: el menu movil, los
 * enlaces de navegacion, el selector de idioma y el formulario de contacto.
 *
 * Ampliar esta lista al añadir un componente de cliente que traduzca es
 * obligatorio, y olvidarlo daria un error en runtime. Por eso
 * `src/i18n/client-namespaces.test.ts` recorre los archivos marcados como
 * 'use client' y falla si alguno usa un namespace que no esté aquí.
 */
export const CLIENT_NAMESPACES = ['a11y', 'nav', 'localeSwitcher', 'contact'] as const
