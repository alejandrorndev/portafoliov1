/**
 * Secciones que aparecen en el menu, en orden.
 *
 * Cada id es a la vez el ancla en la URL y la clave dentro del namespace `nav`
 * de los mensajes, asi que agregar una seccion al menu es agregarla aqui y
 * traducir su etiqueta. El compilador exige lo primero; los tests de mensajes,
 * lo segundo.
 */
export const NAV_SECTIONS = ['about', 'skills', 'projects', 'experience', 'contact'] as const

export type NavSection = (typeof NAV_SECTIONS)[number]
