-- AlterTable
ALTER TABLE "registro_fallas" ADD COLUMN     "costo_reparacion" DECIMAL(12,2),
ADD COLUMN     "responsable" VARCHAR(255);

-- CreateTable
CREATE TABLE "attachments" (
    "id" SERIAL NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "attachable_id" INTEGER NOT NULL,
    "attachable_type" TEXT NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historial_horas" (
    "id" SERIAL NOT NULL,
    "equipo_id" INTEGER NOT NULL,
    "fecha" DATE NOT NULL,
    "horas" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "historial_horas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "repuestos" (
    "id" SERIAL NOT NULL,
    "equipo_id" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'OTRO',
    "codigo" TEXT,
    "costo" DECIMAL(12,2),

    CONSTRAINT "repuestos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "repuestos_mantenimiento" (
    "id" SERIAL NOT NULL,
    "repuesto_id" INTEGER NOT NULL,
    "mantenimiento_id" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "repuestos_mantenimiento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "attachments_attachable_id_attachable_type_idx" ON "attachments"("attachable_id", "attachable_type");

-- CreateIndex
CREATE INDEX "historial_horas_equipo_id_idx" ON "historial_horas"("equipo_id");

-- CreateIndex
CREATE UNIQUE INDEX "historial_horas_equipo_id_fecha_key" ON "historial_horas"("equipo_id", "fecha");

-- CreateIndex
CREATE INDEX "repuestos_equipo_id_idx" ON "repuestos"("equipo_id");

-- CreateIndex
CREATE INDEX "repuestos_mantenimiento_repuesto_id_idx" ON "repuestos_mantenimiento"("repuesto_id");

-- CreateIndex
CREATE INDEX "repuestos_mantenimiento_mantenimiento_id_idx" ON "repuestos_mantenimiento"("mantenimiento_id");

-- AddForeignKey
ALTER TABLE "historial_horas" ADD CONSTRAINT "historial_horas_equipo_id_fkey" FOREIGN KEY ("equipo_id") REFERENCES "equipos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repuestos" ADD CONSTRAINT "repuestos_equipo_id_fkey" FOREIGN KEY ("equipo_id") REFERENCES "equipos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repuestos_mantenimiento" ADD CONSTRAINT "repuestos_mantenimiento_repuesto_id_fkey" FOREIGN KEY ("repuesto_id") REFERENCES "repuestos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repuestos_mantenimiento" ADD CONSTRAINT "repuestos_mantenimiento_mantenimiento_id_fkey" FOREIGN KEY ("mantenimiento_id") REFERENCES "registro_mantenimiento"("id") ON DELETE CASCADE ON UPDATE CASCADE;
