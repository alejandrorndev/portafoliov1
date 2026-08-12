/*
 * Pagina provisional de la Fase 0.
 * Existe para que el andamiaje sea verificable de punta a punta —build, lint,
 * tipos, tests y deploy— antes de que haya una sola seccion real.
 * La reemplaza la composicion de secciones en la Fase 3.
 */
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 p-8 text-center">
      <h1 className="text-2xl font-black tracking-widest uppercase">AR.dev</h1>
      <p className="text-sm text-slate-500">Fase 0 — andamiaje</p>
    </main>
  )
}
