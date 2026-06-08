-- CreateTable
CREATE TABLE IF NOT EXISTS "app_configs" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "app_configs_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "diploma_orders" (
    "id" TEXT NOT NULL,
    "program_id" TEXT NOT NULL,
    "program_slug" TEXT NOT NULL,
    "program_title" TEXT NOT NULL,
    "plan_type" TEXT NOT NULL,
    "plan_title" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "country" TEXT,
    "address" TEXT,
    "region" TEXT,
    "postcode" TEXT,
    "payment_method" TEXT NOT NULL,
    "payment_ref" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paid_at" TIMESTAMP(3),
    "user_id" TEXT,

    CONSTRAINT "diploma_orders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "diploma_orders_status_created_at_idx" ON "diploma_orders"("status", "created_at");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "diploma_orders_email_idx" ON "diploma_orders"("email");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "diploma_orders_program_id_status_idx" ON "diploma_orders"("program_id", "status");
