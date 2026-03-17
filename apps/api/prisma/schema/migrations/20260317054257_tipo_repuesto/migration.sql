/*
  Warnings:

  - You are about to drop the column `tipo` on the `repuestos` table. All the data in the column will be lost.
  - Added the required column `tipo_repuesto_id` to the `repuestos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "repuestos" DROP COLUMN "tipo",
ADD COLUMN     "tipo_repuesto_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "tipos_repuesto" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "tipos_repuesto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "repuestos_tipo_repuesto_id_idx" ON "repuestos"("tipo_repuesto_id");

-- AddForeignKey
ALTER TABLE "repuestos" ADD CONSTRAINT "repuestos_tipo_repuesto_id_fkey" FOREIGN KEY ("tipo_repuesto_id") REFERENCES "tipos_repuesto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
