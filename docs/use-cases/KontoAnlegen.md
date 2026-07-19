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
        * Typ: GuV { Kredidkarte }
    * IBAN, optional, nur bei Typ: Bestand, Subtyp { Giro, Tagesgeld, Depot }
    * Notizen
5. der Anwender füllt die Felder aus.
6. das System validiert die Felder und speichert sie gültigen Angaben in der Datenbank
7. das System zeigt die Konto-Liste an.

