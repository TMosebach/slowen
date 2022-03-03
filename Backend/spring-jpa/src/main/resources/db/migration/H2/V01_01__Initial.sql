create sequence hibernate_sequence start with 1 increment by 1;

create table asset (
	name varchar(255) not null,
	primary key (name)
);

create table buchung (
	id bigint not null,
	art varchar(255) not null,
	beschreibung varchar(255),
	datum date,
	empfaenger varchar(255),
	primary key (id)
);

create table konto (
	name varchar(255) not null,
	betrag decimal(19,2),
	waehrung varchar(255),
	primary key (name)
);

create table umsatz (
	id bigint not null,
	asset varchar(255),
	betrag decimal(19,2),
	waehrung varchar(255),
	konto varchar(255),
	einheit varchar(255),
	menge decimal(19,2),
	valuta date,
	buchung_id bigint,
	primary key (id)
);

alter table umsatz add constraint FKfvry26xcu5hfcm21lrbl0uny6 foreign key (buchung_id) references buchung;