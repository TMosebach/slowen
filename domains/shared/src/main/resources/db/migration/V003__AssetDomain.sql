drop table AST_ASSET if exists;
create table AST_ASSET (
	id VARCHAR(36) NOT NULL,
	name VARCHAR(50) NOT NULL,
	isin VARCHAR(12) NOT NULL,
	wpk VARCHAR(6) NOT NULL
);