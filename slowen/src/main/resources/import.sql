//
// Definition der Basiskonten
//
insert into konto (dtype, art, name, saldo) values ('Konto', 'Aufwand', 'Ordergebühr', 0);
insert into konto (dtype, art, name, saldo) values ('Konto', 'Aufwand', 'Kursverlust', 0);
insert into konto (dtype, art, name, saldo) values ('Konto', 'Ertrag', 'Kursgewinn', 0);

//
// Testkonten
//
insert into konto (dtype, art, name, saldo) values ('Konto', 'Kontokorrent', 'Giro', 0);
insert into konto (dtype, art, name, saldo) values ('Depot', 'Aktiv', 'Depot', 0);

//
// Testassets
//
insert into asset (name, wpk) values ('Commerzbank AG', '803200');
insert into asset (name, wpk) values ('Deutsche Telekom AG', '555550');
