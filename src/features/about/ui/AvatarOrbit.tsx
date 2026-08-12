/**
 * Avatar con anillos orbitales.
 *
 * Decorativo por completo: `aria-hidden`, porque no aporta nada que el texto
 * de al lado no diga ya.
 *
 * Los giros y el pulso son animaciones CSS puras — cero JavaScript— y la regla
 * global de `prefers-reduced-motion` en globals.css las detiene sin que este
 * componente tenga que consultarlo.
 */
export function AvatarOrbit() {
  return (
    <div aria-hidden="true" className="flex justify-center">
      <div className="relative flex h-64 w-64 items-center justify-center">
        <span className="border-y-purple/35 animate-orbit-fast absolute inset-0 rounded-full border border-x-transparent" />
        <span className="border-x-cyan/25 animate-orbit-mid absolute -inset-4 rounded-full border border-y-transparent" />
        <span className="border-y-pink/15 animate-orbit-slow absolute -inset-8 rounded-full border border-x-transparent" />

        <span className="bg-purple absolute top-0 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full shadow-[0_0_8px_currentColor]" />
        <span className="bg-cyan absolute top-1/2 right-0 h-1.5 w-1.5 -translate-y-1/2 rounded-full shadow-[0_0_8px_currentColor]" />

        <div className="border-purple/40 animate-glow-pulse flex h-44 w-44 items-center justify-center rounded-full border-[1.5px] bg-[radial-gradient(circle_at_35%_35%,rgb(139_92_246/0.35),rgb(6_182_212/0.15)_60%,rgb(0_0_0/0.5))] text-6xl">
          👨‍💻
        </div>
      </div>
    </div>
  )
}
