insert into konto (konto_type, id , art, name, saldo) values ('K', null, 'Ertrag', 'Zinsertrag', 10.0);
insert into konto (konto_type, id , art, name, saldo) values ('K', null, 'Aufwand', 'Zinsaufwand', 20.0);
insert into konto (konto_type, id , art, name, saldo) values ('K', null, 'Aufwand', 'Bankgebühren', 30.0);

insert into konto (konto_type, id , art, name, saldo) values ('K', null, 'Kontokorrent', 'Giro', 0.0);
insert into konto (konto_type, id , art, name, saldo) values ('D', null, 'Aktiv', 'Depot', 0.0);

insert into asset (isin, name, wkn) values ('DE00080320004', 'Commerzbank AG', '803200');
insert into asset (isin, name, wkn) values ('DE00055550004', 'Dt. Telekom', '555500');

insert into bestand (kauf_preis, stuecke, asset_id, depot_id) values (8.45, 120, 1, 5);

