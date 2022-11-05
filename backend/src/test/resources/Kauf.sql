insert into kto_konto (id, name, konto_type, bilanz_Typ, saldo, waehrung) values ('02e1e286-b100-4e50-9d20-0f8d27cf0b46', 'Giro', 'Konto', 'Bestand', 0, 'EUR');
insert into kto_konto (id, name, konto_type, bilanz_Typ, saldo, waehrung) values ('80ea8975-8456-4a56-b766-eab79c907cdf', 'Depot', 'Depot', 'Bestand', 0, 'EUR');
insert into kto_konto (id, name, konto_type, bilanz_Typ, saldo, waehrung) values ('2b100c5a-a035-4ae1-b0f9-0528d896681a', 'Provision', 'Konto', 'GuV', 0, 'EUR');


/* JSON für Kauf

{
  "buchungsDatum": "2022-08-06",
  "verwendung": "kaufen",
  "empfaenger": "ich",
  "asset": "aktie286-b100-4e50-9d20-0f8d27cf0b46",
  "depot": "80ea8975-8456-4a56-b766-eab79c907cdf",
  "menge": 100,
  "kurs": 8,
  "verrechnungskonto": "02e1e286-b100-4e50-9d20-0f8d27cf0b46",
  "gebuehren": [
    {
      "konto": "2b100c5a-a035-4ae1-b0f9-0528d896681a",
      "betrag": 20,
      "waehrung": "EUR"
    }
  ]
}
*/