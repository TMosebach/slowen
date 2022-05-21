drop table if exists asset CASCADE;
drop table if exists buchung CASCADE; 
drop table if exists konto CASCADE;
drop table if exists umsatz CASCADE; 
drop sequence if exists hibernate_sequence;

create sequence hibernate_sequence start with 1 increment by 1;

create table asset (
	id bigint not null, 
	name varchar(255), 
	primary key (id)
);
create table bestand (
	id bigint not null,
	betrag numeric(19,2),
	waehrung varchar(255),
	einheit varchar(255),
	menge numeric(19,2),
	asset_id bigint,
	konto_id bigint,
	primary key (id)
);
create table buchung (
	id bigint not null,
	art varchar(30) not null,
	beschreibung varchar(255),
	datum date, empfaenger varchar(255),
	primary key (id)
);
create table konto (
	id bigint not null,
	name varchar(255),
	betrag numeric(19,2),
	waehrung varchar(3),
	primary key (id)
);
create table umsatz (
	id bigint not null,
	betrag numeric(19,2),
	waehrung varchar(255),
	einheit varchar(255),
	menge numeric(19,2),
	valuta date, asset_id bigint,
	buchung_id bigint,
	konto_id bigint,
	primary key (id)
);
alter table konto add constraint eindeutiger_konto_name unique (name);
alter table bestand add constraint FK_Bestand_Asset foreign key (asset_id) references asset;
alter table bestand add constraint FK_Bestand_Konto foreign key (konto_id) references konto;
alter table umsatz add constraint FK_Umsatz_Asset foreign key (asset_id) references asset;
alter table umsatz add constraint FK_Umsatz_Buchung foreign key (buchung_id) references buchung;
alter table umsatz add constraint FK_Umsatz_Konto foreign key (konto_id) references konto;