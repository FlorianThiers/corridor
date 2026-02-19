# Test Plan: Email Bevestiging

## ✅ Pre-test Checklist

### 1. Supabase Dashboard Configuratie

**BELANGRIJK:** Controleer deze instellingen in Supabase Dashboard:

1. Ga naar **Authentication** → **URL Configuration**
2. **Site URL** moet zijn ingesteld op:
   - Productie: `https://corridor.gent` (of je productiedomein)
   - Lokaal: `http://localhost:3000`
3. **Redirect URLs** moeten bevatten:
   - `https://corridor.gent/auth/callback`
   - `http://localhost:3000/auth/callback`
   - `https://*.vercel.app/auth/callback` (als je Vercel gebruikt)

### 2. Email Templates

Controleer in **Authentication** → **Email Templates**:
- **Confirm signup** template moet actief zijn
- Email moet de juiste redirect URL bevatten

## 🧪 Test Stappen

### Test 1: Lokale Test (Development)

1. **Start de development server:**
   ```bash
   npm run dev
   ```

2. **Open de applicatie:**
   - Ga naar `http://localhost:3000`

3. **Test registratie:**
   - Klik op "Registreren" of open de login modal
   - Vul het registratieformulier in met een **nieuw emailadres**
   - Klik op "Registreren"
   - Je zou moeten zien: "Account aangemaakt! Check je email voor verificatie."

4. **Check je email:**
   - Open je inbox (check ook spam folder)
   - Je zou een email moeten ontvangen met een bevestigingslink
   - De link zou moeten beginnen met: `http://localhost:3000/auth/callback?token=...`

5. **Klik op de bevestigingslink:**
   - De link zou je moeten doorverwijzen naar de homepage
   - De login modal zou automatisch moeten openen
   - Je zou moeten zien: "Je email is succesvol bevestigd! Je kunt nu inloggen."

6. **Test inloggen:**
   - Probeer in te loggen met het account dat je net hebt aangemaakt
   - Dit zou moeten werken nu de email is bevestigd

### Test 2: Productie Test

1. **Deploy naar productie** (als nog niet gedaan):
   ```bash
   git add .
   git commit -m "Fix email confirmation"
   git push
   ```

2. **Test op productiedomein:**
   - Ga naar `https://corridor.gent` (of je productiedomein)
   - Volg dezelfde stappen als Test 1
   - Gebruik een **ander emailadres** dan bij lokale test

### Test 3: Error Handling

1. **Test met ongeldige link:**
   - Probeer naar `/auth/callback` te gaan zonder code parameter
   - Je zou een error message moeten zien

2. **Test met verlopen link:**
   - Wacht 24+ uur na registratie
   - Probeer de oude bevestigingslink te gebruiken
   - Je zou een error message moeten zien

## 🔍 Debugging

### Als emails niet worden verzonden:

1. **Check Supabase Dashboard:**
   - Ga naar **Authentication** → **Providers** → **Email**
   - Zorg dat "Enable email provider" is aangezet
   - Check of er rate limits zijn

2. **Check email logs:**
   - Ga naar **Authentication** → **Users**
   - Klik op de gebruiker
   - Check "Audit Logs" voor email events

3. **Check console logs:**
   - Open browser developer tools (F12)
   - Check Console tab voor errors
   - Check Network tab voor failed requests

### Als redirect niet werkt:

1. **Check redirect URL configuratie:**
   - Zorg dat `/auth/callback` is toegevoegd aan Redirect URLs in Supabase
   - Zorg dat de URL exact overeenkomt (inclusief protocol en domein)

2. **Check callback route:**
   - Test direct: `http://localhost:3000/auth/callback?code=test`
   - Je zou een error moeten zien (want code is ongeldig)
   - Dit bevestigt dat de route werkt

3. **Check browser console:**
   - Kijk voor JavaScript errors
   - Check of de redirect wordt uitgevoerd

## ✅ Success Criteria

- [ ] Nieuwe gebruiker kan zich registreren
- [ ] Bevestigingsemail wordt verzonden
- [ ] Bevestigingslink werkt en redirect naar homepage
- [ ] Success message wordt getoond na bevestiging
- [ ] Gebruiker kan inloggen na email bevestiging
- [ ] Error messages worden correct getoond bij problemen

## 📝 Notities

Noteer hier eventuele problemen of observaties tijdens het testen:
