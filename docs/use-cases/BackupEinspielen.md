# Backup einspielen

## Beschreibung

Der Anwender stellt den gesamten Datenbankinhalt aus einer zuvor erstellten Datensicherungsdatei (`.slowen`) wieder her.

## Beteiligte

* Anwender
* Slowen, das System

## Ablauf

1. Der Anwender wählt den Menüpunkt **"Backup"** in der Hauptnavigationsleiste.
2. Das System zeigt dem Anwender die Backupseite an, auf der sich neben der Erstellung auch der Bereich **"Backup einspielen"** mit dem Button **"Backup auswählen und einspielen"** befindet.
3. Der Anwender klickt auf den Button **"Backup auswählen und einspielen"**.
4. Das System öffnet den Datei-Auswahldialog gefiltert nach `.slowen`-Dateien.
5. Der Anwender wählt eine `.slowen`-Backup-Datei aus.
6. Das System liest die Datei ein und validiert die JSON-Struktur sowie die Vollständigkeit der enthaltenen Tabellen.
7. Das System zeigt eine Sicherheitsabfrage (Bestätigungs-Dialog) an mit dem Hinweis, dass alle bestehenden Daten überschrieben werden.
8. Der Anwender bestätigt den Vorgang.
9. Das System ersetzt in einer Datenbank-Transaktion den aktuellen Datenbestand durch die Inhalte aus der Backup-Datei.
10. Das System bestätigt die erfolgreiche Wiederherstellung mit einer Erfolgsmeldung und aktualisiert den Anwendungszustand.

## Validierungs- und Sicherheitsregeln

| Regel | Beschreibung |
|---|---|
| Dateiformat | Nur `.slowen`-Dateien im validen JSON-Format |
| Schema-Prüfung | Die Backup-Datei muss gültige Metadaten (`version`, `tables`) und alle erforderlichen Datenbanktabellen enthalten |
| Sicherheitsabfrage | Verpflichtende Bestätigung durch den Anwender vor dem Überschreiben der aktuellen Daten |
| Transaktionssicherheit | Wiederherstellung in einer isolierten Transaktion; bei Fehlern erfolgt ein automatisches `ROLLBACK` |

## UI-Hinweise

* **Backup-Seite:**
  * Trennung in zwei Karten/Abschnitte: **"Datensicherung erstellen"** und **"Datensicherung wiederherstellen"**.
  * Warnhinweis bezüglich des Überschreibens vorhandener Daten im Einspielen-Bereich.
  * Bestätigungs-Modal/Dialog vor dem eigentlichen Einspielen.
