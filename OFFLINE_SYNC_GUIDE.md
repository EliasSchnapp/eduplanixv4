# EduPlanix Offline-Synchronisation Guide

## Funktionsweise

### ✅ Was funktioniert offline:
- **Hausaufgaben hinzufügen**: Alle Hausaufgaben werden lokal gespeichert
- **Noten eintragen**: Noten werden offline zwischengespeichert
- **Termine erstellen**: Events werden lokal vorgemerkt
- **Bestehende Daten anzeigen**: Bereits geladene Daten bleiben verfügbar

### 🔄 Automatische Synchronisation:
- **Beim Online-Kommen**: Alle offline-Daten werden automatisch hochgeladen
- **Benachrichtigungen**: Du erhältst Meldungen über erfolgreiche Synchronisation
- **Status-Anzeige**: Offline-Status und wartende Synchronisation werden angezeigt

## Benutzerführung

### Offline-Indikator
- **🟢 Online**: Normale Funktionalität
- **🔴 Offline**: Eingeschränkte Funktionalität
- **🟡 Wartend**: Daten warten auf Synchronisation

### Toast-Nachrichten
- **"Offline gespeichert"**: Daten wurden lokal gespeichert
- **"Offline-Daten wurden synchronisiert"**: Erfolgreiche Übertragung
- **"Erfolgreich gespeichert"**: Direkte Online-Übertragung

## Technische Implementierung

### Service Worker
```javascript
// Abfängt API-Requests
// Offline-Speicherung in IndexedDB
// Automatische Synchronisation beim Online-Kommen
```

### IndexedDB Struktur
```javascript
// Datenbank: EduPlanixOffline
// Tabelle: offline_requests
// Tabelle: cached_data
```

### Offline-Mutation Hook
```typescript
// useOfflineMutation für automatische Offline-Behandlung
// Toast-Benachrichtigungen
// Query-Invalidierung nach Sync
```

## Datensicherheit

### Lokale Speicherung
- Daten werden verschlüsselt im Browser gespeichert
- Automatische Löschung nach erfolgreicher Synchronisation
- Keine sensiblen Daten werden dauerhaft lokal gespeichert

### Synchronisation
- Automatische Wiederholung bei Fehlern
- Konflikterkennung und -lösung
- Integrität der Daten wird gewährleistet

## Benutzerszenarien

### Szenario 1: Zug fahren
1. Offline gehen während der Fahrt
2. Hausaufgaben und Noten eintragen
3. Automatische Synchronisation bei WLAN-Verbindung

### Szenario 2: Schule ohne Internet
1. App über PWA öffnen
2. Offline arbeiten
3. Synchronisation zu Hause

### Szenario 3: Schwache Verbindung
1. Daten werden lokal gespeichert
2. Automatische Wiederholung bei besserer Verbindung
3. Nahtlose Benutzererfahrung

## Fehlerbehebung

### Synchronisation funktioniert nicht
- Überprüfe Internetverbindung
- Lade Seite neu
- Verwende manuellen Sync-Button

### Daten fehlen nach Synchronisation
- Überprüfe Browser-Konsole
- Melde Fehler an Administrator
- Daten sind in lokaler Datenbank gesichert

### Offline-Modus wird nicht erkannt
- Überprüfe Service Worker-Registrierung
- Aktualisiere Browser-Cache
- Teste mit Entwicklertools

## Technische Limits

### Speicherplatz
- Browser-Limit: ~50MB für IndexedDB
- Automatische Bereinigung nach Sync
- Warnung bei Speicherplatz-Mangel

### Synchronisation
- Maximale Retry-Versuche: 3
- Timeout pro Request: 30 Sekunden
- Batch-Verarbeitung für große Datenmengen

## Monitoring

### Offline-Indikator
- Zeigt aktuellen Status an
- Anzahl wartender Synchronisationen
- Letzte erfolgreiche Synchronisation

### Entwickler-Tools
- IndexedDB-Inspektion
- Service Worker-Logs
- Netzwerk-Monitoring

Die Offline-Funktionalität ist vollständig implementiert und bietet eine nahtlose Benutzererfahrung auch ohne Internetverbindung!