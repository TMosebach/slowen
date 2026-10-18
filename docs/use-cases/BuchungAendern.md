# Buchung ändern

# Beschreibung

Der Anwender ändert die Daten einer bestehenden Buchung ausgehend von der Kontodetailseite oder der Buchungsliste.

# Beteiligte:

* Anwender
* Slowen, das System

# Vorbedingung

Der Anwender hat entweder den Use Case „Kontodetails ansehen“ oder den Use Case „Buchungsliste anzeigen“ ausgeführt und befindet sich auf der jeweiligen Seite.

# Ablauf (Standardverlauf)

1. Der Anwender klickt bei einer Buchung auf das Ändern-Icon.
2. Das System öffnet das Buchung-Formular mit den Daten der Buchung (Vorgang, Datum, Beschreibung, Sender/Empfänger, Positionen, ggf. Kauf-/Verkaufsdetails).
3. Der Anwender ändert die Daten und klickt auf „Ändern“ (statt „Buchen“ beim Erfassen).
4. Das System prüft die Pflichtfelder gemäß „Buchung erfassen“; bei Fehlern zeigt es Meldungen und bleibt im Formular.
5. Das System speichert die geänderten Daten (abgeleitete Positionen bei Kauf/Verkauf werden neu berechnet) und kehrt zur Ausgangsseite zurück (Kontodetailseite bzw. Buchungsliste).

# Alternativer Verlauf

3a. Der Anwender klickt auf „Abbrechen“.
4a. Das System verwirft ggf. gemachte Änderungen und kehrt zur Ausgangsseite zurück (Kontodetailseite bzw. Buchungsliste).

# UI-Hinweise

- Das Ändern-Icon (Stift) ist sowohl in der Kontodetailseite als auch in der Buchungsliste für alle Vorgänge (Buchung, Kauf, Verkauf) verfügbar.
- Die Rückkehrseite wird über den Query-Parameter `returnTo` gesteuert:
    * Aus der Kontodetailseite: `returnTo=/accounts/<id>`.
    * Aus der Buchungsliste: Ohne Parameter, das Standard-Rücksprungziel ist `/bookings`.
    * Nur interne Pfade (beginnend mit `/`, keine Protokoll-relativen `//`) sind zulässig.
- Der Submit-Button heißt im Änderungsmodus „Ändern“.
