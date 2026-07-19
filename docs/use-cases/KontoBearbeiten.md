**Konto bearbeiten**

# Beschreibung

Der Anwender ändert die Daten eines Kontos.

# Beteiligte:

* Anwender
* Slowen, das System

# Ablauf

1. der Anwender wählt die Konto-Liste in der
2. das System zeigt die Konto-Liste an
3. der Anwender klickt auf "Bearbeiten" zu dem Konto, dass er bearbeiten möchte.
4. das System zeigt das Konto-Formular mit den aktuellen Daten an.
5. der Anwender ändert die gewünschten Felder.
6. das System validiert die Felder und speichert die gültigen Angaben in der Datenbank
7. das System zeigt die Konto-Liste - soweit sichtbar - mit den geänderten Daten an.

### Fehlerbehandlung

- Bei Validierungsfehlern bleibt das Formular geöffnet und zeigt eine Fehlermeldung an
- Die eingegebenen Daten bleiben erhalten

## Validierungsregeln

Unverändert zu Konto anlegen.

## Hinweise

- Alle Felder inkl. Typ sind nach dem Anlegen weiterhin änderbar
