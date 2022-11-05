drop table KTO_KONTO if exists;
create table KTO_KONTO (
	id VARCHAR(36) NOT NULL,
	name VARCHAR(50) NOT NULL,
	konto_type VARCHAR(30) NOT NULL,
	bilanz_Typ VARCHAR(20) NOT NULL,
	saldo DECIMAL(8,2) NOT NULL,
	waehrung VARCHAR(3) NOT NULL
);

drop table KTO_BESTAND if exists;
create table KTO_BESTAND (
	konto_id VARCHAR(36) NOT NULL,
	asset_id VARCHAR(36) NOT NULL,
	menge DECIMAL(8,5) NOT NULL,
	kauf_wert DECIMAL(8,2) NOT NULL,
	waehrung VARCHAR(3) NOT NULL
);
