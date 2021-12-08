-- DROP SCHEMA "IntelTools";

CREATE SCHEMA "IntelTools" AUTHORIZATION postgres;

-- DROP SEQUENCE "IntelTools".mispwarn_id_seq1;

CREATE SEQUENCE "IntelTools".mispwarn_id_seq1
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE "IntelTools".mispwarn_list_id_seq;

CREATE SEQUENCE "IntelTools".mispwarn_list_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;-- "IntelTools".mispwarn definition

-- Drop table

-- DROP TABLE "IntelTools".mispwarn;

CREATE TABLE "IntelTools".mispwarn (
	"name" varchar NOT NULL,
	description varchar NOT NULL,
	"type" varchar NULL,
	id bigserial NOT NULL,
	CONSTRAINT mispwarn_id_pk PRIMARY KEY (id)
);


-- "IntelTools".mispwarn_list definition

-- Drop table

-- DROP TABLE "IntelTools".mispwarn_list;

CREATE TABLE "IntelTools".mispwarn_list (
	id bigserial NOT NULL,
	value varchar NOT NULL,
	"type" varchar NULL,
	id_mispwarn_fk int8 NULL,
	CONSTRAINT mispwarn_list_id_pk PRIMARY KEY (id),
	CONSTRAINT mispwarn_list_fk FOREIGN KEY (id_mispwarn_fk) REFERENCES "IntelTools".mispwarn(id) ON DELETE SET NULL
);
