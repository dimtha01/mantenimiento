-- AlterTable
ALTER TABLE "certificaciones_historial" ADD COLUMN     "nombre" TEXT NOT NULL DEFAULT 'Certificación General';

-- AlterTable
ALTER TABLE "equipos" ADD COLUMN     "estado_operativo" TEXT NOT NULL DEFAULT 'OPERATIVO',
ADD COLUMN     "horas_acumuladas" INTEGER DEFAULT 0,
ADD COLUMN     "horas_mantenimiento_preventivo" INTEGER DEFAULT 0,
ADD COLUMN     "ultima_fecha_horas" DATE;

-- AlterTable
ALTER TABLE "plan_preventivo" ADD COLUMN     "fecha_ultima_ejecucion" DATE,
ADD COLUMN     "horas_ultima_ejecucion" INTEGER DEFAULT 0;

-- AlterTable
ALTER TABLE "registro_mantenimiento" ADD COLUMN     "costo_mano_obra" DECIMAL(12,2),
ADD COLUMN     "costo_repuestos" DECIMAL(12,2),
ADD COLUMN     "costo_servicios" DECIMAL(12,2);

-- CreateTable
CREATE TABLE "registro_fallas" (
    "id" SERIAL NOT NULL,
    "equipo_id" INTEGER NOT NULL,
    "fecha" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "descripcion" TEXT NOT NULL,
    "severidad" TEXT NOT NULL DEFAULT 'MEDIA',
    "estado" TEXT NOT NULL DEFAULT 'ABIERTA',
    "solucion" TEXT,
    "fecha_resolucion" DATE,

    CONSTRAINT "registro_fallas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "registro_fallas_equipo_id_idx" ON "registro_fallas"("equipo_id");

-- AddForeignKey
ALTER TABLE "registro_fallas" ADD CONSTRAINT "registro_fallas_equipo_id_fkey" FOREIGN KEY ("equipo_id") REFERENCES "equipos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
