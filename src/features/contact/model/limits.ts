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

export const MESSAGE_MIN = 20
export const MESSAGE_MAX = 2000
export const NAME_MAX = 80
