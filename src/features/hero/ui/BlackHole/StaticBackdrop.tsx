/**
 * Respaldo estatico de la escena 3D.
 *
 * Se muestra cuando el usuario pidio menos movimiento, cuando no hay WebGL o
 * mientras Three.js todavia esta descargando. Son gradientes CSS: cero bytes de
 * JavaScript, cero peticiones, y no hay imagen que pueda quedar desfasada
 * respecto a la escena real.
 *
 * No busca ser una captura fiel, sino conservar la silueta y la paleta —disco
 * naranja-cian sobre un centro negro— para que el hero no se quede vacio.
 */
export function StaticBackdrop() {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      {/* Resplandor del disco. */}
      <div
        className="absolute top-1/2 left-1/2 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 opacity-70"
        style={{
          background:
            'radial-gradient(closest-side, transparent 30%, rgb(103 232 249 / 0.35) 34%, rgb(139 92 246 / 0.28) 46%, rgb(236 72 153 / 0.14) 62%, transparent 78%)',
          transform: 'translate(-50%, -50%) rotate(-18deg) scaleY(0.34)',
        }}
      />

      {/* Anillo de fotones. */}
      <div
        className="absolute top-1/2 left-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            'radial-gradient(closest-side, #000 62%, rgb(255 255 255 / 0.85) 66%, rgb(103 232 249 / 0.5) 70%, rgb(139 92 246 / 0.18) 82%, transparent 100%)',
        }}
      />

      {/* Halo tenue de las estrellas. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, rgb(139 92 246 / 0.1) 0%, transparent 60%)',
        }}
      />
    </div>
  )
}
