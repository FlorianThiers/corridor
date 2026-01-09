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

Deze website is een **Single Page Application (SPA)** met client-side routing. Het is cruciaal dat je hosting provider alle routes naar `index.html` doorstuurt, anders krijg je 404 fouten op alle pagina's behalve de homepage.

### 🔧 SPA Routing Configuratie

Kopieer het juiste configuratiebestand voor je hosting provider:

#### **Apache Server (.htaccess)**
Het bestand `.htaccess` is al toegevoegd aan de repository. Dit zorgt ervoor dat alle niet-bestaande bestanden naar `index.html` worden doorgestuurd.

#### **Netlify**
Het bestand `_redirects` is al toegevoegd aan de repository. Dit bestand wordt automatisch gebruikt door Netlify.

#### **Vercel**
Het bestand `vercel.json` is al toegevoegd aan de repository met de juiste rewrites configuratie.

#### **Firebase Hosting**
Het bestand `firebase.json` is al toegevoegd aan de repository.

#### **Nginx Server**
Gebruik de `nginx.conf` configuratie als template voor je server setup.

### 📋 Deployment per Provider

#### **Vercel (Aanbevolen)**
1. **Push naar GitHub/GitLab**
2. **Verbind met Vercel** en deploy automatisch
3. **Environment Variables instellen:**
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
4. **Deploy** - het `vercel.json` bestand regelt automatisch het routing

**⚠️ Belangrijk voor Vercel:**
- Zorg dat `SUPABASE_URL` en `SUPABASE_ANON_KEY` zijn ingesteld in Vercel dashboard (Project Settings > Environment Variables)
- De build stap genereert automatisch `js/supabase-config.js`
- Als deployment faalt:
  1. Check de build logs in Vercel dashboard
  2. Zorg dat alle environment variables correct zijn ingesteld
  3. Controleer of de `.vercelignore` niet te veel bestanden uitsluit
  4. Probeer een manual redeploy via Vercel dashboard

#### **Netlify**
1. **Push naar Git repository**
2. **Import project** in Netlify dashboard
3. **Environment Variables instellen:**
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
4. **Deploy** - het `_redirects` bestand regelt automatisch het routing

#### **Firebase Hosting**
1. **Installeer Firebase CLI:**
   ```bash
   npm install -g firebase-tools
   firebase login
   ```
2. **Initialize project:**
   ```bash
   firebase init hosting
   ```
3. **Deploy:**
   ```bash
   firebase deploy
   ```

#### **Apache/Nginx Server**
1. **Upload alle bestanden** naar je webserver
2. **Zorg ervoor dat `.htaccess` actief is** (Apache) of gebruik de nginx.conf
3. **Stel environment variables in** via server configuratie

### 🗄️ Database Setup

1. **Voer Supabase SQL uit:**
   ```sql
   -- Voer supabase/rls-policies.sql uit in Supabase SQL Editor
   ```

2. **Controleer Row Level Security policies**

### ✅ Controle na Deployment

Na deployment, test deze URLs:
- ✅ `https://jouw-domein.com/` (homepage)
- ✅ `https://jouw-domein.com/evenementen` (moet werken, niet 404)
- ✅ `https://jouw-domein.com/zones` (moet werken, niet 404)
- ✅ `https://jouw-domein.com/beheer-evenementen` (alleen ingelogd als admin)

### 🔍 Troubleshooting

**404 fouten op andere pagina's?**
- Controleer of de juiste configuratie actief is voor je hosting provider
- Bij Apache: zorg dat `.htaccess` overrides zijn toegestaan
- Bij Netlify: controleer of `_redirects` in de root staat

**JavaScript fouten?**
- Controleer of alle bestanden zijn geüpload (js/, pages/, public/)
- Controleer environment variables

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
