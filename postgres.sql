-- -------------------------------------------------------------
-- TablePlus 5.9.6(546)
--
-- https://tableplus.com/
--
-- Database: postgres
-- Generation Time: 2024-05-26 14:49:59.7960
-- -------------------------------------------------------------


-- This script only contains the table creation statements and does not fully represent the table in the database. Do not use it as a backup.

-- Table Definition
CREATE TABLE "public"."cpus" (
    "id" int8 NOT NULL,
    "name" text NOT NULL,
    "pending_items" jsonb NOT NULL,
    "stored_items" jsonb NOT NULL,
    "active_items" jsonb NOT NULL,
    "busy" bool NOT NULL,
    "storage" int8 NOT NULL,
    "final_output" jsonb,
    "insert_id" int8,
    PRIMARY KEY ("id")
);

-- This script only contains the table creation statements and does not fully represent the table in the database. Do not use it as a backup.

-- Table Definition
CREATE TABLE "public"."inserts" (
    "id" int8 NOT NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "type" text,
    PRIMARY KEY ("id")
);

-- This script only contains the table creation statements and does not fully represent the table in the database. Do not use it as a backup.

-- Table Definition
CREATE TABLE "public"."items" (
    "id" int4 NOT NULL,
    "quantity" int8 NOT NULL DEFAULT '0'::bigint,
    "item_name" text NOT NULL,
    "insert_id" int8 NOT NULL,
    PRIMARY KEY ("id")
);

-- This script only contains the table creation statements and does not fully represent the table in the database. Do not use it as a backup.

-- Table Definition
CREATE TABLE "public"."stats" (
    "id" int8 NOT NULL,
    "avg_power_injection" float8 NOT NULL,
    "stored_power" float8 NOT NULL,
    "avg_power_use" float8 NOT NULL,
    "insert_id" int8,
    PRIMARY KEY ("id")
);

ALTER TABLE "public"."cpus" ADD FOREIGN KEY ("insert_id") REFERENCES "public"."inserts"("id") ON DELETE CASCADE;


-- Indices Index
CREATE UNIQUE INDEX insert_pkey ON public.inserts USING btree (id)
ALTER TABLE "public"."items" ADD FOREIGN KEY ("insert_id") REFERENCES "public"."inserts"("id") ON DELETE CASCADE;


-- Indices Index
CREATE UNIQUE INDEX "Items_pkey" ON public.items USING btree (id)
ALTER TABLE "public"."stats" ADD FOREIGN KEY ("insert_id") REFERENCES "public"."inserts"("id") ON DELETE CASCADE;


-- Policies
create policy "Enable read access for all users"
on "public"."cpus"
for select using (true);

create policy "Enable read access for all users"
on "public"."inserts"
for select using (true);

create policy "Enable read access for all users"
on "public"."items"
for select using (true);

create policy "Enable read access for all users"
on "public"."stats"
for select using (true);