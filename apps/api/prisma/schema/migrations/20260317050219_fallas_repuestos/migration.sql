-- CreateTable
CREATE TABLE "repuestos_fallas" (
    "id" SERIAL NOT NULL,
    "repuesto_id" INTEGER NOT NULL,
    "falla_id" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "repuestos_fallas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "repuestos_fallas_repuesto_id_idx" ON "repuestos_fallas"("repuesto_id");

-- CreateIndex
CREATE INDEX "repuestos_fallas_falla_id_idx" ON "repuestos_fallas"("falla_id");

-- AddForeignKey
ALTER TABLE "repuestos_fallas" ADD CONSTRAINT "repuestos_fallas_repuesto_id_fkey" FOREIGN KEY ("repuesto_id") REFERENCES "repuestos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repuestos_fallas" ADD CONSTRAINT "repuestos_fallas_falla_id_fkey" FOREIGN KEY ("falla_id") REFERENCES "registro_fallas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
