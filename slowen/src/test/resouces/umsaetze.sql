
insert into konto (id, konto_type, art, name, saldo) values (null, 'K', 'Kontokorrent', 'Giro', 1680.0);
insert into konto (id, konto_type, art, name, saldo) values (null, 'K', 'Aktiv', 'Tagesgeld', 200.0);
insert into konto (id, konto_type, art, name, saldo) values (null, 'K', 'Aufwand', 'Strom', 40.0);
insert into konto (id, konto_type, art, name, saldo) values (null, 'K', 'Aufwand', 'Gas', 80.0);
insert into konto (id, konto_type, art, name, saldo) values (null, 'K', 'Ertrag', 'Gehalt', -2000.0);

insert into buchung (id, empfaenger, verwendung) values (null, 'Moi', 'Sparen');
insert into konto_umsatz (id, umsatz_type, betrag, valuta, buchung_id, konto_id) values (null, 'K', -200.0, '2020-05-01', 1, 4);
insert into konto_umsatz (id, umsatz_type, betrag, valuta, buchung_id, konto_id) values (null, 'K', 200.0, '2020-05-01', 1, 5);

insert into buchung (id, empfaenger, verwendung) values (null, 'SWB', 'Nebenkosten');
insert into konto_umsatz (id, umsatz_type, betrag, valuta, buchung_id, konto_id) values (null, 'K', -120.0, '2020-06-01', 2, 4);
insert into konto_umsatz (id, umsatz_type, betrag, valuta, buchung_id, konto_id) values (null, 'K', 40.0, '2020-06-01', 2, 6);
insert into konto_umsatz (id, umsatz_type, betrag, valuta, buchung_id, konto_id) values (null, 'K', 80.0, '2020-06-01', 2, 7);

insert into buchung (id, empfaenger, verwendung) values (null, 'Moi', 'Einkommen');
insert into konto_umsatz (id, umsatz_type, betrag, valuta, buchung_id, konto_id) values (null, 'K', 2000.0, '2020-07-01', 3, 4);
insert into konto_umsatz (id, umsatz_type, betrag, valuta, buchung_id, konto_id) values (null, 'K', -2000.0, '2020-07-01', 3, 8);