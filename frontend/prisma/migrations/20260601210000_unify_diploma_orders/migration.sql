-- Unify diploma orders into the main orders table (same as courses)

CREATE TYPE "OrderKind" AS ENUM ('COURSE', 'DIPLOMA');

ALTER TABLE "orders" ADD COLUMN "kind" "OrderKind" NOT NULL DEFAULT 'COURSE';
ALTER TABLE "orders" ADD COLUMN "program_id" TEXT;
ALTER TABLE "orders" ADD COLUMN "program_slug" TEXT;
ALTER TABLE "orders" ADD COLUMN "program_title" TEXT;
ALTER TABLE "orders" ADD COLUMN "plan_type" TEXT;
ALTER TABLE "orders" ADD COLUMN "plan_title" TEXT;

ALTER TABLE "orders" ALTER COLUMN "course_id" DROP NOT NULL;

CREATE INDEX "orders_kind_status_created_at_idx" ON "orders"("kind", "status", "created_at");
CREATE INDEX "orders_program_id_status_idx" ON "orders"("program_id", "status");

-- Move existing diploma_orders rows into orders (if table exists from prior migration)
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'diploma_orders'
  ) THEN
    INSERT INTO "orders" (
      "id",
      "kind",
      "full_name",
      "email",
      "phone",
      "country",
      "address",
      "region",
      "postcode",
      "payment_method",
      "payment_ref",
      "amount",
      "password_hash",
      "status",
      "created_at",
      "updated_at",
      "paid_at",
      "user_id",
      "program_id",
      "program_slug",
      "program_title",
      "plan_type",
      "plan_title"
    )
    SELECT
      d."id",
      'DIPLOMA'::"OrderKind",
      d."full_name",
      d."email",
      d."phone",
      d."country",
      d."address",
      d."region",
      d."postcode",
      d."payment_method",
      d."payment_ref",
      d."amount",
      d."password_hash",
      d."status",
      d."created_at",
      d."updated_at",
      d."paid_at",
      d."user_id",
      d."program_id",
      d."program_slug",
      d."program_title",
      d."plan_type",
      d."plan_title"
    FROM "diploma_orders" d
    WHERE NOT EXISTS (SELECT 1 FROM "orders" o WHERE o."id" = d."id");

    DROP TABLE "diploma_orders";
  END IF;
END $$;
