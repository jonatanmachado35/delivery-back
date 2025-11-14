ALTER TABLE "users"
  ADD COLUMN "avatar_id" INTEGER;

CREATE UNIQUE INDEX "users_avatar_id_key"
  ON "users"("avatar_id");

ALTER TABLE "users"
  ADD CONSTRAINT "users_avatar_id_fkey"
  FOREIGN KEY ("avatar_id")
  REFERENCES "files"("id")
  ON DELETE SET NULL
  ON UPDATE CASCADE;
