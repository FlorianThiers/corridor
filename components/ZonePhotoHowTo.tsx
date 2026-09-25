'use client'

import Link from 'next/link'
import { isFestPhotoAutoApprove } from '@/lib/fest-photo-mode'

interface ZonePhotoHowToProps {
  /** overview = /zones · detail = zone detail page */
  variant: 'overview' | 'detail'
  zoneName?: string
}

export function ZonePhotoHowTo({ variant, zoneName }: ZonePhotoHowToProps) {
  const liveNow = isFestPhotoAutoApprove()

  const stepsOverview = [
    {
      n: '1',
      title: 'Kies een zone',
      text: 'Tik hieronder de zone waar je was (of open een zone via de QR op Corridor).',
    },
    {
      n: '2',
      title: 'Account + e-mail',
      text: 'Log in of maak een account. Bevestig je e-mailadres via de link in je inbox.',
    },
    {
      n: '3',
      title: 'Upload je foto’s',
      text: 'Op de zonepagina kies je één of meer foto’s (max 8 MB per stuk) — je ziet meteen een preview.',
    },
    {
      n: '4',
      title: liveNow ? 'Meteen live' : 'Crew keurt goed',
      text: liveNow
        ? 'Tijdens Corri d’Or Fest verschijnen je foto’s meteen op de zonepagina.'
        : 'Na goedkeuring verschijnt je foto op de zonepagina voor iedereen.',
    },
  ] as const

  const stepsDetail = [
    {
      n: '1',
      title: 'Account',
      text: 'Log in of registreer hieronder.',
    },
    {
      n: '2',
      title: 'E-mail bevestigen',
      text: 'Check je inbox en bevestig je adres.',
    },
    {
      n: '3',
      title: 'Foto’s kiezen',
      text: 'Meerdere tegelijk · JPG/PNG/WebP · max 8 MB · met preview.',
    },
    {
      n: '4',
      title: liveNow ? 'Publiceren' : 'Indienen',
      text: liveNow
        ? 'Tijdens het fest gaan ze meteen live.'
        : 'De crew keurt goed vóór publicatie.',
    },
  ] as const

  const steps = variant === 'overview' ? stepsOverview : stepsDetail
  const title =
    variant === 'overview'
      ? 'Zo deel je een foto'
      : `Foto toevoegen${zoneName ? ` · ${zoneName}` : ''}`
  const lead =
    variant === 'overview'
      ? liveNow
        ? 'Fest-weekend: upload één of meer snapshots — ze verschijnen meteen op de zone.'
        : 'Je kwam hier via de QR of via de site. Volg deze stappen om een snapshot van Corridor te delen.'
      : liveNow
        ? 'Fest-modus: meerdere foto’s tegelijk, meteen zichtbaar na upload.'
        : 'Je bent op de juiste zone. Volg de stappen hieronder om je foto in te dienen.'

  return (
    <section
      id={variant === 'overview' ? 'foto-delen' : undefined}
      className="mb-10 rounded-3xl border-2 border-pink-300 bg-white/80 p-6 shadow-sm backdrop-blur-sm md:p-8"
    >
      <div className="mb-6 text-center">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-pink-600">
          Corri Culture{liveNow ? ' · Fest live' : ''}
        </p>
        <h2 className="mb-2 text-2xl font-bold text-gray-800">{title}</h2>
        <p className="mx-auto max-w-2xl text-sm text-gray-600 md:text-base">{lead}</p>
      </div>

      <ol className="mb-6 grid gap-3 sm:grid-cols-2">
        {steps.map((step) => (
          <li
            key={step.n}
            className="flex gap-3 rounded-2xl border border-pink-100 bg-pink-50/70 p-4"
          >
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-500 text-sm font-bold text-white"
              aria-hidden
            >
              {step.n}
            </span>
            <div>
              <h3 className="font-bold text-gray-800">{step.title}</h3>
              <p className="text-sm text-gray-600">{step.text}</p>
            </div>
          </li>
        ))}
      </ol>

      {variant === 'overview' ? (
        <p className="text-center text-sm text-gray-600">
          Tip: open een zonekaart hieronder, scroll naar{' '}
          <span className="font-semibold text-pink-600">Foto toevoegen</span>, en upload.
        </p>
      ) : (
        <p className="mb-0 text-center text-sm text-gray-500">
          Terug naar{' '}
          <Link href="/zones#foto-delen" className="font-medium text-pink-600 hover:underline">
            alle zones + uitleg
          </Link>
        </p>
      )}
    </section>
  )
}
