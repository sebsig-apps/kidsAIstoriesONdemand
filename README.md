# Sigvardsson Story App

En minimalistisk svensk webbapplikation för att skapa personliga AI-genererade berättelser för barn.

## Hur du kör webbsidan lokalt

1. Öppna `index.html` i din webbläsare
2. Eller använd en lokal server:
   ```bash
   # Om du har Python installerat:
   python -m http.server 8000
   
   # Om du har Node.js installerat:
   npx http-server
   ```
3. Navigera till `http://localhost:8000` i din webbläsare

## Funktionalitet

### ✅ Implementerat
- Minimalistisk nordisk design
- Användarregistrering (enkel form)
- Formulär för barnets detaljer:
  - Namn, ålder, längd
  - Favoritmat och favoritaktivitet  
  - Bästa minne tillsammans
  - Personlighetsbeskrivning
- Mockad AI-berättelsegeneration
- Förhandsgranskning och utskriftsfunktion
- Responsive design för mobil/desktop

### 🔄 För framtida utveckling
- Riktig AI-integration (OpenAI API, etc.)
- Databaslagring istället för localStorage
- Användarautentisering
- Fler berättelsemallar
- Bildgeneration för berättelserna
- E-postfunktioner

## Filstruktur
- `index.html` - Startsida med användarregistrering
- `form.html` - Formulär för barnets detaljer
- `story.html` - Berättelsegenerering och visning
- `styles.css` - Nordisk minimalist design
- `script.js` - JavaScript för navigation och funktionalitet

## Design
- Färgschema: Nordiska toner med blå gradienter
- Typography: Inter font för ren, modern känsla
- Responsiv design som fungerar på alla skärmstorlekar
- Minimalistisk approach inspirerad av skandinavisk design