/*
  Warnings:

  - You are about to drop the column `imagenes` on the `equipos` table. All the data in the column will be lost.
  - You are about to drop the column `entity_id` on the `imagenes` table. All the data in the column will be lost.
  - You are about to drop the column `entity_type` on the `imagenes` table. All the data in the column will be lost.
  - You are about to drop the column `imagenes` on the `usuarios` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "imagenes_entity_type_entity_id_idx";

-- AlterTable
ALTER TABLE "equipos" DROP COLUMN "imagenes";

-- AlterTable
ALTER TABLE "imagenes" DROP COLUMN "entity_id",
DROP COLUMN "entity_type",
ADD COLUMN     "equipo_id" INTEGER,
ADD COLUMN     "usuario_id" INTEGER;

-- AlterTable
ALTER TABLE "usuarios" DROP COLUMN "imagenes";

-- DropEnum
DROP TYPE "ImagenEntityType";

-- AddForeignKey
ALTER TABLE "imagenes" ADD CONSTRAINT "imagenes_equipo_id_fkey" FOREIGN KEY ("equipo_id") REFERENCES "equipos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imagenes" ADD CONSTRAINT "imagenes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
