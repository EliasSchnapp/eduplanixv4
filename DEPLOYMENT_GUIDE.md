# EDUPLANIX Deployment Guide - All-Inkl Premium Server

## Voraussetzungen
- All-Inkl Premium Server mit Node.js Support
- PostgreSQL Datenbank bei All-Inkl
- SSH-Zugang zu deinem Server
- Domain/Subdomain konfiguriert

## Schritt 1: Projekt vorbereiten

### 1.1 Production Build erstellen
```bash
# Frontend build
npm run build

# Backend build
npm run build:server
```

### 1.2 Wichtige Dateien für Upload
```
/dist/           # Frontend build
/server/         # Backend source
/shared/         # Shared schemas
package.json
package-lock.json
drizzle.config.ts
```

## Schritt 2: All-Inkl Server Setup

### 2.1 Node.js Version prüfen
```bash
node --version
npm --version
```

### 2.2 Projektordner erstellen
```bash
mkdir eduplanix
cd eduplanix
```

### 2.3 Dateien hochladen
Via FTP/SFTP oder SSH:
- Alle Projektdateien außer node_modules
- .env Datei mit Produktionseinstellungen

## Schritt 3: Umgebungsvariablen konfigurieren

### 3.1 .env Datei erstellen
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://username:password@localhost:5432/eduplanix
SESSION_SECRET=your-super-secret-session-key-here
```

### 3.2 PostgreSQL Datenbank einrichten
```sql
-- Bei All-Inkl über phpPgAdmin oder Kommandozeile
CREATE DATABASE eduplanix;
CREATE USER eduplanix_user WITH PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE eduplanix TO eduplanix_user;
```

## Schritt 4: Abhängigkeiten installieren

```bash
npm install --production
npm install -g pm2  # Für Prozessmanagement
```

## Schritt 5: Datenbank migrieren

```bash
npm run db:push
```

## Schritt 6: Anwendung starten

### 6.1 Mit PM2 (empfohlen)
```bash
pm2 start dist/index.js --name eduplanix
pm2 startup
pm2 save
```

### 6.2 Direkt starten
```bash
node dist/index.js
```

## Schritt 7: Webserver konfigurieren

### Apache .htaccess (falls Apache verwendet)
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]
```

### Nginx Konfiguration (falls Nginx verwendet)
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Schritt 8: SSL/HTTPS einrichten

Bei All-Inkl über das Control Panel:
1. SSL-Zertifikat aktivieren
2. HTTPS-Weiterleitung einrichten

## Schritt 9: Monitoring und Wartung

### Logs überprüfen
```bash
pm2 logs eduplanix
```

### Anwendung neustarten
```bash
pm2 restart eduplanix
```

### Status prüfen
```bash
pm2 status
```

## Troubleshooting

### Häufige Probleme:
1. **Port bereits belegt**: Anderen Port in .env wählen
2. **Datenbankverbindung**: DATABASE_URL prüfen
3. **Dateiberechtigungen**: `chmod 755` für Ordner, `chmod 644` für Dateien
4. **Node.js Version**: Mindestens Node.js 18 erforderlich

### Logs überprüfen:
```bash
tail -f /var/log/nodejs/eduplanix.log
```

## Backup-Strategie

### Datenbank-Backup
```bash
pg_dump eduplanix > backup_$(date +%Y%m%d).sql
```

### Dateien-Backup
```bash
tar -czf eduplanix_backup_$(date +%Y%m%d).tar.gz eduplanix/
```

## Updates durchführen

1. Neuen Code hochladen
2. Dependencies aktualisieren: `npm install`
3. Build erstellen: `npm run build`
4. Datenbank migrieren: `npm run db:push`
5. Anwendung neustarten: `pm2 restart eduplanix`

## Kontakt bei Problemen

- All-Inkl Support für Server-spezifische Fragen
- Dokumentation der Anwendung in replit.md