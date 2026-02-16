-- CreateTable
CREATE TABLE "certificaciones_historial" (
    "id" SERIAL NOT NULL,
    "equipo_id" INTEGER NOT NULL,
    "fecha_emision" DATE NOT NULL,
    "duracion_meses" INTEGER NOT NULL,
    "vencimiento" DATE NOT NULL,

    CONSTRAINT "certificaciones_historial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipos" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "serial" TEXT NOT NULL,
    "factura" BOOLEAN NOT NULL DEFAULT false,
    "tipo_id" INTEGER NOT NULL,
    "marca_id" INTEGER NOT NULL,
    "unidad_negocio_id" INTEGER NOT NULL,
    "propietario_id" INTEGER NOT NULL,
    "parametro_id" INTEGER NOT NULL,

    CONSTRAINT "equipos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "imagenes" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "equipo_id" INTEGER,
    "usuario_id" INTEGER,

    CONSTRAINT "imagenes_pkey" PRIMARY KEY ("id")
);

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
CREATE TABLE "marcas" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "marcas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parametros_control" (
    "id" SERIAL NOT NULL,
    "unidad" TEXT NOT NULL,

    CONSTRAINT "parametros_control_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_preventivo" (
    "id" SERIAL NOT NULL,
    "equipo_id" INTEGER NOT NULL,
    "descripcion_tarea" TEXT NOT NULL,
    "frecuencia_valor" INTEGER NOT NULL,

    CONSTRAINT "plan_preventivo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "propietarios" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "propietarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registro_mantenimiento" (
    "id" SERIAL NOT NULL,
    "equipo_id" INTEGER NOT NULL,
    "fecha_servicio" DATE NOT NULL,
    "lectura_actual" INTEGER NOT NULL,
    "observaciones" TEXT,
    "costo_total" DECIMAL(12,2),
    "tipo_id" INTEGER NOT NULL,

    CONSTRAINT "registro_mantenimiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipos_equipos" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "tipos_equipos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipos_mantenimiento" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "tipos_mantenimiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ubicaciones_equipos" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "ubicaciones_equipos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nombre" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "rol_id" INTEGER NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "certificaciones_historial_equipo_id_idx" ON "certificaciones_historial"("equipo_id");

-- CreateIndex
CREATE INDEX "equipos_tipo_id_idx" ON "equipos"("tipo_id");

-- CreateIndex
CREATE INDEX "equipos_marca_id_idx" ON "equipos"("marca_id");

-- CreateIndex
CREATE INDEX "equipos_unidad_negocio_id_idx" ON "equipos"("unidad_negocio_id");

-- CreateIndex
CREATE INDEX "equipos_propietario_id_idx" ON "equipos"("propietario_id");

-- CreateIndex
CREATE INDEX "equipos_parametro_id_idx" ON "equipos"("parametro_id");

-- CreateIndex
CREATE UNIQUE INDEX "Maquinaria_serial_key" ON "Maquinaria"("serial");

-- CreateIndex
CREATE INDEX "plan_preventivo_equipo_id_idx" ON "plan_preventivo"("equipo_id");

-- CreateIndex
CREATE INDEX "registro_mantenimiento_equipo_id_idx" ON "registro_mantenimiento"("equipo_id");

-- CreateIndex
CREATE INDEX "registro_mantenimiento_tipo_id_idx" ON "registro_mantenimiento"("tipo_id");

-- CreateIndex
CREATE UNIQUE INDEX "roles_nombre_key" ON "roles"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "tipos_mantenimiento_nombre_key" ON "tipos_mantenimiento"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "usuarios_rol_id_idx" ON "usuarios"("rol_id");

-- AddForeignKey
ALTER TABLE "certificaciones_historial" ADD CONSTRAINT "certificaciones_historial_equipo_id_fkey" FOREIGN KEY ("equipo_id") REFERENCES "equipos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipos" ADD CONSTRAINT "equipos_tipo_id_fkey" FOREIGN KEY ("tipo_id") REFERENCES "tipos_equipos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipos" ADD CONSTRAINT "equipos_marca_id_fkey" FOREIGN KEY ("marca_id") REFERENCES "marcas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipos" ADD CONSTRAINT "equipos_unidad_negocio_id_fkey" FOREIGN KEY ("unidad_negocio_id") REFERENCES "ubicaciones_equipos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipos" ADD CONSTRAINT "equipos_propietario_id_fkey" FOREIGN KEY ("propietario_id") REFERENCES "propietarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipos" ADD CONSTRAINT "equipos_parametro_id_fkey" FOREIGN KEY ("parametro_id") REFERENCES "parametros_control"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imagenes" ADD CONSTRAINT "imagenes_equipo_id_fkey" FOREIGN KEY ("equipo_id") REFERENCES "equipos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imagenes" ADD CONSTRAINT "imagenes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_preventivo" ADD CONSTRAINT "plan_preventivo_equipo_id_fkey" FOREIGN KEY ("equipo_id") REFERENCES "equipos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro_mantenimiento" ADD CONSTRAINT "registro_mantenimiento_tipo_id_fkey" FOREIGN KEY ("tipo_id") REFERENCES "tipos_mantenimiento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro_mantenimiento" ADD CONSTRAINT "registro_mantenimiento_equipo_id_fkey" FOREIGN KEY ("equipo_id") REFERENCES "equipos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
