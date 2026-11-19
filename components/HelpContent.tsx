import React from 'react';
import {
  PanelLeft, LayoutGrid, Calendar as CalendarIcon, ChevronLeft, ChevronRight, MoreVertical,
  Settings, BarChart2, Palette, Info, CircleHelp, Check, Flame, Archive, ArchiveRestore,
  Trash2, GripVertical, Edit2, MousePointer
} from 'lucide-react';

type Row = { icon: React.ReactNode; label: string; text: string };

const ic = 'text-emerald-500';

const SECTIONS: { title: string; rows: Row[] }[] = [
  {
    title: 'Obere Leiste (bei einem Ziel)',
    rows: [
      { icon: <PanelLeft size={16} className={ic} />, label: 'Seitenleiste', text: 'Ein-/ausblenden (Strg/Cmd + Shift + S).' },
      { icon: <LayoutGrid size={16} className={ic} />, label: 'Jahresansicht', text: 'Alle 12 Monate des Jahres auf einmal.' },
      { icon: <CalendarIcon size={16} className={ic} />, label: 'Monatsansicht', text: 'Ein Monat groß dargestellt.' },
      { icon: <><ChevronLeft size={16} className={ic} /><ChevronRight size={16} className={ic} /></>, label: 'Pfeile', text: 'Ein Jahr bzw. einen Monat zurück oder vor.' },
      { icon: <MoreVertical size={16} className={ic} />, label: 'Menü', text: 'Ziel archivieren, wiederherstellen oder löschen.' },
    ],
  },
  {
    title: 'Untere Leiste der Seitenleiste',
    rows: [
      { icon: <Settings size={16} className={ic} />, label: 'Einstellungen', text: 'Backup speichern und laden (JSON-Datei).' },
      { icon: <BarChart2 size={16} className={ic} />, label: 'Statistik', text: 'Streak, Jahresquote und Gesamtzahl des gewählten Ziels.' },
      { icon: <Palette size={16} className={ic} />, label: 'Design', text: 'Standard, Gruvbox oder E-Ink, dazu der Dunkelmodus.' },
      { icon: <Info size={16} className={ic} />, label: 'Info', text: 'Die Methode, Version und Lizenz.' },
      { icon: <CircleHelp size={16} className={ic} />, label: 'Hilfe', text: 'Diese Seite.' },
    ],
  },
  {
    title: 'Seitenleiste: Zielliste',
    rows: [
      { icon: <LayoutGrid size={16} className={ic} />, label: 'Dashboard', text: 'Übersicht aller aktiven Ziele (auch mit Esc).' },
      { icon: <span className="text-[10px] font-bold text-emerald-500">A/A</span>, label: 'Aktiv / Archiv', text: 'Archivierte Ziele sind pausiert, ihre Daten bleiben erhalten.' },
      { icon: <span className="text-sm leading-none">🙂🔥🏆</span>, label: 'Smiley', text: '1 Tag 🙂, 2–3 😄, 4–6 😍, 7–14 🔥, 15–30 🚀, über 30 🏆. Grau: kein Streak.' },
      { icon: <Check size={16} className={ic} />, label: 'Grüner Haken', text: 'Das Ziel ist heute schon erledigt.' },
      { icon: <Edit2 size={16} className={ic} />, label: 'Stift', text: 'Umbenennen (geht auch per Doppelklick auf den Namen).' },
      { icon: <><Archive size={16} className={ic} /><ArchiveRestore size={16} className={ic} /></>, label: 'Archiv-Symbole', text: 'Ziel pausieren bzw. wiederherstellen.' },
      { icon: <Trash2 size={16} className={ic} />, label: 'Papierkorb', text: 'Endgültig löschen, nur im Archiv möglich.' },
      { icon: <GripVertical size={16} className={ic} />, label: 'Punkte', text: 'Ziel ziehen, um die Reihenfolge zu ändern.' },
    ],
  },
  {
    title: 'Dashboard-Karten',
    rows: [
      { icon: <Check size={16} className={ic} />, label: 'Haken-Button', text: 'Heute abhaken oder wieder zurücknehmen.' },
      { icon: <Flame size={16} className="text-orange-500" />, label: 'Streak', text: 'Erledigte Tage in Folge, wenn heute oder gestern erledigt ist. Sonst 0.' },
      { icon: <span className="text-[10px] font-bold text-emerald-500">%</span>, label: 'Jahresquote', text: 'Erledigte Tage dieses Jahres, geteilt durch die Tage seit dem 1. Januar.' },
      { icon: <span className="text-sm leading-none">▪▪▪</span>, label: 'Letzte 3 Monate', text: 'Ein Kästchen pro Tag. Farbig: erledigt. Mit Rahmen: heute.' },
      { icon: <MoreVertical size={16} className={ic} />, label: 'Menü', text: 'Archivieren oder löschen. Ein Klick auf den Namen öffnet den Kalender.' },
    ],
  },
  {
    title: 'Kalender',
    rows: [
      { icon: <MousePointer size={16} className={ic} />, label: 'Tag anklicken', text: 'Als erledigt markieren oder wieder entfernen.' },
      { icon: <span className="text-sm leading-none">▬</span>, label: 'Verbindungslinie', text: 'Aufeinanderfolgende Tage innerhalb eines Monats: die Kette.' },
      { icon: <span className="text-sm leading-none">◯</span>, label: 'Ring', text: 'Heute. Blasse Tage in der Zukunft sind nicht anklickbar.' },
    ],
  },
];

const KEYS: [string, string][] = [
  ['Tab', 'Zwischen Seitenleiste und Hauptansicht wechseln'],
  ['↑ / ↓', 'Ziel wechseln (Seitenleiste aktiv)'],
  ['Pfeiltasten', 'Im Kalender oder auf dem Dashboard navigieren'],
  ['Leertaste', 'Heute bzw. gewählten Tag umschalten'],
  ['Enter', 'Ziel öffnen (Dashboard) oder zur Hauptansicht'],
  ['Esc', 'Zurück zum Dashboard'],
  ['Strg/Cmd + Shift + S', 'Seitenleiste umschalten'],
];

export const HelpContent: React.FC = () => (
  <div className="space-y-6">
    {SECTIONS.map(section => (
      <div key={section.title} className="space-y-2">
        <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">{section.title}</h3>
        <div className="space-y-2">
          {section.rows.map(row => (
            <div key={row.label} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
              <div className="w-10 flex-shrink-0 flex items-center justify-center gap-0.5 mt-0.5">{row.icon}</div>
              <span><strong className="font-semibold text-slate-900 dark:text-white">{row.label}:</strong> {row.text}</span>
            </div>
          ))}
        </div>
      </div>
    ))}

    <div className="space-y-2">
      <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Tastatur</h3>
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 space-y-2">
        {KEYS.map(([key, text]) => (
          <div key={key} className="flex justify-between items-center gap-3 text-sm">
            <span className="text-slate-600 dark:text-slate-400">{text}</span>
            <kbd className="px-2 py-1 bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 text-xs font-mono whitespace-nowrap">{key}</kbd>
          </div>
        ))}
      </div>
    </div>

    <div className="space-y-2">
      <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Daten</h3>
      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
        Alles wird nur im Browser dieses Geräts gespeichert. Es gibt kein Konto und keine Synchronisation.
        Für ein anderes Gerät: in den Einstellungen "Backup speichern" und dort "Backup laden".
        Das Laden überschreibt alle vorhandenen Ziele.
      </p>
    </div>
  </div>
);
