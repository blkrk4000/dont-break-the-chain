# Don't Break The Chain

Habit-Tracker nach der "Don't break the chain"-Methode: Jahreskalender pro Ziel, Dashboard über alle Ziele, Streaks. Alle Daten bleiben lokal im Browser.

**Live:** https://blkrk4000.github.io/dont-break-the-chain/

## Features

- Jahreskalender pro Ziel, Tag per Klick abhaken
- Dashboard mit allen aktiven Zielen
- Streak-Anzeige
- Ziele umbenennen, sortieren, archivieren
- Export/Import als JSON
- Themes: Standard, Gruvbox, E-Ink, dazu Dark Mode
- Installierbar als PWA (Offline-fähig)
- Tastatursteuerung

## Tastenkürzel

| Taste | Aktion |
|---|---|
| Tab | Fokus Sidebar / Kalender |
| ↑ / ↓ | Ziel wählen (Fokus Sidebar) |
| Leertaste | Heute abhaken |
| Enter | Fokus auf Hauptansicht |
| Esc | Zum Dashboard |
| Strg/Cmd + Shift + S | Sidebar ein-/ausblenden |

## Lokal starten

Voraussetzung: Node.js

```
npm install
npm run dev      # http://localhost:5200
```

Produktiv bauen und ausliefern:

```
npm run prod     # Build + Server auf Port 3001
```

## Lizenz

MIT, siehe [LICENSE](LICENSE).
