-- DropForeignKey
ALTER TABLE "repuestos" DROP CONSTRAINT "repuestos_tipo_repuesto_id_fkey";

-- AlterTable
ALTER TABLE "repuestos" ALTER COLUMN "tipo_repuesto_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "repuestos" ADD CONSTRAINT "repuestos_tipo_repuesto_id_fkey" FOREIGN KEY ("tipo_repuesto_id") REFERENCES "tipos_repuesto"("id") ON DELETE SET NULL ON UPDATE CASCADE;
