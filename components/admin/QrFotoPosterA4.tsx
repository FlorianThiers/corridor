'use client'

import { useCallback, useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import './qr-foto-poster-a4.css'

const STEPS = [
  {
    n: '1',
    title: 'Scan',
    text: 'Scan de QR-code met je telefoon. Je komt op de zones-pagina van Corridor.',
  },
  {
    n: '2',
    title: 'Kies je zone',
    text: 'Tik de zone waar je was (of de foto over gaat).',
  },
  {
    n: '3',
    title: 'Account + e-mail',
    text: 'Log in of maak een account. Bevestig je e-mailadres (check je inbox).',
  },
  {
    n: '4',
    title: 'Upload je foto',
    text: 'Kies een foto (max 8 MB). Na goedkeuring verschijnt die op de zonepagina.',
  },
] as const

export function QrFotoPosterA4() {
  const posterRef = useRef<HTMLElement>(null)
  const [busy, setBusy] = useState(false)

  const downloadPdf = useCallback(async () => {
    const el = posterRef.current
    if (!el) return
    try {
      setBusy(true)
      await document.fonts?.ready
      await new Promise((r) => setTimeout(r, 150))
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffb6c1',
        logging: false,
      })
      const img = canvas.toDataURL('image/jpeg', 0.95)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      })
      pdf.addImage(img, 'JPEG', 0, 0, 210, 297, undefined, 'FAST')
      pdf.save('corridor-zones-foto-poster-a4.pdf')
    } catch (err) {
      console.error(err)
      alert('PDF maken mislukt. Probeer Print / PDF via de browser (marges: Geen).')
    } finally {
      setBusy(false)
    }
  }, [])

  return (
    <div className="poster-shell">
      <div className="poster-toolbar print:hidden">
        <button
          type="button"
          onClick={() => void downloadPdf()}
          disabled={busy}
          className="rounded-full bg-pink-500 px-6 py-3 font-semibold text-white shadow-lg hover:bg-pink-600 disabled:opacity-60"
        >
          {busy ? 'PDF maken…' : 'Download A4 PDF'}
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-full bg-white/90 px-6 py-3 font-semibold text-gray-800 shadow hover:bg-white"
        >
          Print / PDF (browser)
        </button>
        <a
          href="/beheer/qr"
          className="rounded-full bg-violet-500/90 px-5 py-3 text-sm font-medium text-white hover:bg-violet-600"
        >
          Terug naar QR
        </a>
      </div>

      <article ref={posterRef} className="poster-a4" aria-label="Corridor A4 poster foto upload">
        <div className="poster-bg" />
        <div className="poster-inner">
          <header className="poster-header">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/LogoCorridor-corri-dor-d.webp"
              alt="Corridor"
              className="poster-logo"
              crossOrigin="anonymous"
            />
            <p className="poster-eyebrow">Corri Culture · Gentbrugge</p>
            <h1 className="poster-title">Deel jouw foto&apos;s</h1>
            <p className="poster-lead">
              Scan de code, kies je zone, en upload een snapshot van Corridor.
            </p>
          </header>

          <div className="poster-qr-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/qr/zones.png?v=black"
              alt="QR naar corridor.gent/zones"
              className="poster-qr"
              crossOrigin="anonymous"
            />
            <p className="poster-qr-caption">corridor.gent/zones</p>
          </div>

          <ol className="poster-steps">
            {STEPS.map((step) => (
              <li key={step.n} className="poster-step">
                <span className="poster-step-n" aria-hidden>
                  {step.n}
                </span>
                <div>
                  <h2 className="poster-step-title">{step.title}</h2>
                  <p className="poster-step-text">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>

          <footer className="poster-footer">
            <p>
              Foto&apos;s gaan eerst langs de crew. Geen account zonder e-mailbevestiging.
            </p>
            <p className="poster-footer-meta">@corridor9050 · www.corridor.gent</p>
          </footer>
        </div>
      </article>
    </div>
  )
}
