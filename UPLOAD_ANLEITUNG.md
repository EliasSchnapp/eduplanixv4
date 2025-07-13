# EDUPLANIX - Upload zu All-Inkl Premium Server

## Schritt-für-Schritt Anleitung

### 1. Dateien für Upload vorbereiten

**Diese Dateien brauchst du:**
```
📁 client/           # Frontend-Code
📁 server/           # Backend-Code  
📁 shared/           # Gemeinsame Schemas
📁 attached_assets/  # Logo und Bilder
📄 package.json      # Abhängigkeiten
📄 package-lock.json # Versionslock
📄 drizzle.config.ts # Datenbank-Konfiguration
📄 vite.config.ts    # Build-Konfiguration
📄 tailwind.config.ts # Styling
📄 tsconfig.json     # TypeScript-Konfiguration
📄 components.json   # UI-Komponenten
📄 postcss.config.js # CSS-Verarbeitung
```

**Diese Ordner NICHT hochladen:**
- `node_modules/` (wird auf dem Server neu installiert)
- `dist/` (wird auf dem Server erstellt)
- `.replit`
- `.gitignore`

### 2. All-Inkl Server vorbereiten

**2.1 Node.js aktivieren:**
- Im All-Inkl Control Panel: "Software" → "Node.js"
- Node.js Version 18 oder höher wählen
- Aktivieren

**2.2 PostgreSQL Datenbank erstellen:**
- Im Control Panel: "Datenbanken" → "PostgreSQL"
- Neue Datenbank erstellen: `eduplanix`
- Benutzer erstellen und Rechte vergeben

### 3. Dateien hochladen

**Via FTP/SFTP:**
1. Alle Projektdateien in den Webspace-Ordner hochladen
2. Dateirechte setzen: Ordner `755`, Dateien `644`

### 4. Konfiguration auf dem Server

**4.1 .env Datei erstellen:**
```bash
# Per SSH oder File Manager
nano .env
```

**Inhalt der .env Datei:**
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://DEIN_USERNAME:DEIN_PASSWORT@localhost:5432/eduplanix
SESSION_SECRET=dein-sehr-sicherer-session-schluessel-hier
```

**4.2 Abhängigkeiten installieren:**
```bash
npm install
```

**4.3 Build erstellen:**
```bash
npm run build
```

**4.4 Datenbank einrichten:**
```bash
npm run db:push
```

### 5. Anwendung starten

**Option A: Mit PM2 (empfohlen)**
```bash
npm install -g pm2
pm2 start dist/index.js --name eduplanix
pm2 startup
pm2 save
```

**Option B: Direkt starten**
```bash
npm start
```

### 6. Domain konfigurieren

**6.1 Apache .htaccess erstellen:**
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]
```

**6.2 SSL aktivieren:**
- Im Control Panel: "Domains" → "SSL/TLS"
- Let's Encrypt aktivieren

### 7. Erste Anmeldung

**Standard-Admin-Accounts:**
- Benutzername: `EliasSchnapp` / Passwort: `eliasadmin`
- Benutzername: `Admin` / Passwort: `Admin`

**Wichtig:** Passwörter nach der ersten Anmeldung ändern!

### 8. Monitoring

**Logs überprüfen:**
```bash
pm2 logs eduplanix
```

**Status prüfen:**
```bash
pm2 status
```

**Anwendung neustarten:**
```bash
pm2 restart eduplanix
```

### Häufige Probleme & Lösungen

**Problem:** "Port bereits belegt"
**Lösung:** Anderen Port in .env wählen (z.B. 3001)

**Problem:** "Datenbankverbindung fehlgeschlagen"
**Lösung:** DATABASE_URL in .env prüfen

**Problem:** "Build-Fehler"
**Lösung:** Node.js Version prüfen (mindestens 18)

**Problem:** "Dateiberechtigungen"
**Lösung:** `chmod 755` für Ordner, `chmod 644` für Dateien

### Support

**All-Inkl Support kontaktieren bei:**
- Server-spezifischen Problemen
- Node.js Konfiguration
- Datenbank-Setup

**Anwendungs-spezifische Fragen:**
- Siehe `replit.md` für technische Details
- Oder melde dich bei mir zurück!

---

## Schnell-Checkliste für den Upload:

- [ ] Node.js im Control Panel aktiviert
- [ ] PostgreSQL Datenbank erstellt
- [ ] Alle Projektdateien hochgeladen (außer node_modules)
- [ ] .env Datei erstellt und konfiguriert
- [ ] `npm install` ausgeführt
- [ ] `npm run build` ausgeführt
- [ ] `npm run db:push` ausgeführt
- [ ] Anwendung mit PM2 gestartet
- [ ] .htaccess konfiguriert
- [ ] SSL aktiviert
- [ ] Erste Anmeldung erfolgreich

Viel Erfolg beim Deployment! 🚀