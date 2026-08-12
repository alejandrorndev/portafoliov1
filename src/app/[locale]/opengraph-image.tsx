import { ImageResponse } from 'next/og'
import { getProfile } from '@/content'
import { LOCALES, type Locale } from '@/i18n/config'

/*
 * Imagen de vista previa, una por idioma.
 *
 * Es lo que se ve al pegar el enlace en LinkedIn, WhatsApp o Slack. Sin ella,
 * el enlace aparece como texto plano — que en la practica es la diferencia
 * entre que alguien lo abra o pase de largo.
 *
 * Se genera en build, no por peticion: `generateStaticParams` la convierte en
 * un PNG estatico por idioma.
 */

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'Alejandro Restrepo — Backend Developer'

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

export default async function OpenGraphImage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const profile = getProfile(locale)

  /*
   * Sin fuente propia: cargar Space Grotesk aqui obligaria a leer un archivo
   * de node_modules por una ruta que cambia con cada instalacion. La imagen se
   * apoya en el color y la composicion, que es lo que se reconoce a tamaño de
   * miniatura.
   */
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '80px',
        backgroundColor: '#00000d',
        backgroundImage:
          'radial-gradient(ellipse at 15% 30%, rgba(139,92,246,0.35) 0%, transparent 55%),' +
          'radial-gradient(ellipse at 85% 75%, rgba(6,182,212,0.28) 0%, transparent 50%)',
        color: '#f1f5f9',
      }}
    >
      <div
        style={{
          display: 'flex',
          fontSize: 26,
          letterSpacing: 8,
          textTransform: 'uppercase',
          color: '#06b6d4',
        }}
      >
        {profile.brand}
      </div>

      {/*
        Nombre corto, no el completo: "Alejandro Stiven Restrepo Naranjo" parte
        en dos lineas a este tamaño y desequilibra la composicion. A tamaño de
        miniatura en un feed, lo que se lee es el nombre corto.
      */}
      <div
        style={{
          display: 'flex',
          marginTop: 28,
          fontSize: 96,
          fontWeight: 700,
          lineHeight: 1.05,
          letterSpacing: -2,
        }}
      >
        {profile.displayName.first} {profile.displayName.last}
      </div>

      <div style={{ display: 'flex', marginTop: 24, fontSize: 36, color: '#94a3b8' }}>
        {profile.role}
      </div>

      <div
        style={{
          display: 'flex',
          marginTop: 44,
          height: 6,
          width: 220,
          borderRadius: 3,
          background: 'linear-gradient(90deg, #8b5cf6, #06b6d4)',
        }}
      />

      <div style={{ display: 'flex', marginTop: 40, fontSize: 26, color: '#64748b' }}>
        {profile.location}
      </div>
    </div>,
    size,
  )
}
