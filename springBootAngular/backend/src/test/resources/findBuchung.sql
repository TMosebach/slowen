delete from BHT_UMSATZ;
delete from BHT_BUCHUNG;

insert into BHT_BUCHUNG (id, art, datum, verwendung) values ('1', 'Buchung', '2022-01-09', 'pattern' );
insert into BHT_UMSATZ ( buchung_id, konto_id, valuta, betrag, waehrung) values ( '1', 'giro', '2022-01-10', 100, 'EUR');
insert into BHT_UMSATZ ( buchung_id, konto_id, valuta, betrag, waehrung) values ( '1', 'gegenkonto', '2022-01-10', -100, 'EUR' );

insert into BHT_BUCHUNG (id, art, datum, empfaenger) values ('2', 'Buchung', '2022-02-09', 'XpatternX'  );
insert into BHT_UMSATZ ( buchung_id, konto_id, valuta, betrag, waehrung) values ( '2', 'giro', '2022-02-10', 100, 'EUR');
insert into BHT_UMSATZ ( buchung_id, konto_id, valuta, betrag, waehrung) values ( '2', 'gegenkonto', '2022-02-10', -100, 'EUR' );

insert into BHT_BUCHUNG (id, art, datum, empfaenger, verwendung) values ('3', 'Buchung', '2022-03-11', 'XpaTTErn', 'patternX' );
insert into BHT_UMSATZ ( buchung_id, konto_id, valuta, betrag, waehrung) values ( '3', 'konto', '2022-04-10', 100, 'EUR');
insert into BHT_UMSATZ ( buchung_id, konto_id, valuta, betrag, waehrung) values ( '3', 'giro', '2022-04-10', -100, 'EUR' );

insert into BHT_BUCHUNG (id, art, datum) values ('4', 'Buchung', '2022-04-11' );
insert into BHT_UMSATZ ( buchung_id, konto_id, valuta, betrag, waehrung) values ( '4', 'konto', '2022-03-10', 100, 'EUR');
insert into BHT_UMSATZ ( buchung_id, konto_id, valuta, betrag, waehrung) values ( '4', 'giro', '2022-03-10', -100, 'EUR' );
