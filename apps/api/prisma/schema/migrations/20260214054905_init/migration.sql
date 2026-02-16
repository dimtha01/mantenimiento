-- CreateTable
CREATE TABLE "Maquinaria" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "serial" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'OPERATIVO',
    "ultimaRevision" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Maquinaria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Maquinaria_serial_key" ON "Maquinaria"("serial");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");
