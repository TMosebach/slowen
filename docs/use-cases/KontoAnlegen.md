# Konto anlegen

# Beschreibung

Der Anwender legt Konten an, um die Bestandsgrößen der Finanzverwaltung zu kategorisieren.

# Beteiligte:

* Anwender
* Slowen, das System

# Ablauf

1. der Anwender wählt den Konto-Eintrag im Hauptmenü
2. das System zeigt die Konto-Liste an
3. der Anwender klickt auf "neues Konto"
4. das System zeigt das Konto-Formular an mit
    * Namen, Pflichtfeld
    * Typ { Bestand, GuV }, Pflichtfeld
    * Subtyp, abhängig von Typ, Pflichtfeld
        * Typ: Bestand { Giro, Tagesgeld, Depot, Immobilie, Versicherung, Forderung, Verbindlichkeit },
        * Typ: GuV { Kreditkarte }
    * IBAN, optional, nur bei Typ: Bestand, Subtyp { Giro, Tagesgeld, Depot }
    * Notizen
5. der Anwender füllt die Felder aus.
6. das System validiert die Felder und speichert die gültigen Angaben in der Datenbank
7. das System zeigt eine Erfolgsmeldung an und die Konto-Liste.

## Validierungsregeln

| Feld | Regel |
|------|-------|
| Name | Pflichtfeld, Mindestlänge 3 Zeichen |
| Typ | Pflichtfeld, Enum: Bestand, GuV |
| Subtyp | Pflichtfeld, abhängig von Typ (siehe unten) |
| IBAN | Optional, nur bei Typ: Bestand + Subtyp: Giro/Tagesgeld/Depot |
| Notizen | Optional |

### Subtyp-Definitionen

**Bestand:** Giro, Tagesgeld, Depot, Immobilie, Versicherung, Forderung, Verbindlichkeit

**GuV:** Kreditkarte

## UI-Hinweise

- Typ: Dropdown mit Enum-Werten
- Subtyp: Dynamisches Dropdown abhängig von Typ-Auswahl

