# Kontodetails ansehen

# Beschreibung

Der Anwender öffnet die Detailansicht eines Kontos, um dessen Stammdaten, den aktuellen Saldo sowie alle zugehörigen Buchungen und Positionen einzusehen.

# Beteiligte:

* Anwender
* Slowen, das System

# Ablauf

1. Der Anwender wählt die Konten-Übersicht in der Navigation.
2. Das System zeigt die Liste aller Konten an.
3. Der Anwender klickt auf den Namen eines Kontos.
4. Das System öffnet die Detailansicht des Kontos und zeigt an:
    * Name des Kontos
    * Typ und Subtyp (sowie ggf. IBAN und Notizen)
    * Aktueller Saldo (Summe der Beträge aller Buchungspositionen dieses Kontos)
    * Liste aller Buchungen, die mindestens eine Position zu diesem Konto enthalten (absteigend sortiert nach Buchungsdatum).
5. Die Buchungsliste stellt pro Buchung folgende Angaben dar:
    * Buchungsdatum
    * Vorgang (z. B. Buchung, Kauf, Verkauf)
    * Beschreibung
    * Sender / Empfänger
    * **Bei genau zwei Positionen in der Buchung:**
        * Konto der Gegenposition
        * Valuta der Position dieses Kontos
        * Betrag der Position dieses Kontos
    * **Bei mehr als zwei Positionen in der Buchung:**
        * Jeweils untereinander aufgeführt: Konto, Valuta und Betrag aller Positionen der Buchung
    * **Bei genau einer Position in der Buchung:**
        * Valuta und Betrag der Position (Gegenkonto entfällt bzw. "-")

# UI-Hinweise

- In der Kontoliste ist der Kontoname als anklickbarer Link dargestellt.
- In der Kontodetailansicht ermöglicht ein Button "Zurück zur Kontoliste" die Rückkehr zur Übersicht.
- Der Saldo wird mit Vorzeichen und Nachkommastellen formatiert dargestellt.
