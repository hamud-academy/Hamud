-- Fix diploma_orders.status: was TEXT from bootstrap SQL, Prisma expects OrderStatus enum
ALTER TABLE "diploma_orders"
  ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "diploma_orders"
  ALTER COLUMN "status" TYPE "OrderStatus" USING (
    CASE
      WHEN UPPER("status") = 'PAID' THEN 'PAID'::"OrderStatus"
      ELSE 'PENDING'::"OrderStatus"
    END
  );

ALTER TABLE "diploma_orders"
  ALTER COLUMN "status" SET DEFAULT 'PENDING'::"OrderStatus";

-- Align timestamp columns with Prisma if needed
ALTER TABLE "diploma_orders"
  ALTER COLUMN "created_at" TYPE TIMESTAMP(3) USING "created_at"::timestamp(3),
  ALTER COLUMN "updated_at" TYPE TIMESTAMP(3) USING "updated_at"::timestamp(3),
  ALTER COLUMN "paid_at" TYPE TIMESTAMP(3) USING "paid_at"::timestamp(3);
