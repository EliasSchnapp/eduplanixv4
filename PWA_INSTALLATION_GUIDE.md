# EduPlanix PWA Installation Guide

## Was ist eine Progressive Web App (PWA)?

Eine Progressive Web App ist eine Webanwendung, die wie eine native App auf deinem Gerät funktioniert. Du kannst sie auf deinem Homebildschirm installieren und sie wird sich wie eine echte App verhalten.

## Installation auf iPad/iPhone

### Schritt 1: Website öffnen
1. Öffne Safari auf deinem iPad oder iPhone
2. Gehe zu deiner EduPlanix-Website

### Schritt 2: Zur Home-Bildschirm hinzufügen
1. Tippe auf das **Teilen-Symbol** (Quadrat mit Pfeil nach oben) in der Safari-Menüleiste
2. Scrolle nach unten und tippe auf **"Zum Home-Bildschirm"**
3. Der Name "EduPlanix" sollte automatisch angezeigt werden
4. Tippe auf **"Hinzufügen"**

### Schritt 3: App verwenden
- Das EduPlanix-Icon erscheint jetzt auf deinem Home-Bildschirm
- Tippe darauf, um die App zu öffnen
- Sie wird im Vollbild-Modus ohne Safari-Bedienelemente geöffnet
- Funktioniert wie eine native App

## Installation auf Android

### Schritt 1: Website öffnen
1. Öffne Chrome auf deinem Android-Gerät
2. Gehe zu deiner EduPlanix-Website

### Schritt 2: Installation
1. Tippe auf das **Menü** (drei Punkte) in Chrome
2. Wähle **"App installieren"** oder **"Zum Startbildschirm hinzufügen"**
3. Bestätige mit **"Installieren"**

## Funktionen der PWA

### ✅ Offline-Funktionalität
- Grundlegende Funktionen arbeiten auch ohne Internet
- Daten werden lokal zwischengespeichert

### ✅ App-ähnliches Verhalten
- Startet im Vollbild-Modus
- Keine Browser-Bedienelemente
- Eigenes Icon auf dem Home-Bildschirm

### ✅ Native Integration
- Erscheint in der App-Liste
- Kann wie jede andere App geöffnet werden
- Benachrichtigungen möglich (wenn implementiert)

### ✅ Automatische Updates
- Aktualisiert sich automatisch bei Website-Änderungen
- Keine manuelle App-Store-Installation nötig

## Technische Details

### Manifest-Datei
```json
{
  "name": "EduPlanix",
  "short_name": "EduPlanix",
  "description": "Comprehensive student productivity platform",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0f172a",
  "theme_color": "#67e8f9"
}
```

### Service Worker
- Ermöglicht Offline-Funktionalität
- Caching von wichtigen Dateien
- Automatische Updates

### Icons
- 512x512px für hochauflösende Displays
- 192x192px für Standard-Displays
- 180x180px für Apple Touch Icon
- Alle im PNG-Format mit transparentem Hintergrund

## Fehlerbehebung

### Icon wird nicht angezeigt
- Stelle sicher, dass alle Icon-Dateien im `/public`-Ordner sind
- Überprüfe die Manifest-Datei auf korrekte Pfade

### "Zum Home-Bildschirm hinzufügen" nicht verfügbar
- Verwende Safari auf iOS oder Chrome auf Android
- Stelle sicher, dass das Web App Manifest korrekt geladen wird

### App startet nicht im Vollbild-Modus
- Überprüfe die `display: "standalone"`-Einstellung im Manifest
- Stelle sicher, dass alle PWA-Meta-Tags vorhanden sind

## Deinstallation

### iOS
1. Halte das EduPlanix-Icon gedrückt
2. Wähle "App entfernen"
3. Bestätige mit "Löschen"

### Android
1. Halte das EduPlanix-Icon gedrückt
2. Ziehe es auf "Deinstallieren" oder "Entfernen"
3. Bestätige die Aktion

## Weitere Informationen

Die PWA-Funktionalität ist vollständig implementiert und getestet. Bei Problemen überprüfe:
- Browser-Kompatibilität (Safari für iOS, Chrome für Android)
- HTTPS-Verbindung (für Service Worker erforderlich)
- Manifest-Datei wird korrekt geladen
- Service Worker ist registriert

Für weitere technische Details siehe die Entwicklerdokumentation oder öffne die Browser-Entwicklertools → Application → Manifest/Service Workers.