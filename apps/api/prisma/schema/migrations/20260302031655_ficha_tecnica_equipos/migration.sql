-- AlterTable
ALTER TABLE "equipos" ADD COLUMN     "ficha_tecnica" JSONB DEFAULT '[]',
ADD COLUMN     "horometro_actual" INTEGER DEFAULT 0;

-- AlterTable
ALTER TABLE "plan_preventivo" ADD COLUMN     "frecuencia_horas" INTEGER DEFAULT 0;

-- CreateTable
CREATE TABLE "alertas_preventivas" (
    "id" SERIAL NOT NULL,
    "equipo_id" INTEGER NOT NULL,
    "plan_id" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'ADVERTENCIA',
    "mensaje" TEXT NOT NULL,
    "horas_equipo_al_momento" INTEGER NOT NULL,
    "meta_horas" INTEGER NOT NULL,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "resuelta" BOOLEAN NOT NULL DEFAULT false,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alertas_preventivas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "alertas_preventivas_equipo_id_idx" ON "alertas_preventivas"("equipo_id");

-- CreateIndex
CREATE INDEX "alertas_preventivas_plan_id_idx" ON "alertas_preventivas"("plan_id");

-- CreateIndex
CREATE INDEX "alertas_preventivas_leida_idx" ON "alertas_preventivas"("leida");

-- CreateIndex
CREATE INDEX "alertas_preventivas_resuelta_idx" ON "alertas_preventivas"("resuelta");

-- AddForeignKey
ALTER TABLE "alertas_preventivas" ADD CONSTRAINT "alertas_preventivas_equipo_id_fkey" FOREIGN KEY ("equipo_id") REFERENCES "equipos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alertas_preventivas" ADD CONSTRAINT "alertas_preventivas_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plan_preventivo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
