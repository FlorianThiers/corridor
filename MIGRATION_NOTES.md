# Next.js Migratie - Notities

## ✅ Voltooide Migratie

De volledige migratie van vanilla JavaScript SPA naar Next.js 14 met App Router is voltooid.

### Nieuwe Structuur

```
corridor-nextjs/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout met Navigation
│   ├── page.tsx                  # Homepage (/)
│   ├── evenementen/page.tsx
│   ├── agenda/page.tsx
│   ├── zones/page.tsx
│   ├── corristories/page.tsx
│   ├── partners/page.tsx
│   ├── profiel/page.tsx
│   └── beheer/                   # Admin pages
│       ├── layout.tsx            # Admin layout met auth check
│       ├── evenementen/page.tsx
│       ├── corristories/page.tsx
│       ├── zones/page.tsx
│       ├── gebruikers/page.tsx
│       ├── partners/page.tsx
│       └── animatie/page.tsx
│
├── components/
│   ├── Navigation.tsx            # Hamburger menu sidebar
│   ├── LoginModal.tsx            # Auth modal
│   ├── HeroSection.tsx           # Homepage hero met GSAP
│   ├── Footer.tsx                # Herbruikbare footer
│   ├── EventCard.tsx             # Event card component
│   ├── ZoneCard.tsx              # Zone card component
│   ├── CorristoryCard.tsx        # Corristory card component
│   ├── PartnerCard.tsx           # Partner card component
│   ├── Calendar.tsx              # Calendar component
│   ├── PageSection.tsx           # Page section wrapper
│   ├── PageContainer.tsx         # Page container wrapper
│   ├── PageTitle.tsx             # Page title component
│   └── admin/                    # Admin components
│       ├── AdminLayout.tsx
│       ├── AdminEvents.tsx
│       ├── AdminCorristories.tsx
│       ├── AdminZones.tsx
│       ├── AdminUsers.tsx
│       ├── AdminPartners.tsx
│       └── AdminAnimatie.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Browser client
│   │   └── server.ts             # Server client
│   ├── auth.ts                   # Auth utilities
│   └── database.ts               # Database operations
│
├── hooks/
│   └── useAuth.ts                # Client-side auth hook
│
├── types/
│   └── index.ts                  # TypeScript types
│
└── public/                       # Static assets (behouden)
```

### Belangrijke Wijzigingen

1. **Asset Paths**: Alle assets in `/public` worden nu gerefereerd zonder `/public/` prefix (Next.js convention)
2. **Server-Side Rendering**: Alle pages gebruiken server-side data fetching waar mogelijk
3. **Type Safety**: Volledige TypeScript support met type definitions
4. **Clean Code**: Herbruikbare componenten, DRY principes, separation of concerns
5. **Authentication**: Server-side auth checks met `requireAuth()` en `requireAdmin()`

### Environment Variables

Maak een `.env.local` bestand aan met:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Oude Bestanden (kunnen verwijderd worden)

De volgende bestanden/directories zijn niet meer nodig na de migratie:

- `index.html` (vervangen door `app/layout.tsx` en `app/page.tsx`)
- `pages/*.html` (vervangen door `app/*/page.tsx`)
- `js/` directory (vervangen door `lib/`, `hooks/`, en `components/`)
- `css/` directory (vervangen door `app/globals.css` en Tailwind)
- `server.js` (Next.js heeft zijn eigen server)
- Oude build scripts in `package.json`

### Deployment

1. **Vercel**: De `vercel.json` is geconfigureerd met security headers
2. **Environment Variables**: Zet de Supabase credentials in Vercel project settings
3. **Build**: `npm run build` voor productie build
4. **Development**: `npm run dev` voor development server

### Nieuwe Features

- ✅ Server-Side Rendering (SSR)
- ✅ Static Site Generation (SSG) waar mogelijk
- ✅ Automatic code splitting
- ✅ Image optimization met Next.js Image component
- ✅ Type-safe database operations
- ✅ Clean component architecture
- ✅ Herbruikbare UI components

### Notities

- Alle admin pages hebben automatische auth checks via `app/beheer/layout.tsx`
- Public pages gebruiken server-side data fetching voor betere performance
- Client components gebruiken `'use client'` directive
- GSAP animaties werken in client components met `useEffect`
