/*
  Warnings:

  - You are about to drop the `Maquinaria` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `certificaciones_historial` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `equipos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `imagenes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `marcas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `parametros_control` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `plan_preventivo` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `propietarios` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `registro_mantenimiento` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `roles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tipos_equipos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tipos_mantenimiento` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ubicaciones_equipos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `usuarios` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "certificaciones_historial" DROP CONSTRAINT "certificaciones_historial_equipo_id_fkey";

-- DropForeignKey
ALTER TABLE "equipos" DROP CONSTRAINT "equipos_marca_id_fkey";

-- DropForeignKey
ALTER TABLE "equipos" DROP CONSTRAINT "equipos_parametro_id_fkey";

-- DropForeignKey
ALTER TABLE "equipos" DROP CONSTRAINT "equipos_propietario_id_fkey";

-- DropForeignKey
ALTER TABLE "equipos" DROP CONSTRAINT "equipos_tipo_id_fkey";

-- DropForeignKey
ALTER TABLE "equipos" DROP CONSTRAINT "equipos_unidad_negocio_id_fkey";

-- DropForeignKey
ALTER TABLE "imagenes" DROP CONSTRAINT "imagenes_equipo_id_fkey";

-- DropForeignKey
ALTER TABLE "imagenes" DROP CONSTRAINT "imagenes_usuario_id_fkey";

-- DropForeignKey
ALTER TABLE "plan_preventivo" DROP CONSTRAINT "plan_preventivo_equipo_id_fkey";

-- DropForeignKey
ALTER TABLE "registro_mantenimiento" DROP CONSTRAINT "registro_mantenimiento_equipo_id_fkey";

-- DropForeignKey
ALTER TABLE "registro_mantenimiento" DROP CONSTRAINT "registro_mantenimiento_tipo_id_fkey";

-- DropForeignKey
ALTER TABLE "usuarios" DROP CONSTRAINT "usuarios_rol_id_fkey";

-- DropTable
DROP TABLE "Maquinaria";

-- DropTable
DROP TABLE "certificaciones_historial";

-- DropTable
DROP TABLE "equipos";

-- DropTable
DROP TABLE "imagenes";

-- DropTable
DROP TABLE "marcas";

-- DropTable
DROP TABLE "parametros_control";

-- DropTable
DROP TABLE "plan_preventivo";

-- DropTable
DROP TABLE "propietarios";

-- DropTable
DROP TABLE "registro_mantenimiento";

-- DropTable
DROP TABLE "roles";

-- DropTable
DROP TABLE "tipos_equipos";

-- DropTable
DROP TABLE "tipos_mantenimiento";

-- DropTable
DROP TABLE "ubicaciones_equipos";

-- DropTable
DROP TABLE "usuarios";
