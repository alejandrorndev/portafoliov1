/*
 * Limites del formulario, en un modulo sin dependencias.
 *
 * Viven aparte de schema.ts a proposito. El formulario es un componente de
 * cliente y necesita MESSAGE_MAX para el atributo maxLength; si lo importara
 * de schema.ts —que importa zod— el bundler arrastraria zod entero al
 * navegador. Son ~70 KB gzip de librería de validación por una constante
 * numérica.
 *
 * El esquema los consume desde aqui, asi que cliente y servidor siguen
 * compartiendo un unico origen para estos numeros.
 */

/*
 * Formato de correo, compartido por el esquema (servidor) y la validacion al
 * salir del campo (cliente). Vive aqui por la misma razon que los limites: el
 * formulario lo necesita sin arrastrar zod.
 *
 * Deliberadamente practico, no RFC 5322: exige usuario, @, dominio con al
 * menos un punto y una extension de 2+ letras. Rechaza puntos al inicio, al
 * final o seguidos, y guiones en los extremos de cada parte del dominio.
 */
export const EMAIL_PATTERN =
  /^(?!.*\.\.)[A-Za-z0-9](?:[A-Za-z0-9._%+-]*[A-Za-z0-9])?@(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z]{2,}$/

export const MESSAGE_MIN = 20
export const MESSAGE_MAX = 2000
export const NAME_MAX = 80
