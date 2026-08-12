/**
 * Avatar con anillos orbitales.
 *
 * Decorativo por completo: `aria-hidden`, porque no aporta informacion que el
 * texto de al lado no de ya. El giro de los anillos y el pulso del resplandor
 * llegan en la Fase 4; aqui va solo la estructura.
 */
export function AvatarOrbit() {
  return (
    <div aria-hidden="true" className="flex justify-center">
      <div className="relative flex h-64 w-64 items-center justify-center">
        <span className="border-y-purple/35 absolute inset-0 rounded-full border border-x-transparent" />
        <span className="border-x-cyan/25 absolute -inset-4 rounded-full border border-y-transparent" />
        <span className="border-y-pink/15 absolute -inset-8 rounded-full border border-x-transparent" />

        <span className="bg-purple absolute top-0 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full shadow-[0_0_8px_currentColor]" />
        <span className="bg-cyan absolute top-1/2 right-0 h-1.5 w-1.5 -translate-y-1/2 rounded-full shadow-[0_0_8px_currentColor]" />

        <div className="border-purple/40 flex h-44 w-44 items-center justify-center rounded-full border-[1.5px] bg-[radial-gradient(circle_at_35%_35%,rgb(139_92_246/0.35),rgb(6_182_212/0.15)_60%,rgb(0_0_0/0.5))] text-6xl shadow-[0_0_40px_rgb(139_92_246/0.3),inset_0_0_40px_rgb(0_0_0/0.5)]">
          👨‍💻
        </div>
      </div>
    </div>
  )
}
