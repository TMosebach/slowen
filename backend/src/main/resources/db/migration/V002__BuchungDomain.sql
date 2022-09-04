drop table BHT_BUCHUNG if exists;
create table BHT_BUCHUNG (
	id VARCHAR(36) NOT NULL,
	datum DATE NOT NULL,
	verwendung VARCHAR(50),
	empfaenger VARCHAR(50)
);

drop table BHT_UMSATZ if exists;
create table BHT_UMSATZ (
	buchung_id VARCHAR(36) NOT NULL,
	konto_id VARCHAR(36) NOT NULL,
	valuta DATE NOT NULL,
	betrag DECIMAL(8,2) NOT NULL,
	waehrung VARCHAR(3) NOT NULL,
	asset VARCHAR(36),
	menge DECIMAL(8,5)
);