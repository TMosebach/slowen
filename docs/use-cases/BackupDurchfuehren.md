# Backup durchführen

## Beschreibung

Der Anwender führt eine vollständige Datensicherung durch, um den gesamten Datenbankinhalt in einer Datei auf dem lokalen Dateisystem zu sichern.

## Beteiligte

* Anwender
* Slowen, das System

## Ablauf

1. Der Anwender wählt den Menüpunkt **"Backup"** in der Hauptnavigationsleiste.
2. Das System zeigt dem Anwender die Backupseite mit dem Button **"Neues Backup erstellen"** an.
3. Der Anwender klickt auf den Button **"Neues Backup erstellen"**.
4. Das System fordert den Anwender über einen Speicher-Dialog zur Auswahl des Zielverzeichnisses auf (mit dem vorgeschlagenen Dateinamen `Backup` gefolgt vom Zeitstempel und der Endung `.slowen`, z. B. `Backup_2026-09-28_14-30-00.slowen`).
5. Das System exportiert den vollständigen Datenbankinhalt im JSON-Format in die gewählte Datei.
6. Das System bestätigt dem Anwender die erfolgreiche Durchführung der Datensicherung mit einer Erfolgsmeldung und dem Pfad der erstellten Backup-Datei.

## Format und Datenstruktur

| Element | Beschreibung / Regel |
|---|---|
| Dateiname | `Backup_YYYY-MM-DD_HH-mm-ss.slowen` |
| Dateiformat | JSON |
| Inhalt | Vollständiger Export aller Datenbanktabellen (`accounts`, `bookings`, `booking_positions`, `depot_positions`, `securities`, `security_prices`, `sale_details`) sowie Metadaten (Version, Erstellungszeitpunkt) |

## UI-Hinweise

* Navigation: Neuer Menüeintrag "Backup" in der Sidebar.
* Backup-Seite:
  * Überschrift und kurze Erläuterung.
  * Primärer Button "Neues Backup erstellen".
  * Erfolgsbanner nach erfolgreicher Erstellung inkl. Ausweisung des Dateipfads.
