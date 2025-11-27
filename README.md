# Corridor - Urban Sport Hub Website

Een moderne website voor Corridor, de Urban Sport Hub van Gentbrugge onder het E17 viaduct.

## 🏗️ Over Corridor

Corridor is de Urban Sport Hub van Gentbrugge en omstreken waar je kunt voetballen, basketten, boksen, aan parcours doen, dansen, lopen en plezier maken. Het project bevindt zich onder het E17 viaduct in Gentbrugge en biedt een overdekte ruimte voor verschillende sportactiviteiten.

## ✨ Features

- **Modern SPA Design**: Single Page Application met client-side routing
- **Supabase Backend**: Real-time database en authenticatie
- **Admin Panel**: Volledig beheerpaneel voor content management
- **Responsive Design**: Optimaal voor desktop en mobiel
- **Parallax Effects**: Smooth scrolling met GSAP animaties
- **User Management**: Login, registratie en rollenbeheer

## 🛠️ Technologie Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Styling**: Tailwind CSS
- **Animations**: GSAP + ScrollTrigger
- **Backend**: Supabase (PostgreSQL + Auth)
- **Deployment**: Vercel
- **Build**: Node.js + npm

## 📁 Project Structuur

```
Corridor/
├── index.html              # Hoofdpagina met router
├── pages/                  # Alle pagina's
│   ├── home.html
│   ├── activiteiten.html
│   ├── admin.html
│   └── ...
├── js/                     # JavaScript modules
│   ├── router.js           # Client-side routing
│   ├── database.js         # Supabase database operations
│   ├── auth.js             # Authenticatie management
│   └── supabase-config.js  # Auto-generated config
├── public/                  # Static assets
├── supabase/               # Database scripts
│   └── rls-policies.sql   # Row Level Security policies
├── scripts/                 # Build scripts
│   └── build-config.js     # Environment config generator
└── package.json             # Dependencies
```

## 🚀 Lokaal Development

1. **Clone de repository**
   ```bash
   git clone <repository-url>
   cd Corridor
   ```

2. **Installeer dependencies**
   ```bash
   npm install
   ```

3. **Maak `.env` bestand** (kopieer van `.env.example`)
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Build config**
   ```bash
   npm run build
   ```

5. **Start lokale server** (bijv. met Live Server in VS Code)
   - Of gebruik: `python -m http.server 8000`
   - Open: `http://localhost:8000`

## 🚀 Productie Deployment

Zie [DEPLOYMENT.md](./DEPLOYMENT.md) voor volledige deployment instructies.

**Quick Start:**
1. Voer `supabase/rls-policies.sql` uit in Supabase SQL Editor
2. Stel environment variables in Vercel:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
3. Deploy naar Vercel (automatisch via Git push)

## 📞 Contact

Voor vragen over Corridor:
- **Bert** (Verantwoordelijke): bert@sportaround.be
- **Algemeen**: info@sportaround.be
- **Telefoon**: +32 496 90 55 34

## 🤝 Partners

Corridor is een samenwerking tussen:
- Sportaround
- Ghent Basketball  
- Skateboard Academy
- FROS
- Artevelde Hogeschool

## 📍 Locatie

Onder het E17 viaduct, Gentbrugge, 9050 Gent

---

Website ontwerp & ontwikkeling door [Florian Thiers](https://florian-tau.vercel.app)
