-- CreateTable
CREATE TABLE "site_settings" (
    "id" TEXT NOT NULL,
    "favicon_url" TEXT,
    "tab_title" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);
