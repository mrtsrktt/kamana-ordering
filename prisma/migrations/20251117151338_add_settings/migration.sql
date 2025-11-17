-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL,
    "businessName" TEXT NOT NULL DEFAULT 'Kamana Pastanesi',
    "phone" TEXT NOT NULL DEFAULT '05302347912',
    "whatsapp" TEXT NOT NULL DEFAULT '905302347912',
    "email" TEXT NOT NULL DEFAULT 'info@kamana.com',
    "city" TEXT NOT NULL DEFAULT 'Istanbul',
    "region" TEXT NOT NULL DEFAULT 'Anadolu Yakası',
    "address" TEXT NOT NULL DEFAULT 'Site, Atay Cad. No:42, 34760 Ümraniye/İstanbul',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);
