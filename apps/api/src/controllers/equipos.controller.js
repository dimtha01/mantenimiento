import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();


const INCLUDE_FULL = {
  marca: true,
  tipo: true,
  ubicacion: true,
  propietario: true,
  parametro: true,
  imagenes: true,
  certificaciones: { orderBy: { vencimiento: "asc" } },
  planes: { orderBy: { id: "asc" } },
  mantenimientos: {
    orderBy: { fechaServicio: "desc" },
    include: {
      tipo: true,
      repuestos: {
        include: { repuesto: true }
      }
    },
  },
  fallas: {
    orderBy: { fecha: "desc" },
  },
};

const INCLUDE_LIST = {
  marca: true,
  tipo: true,
  ubicacion: true,
  propietario: true,
  parametro: true,
  certificaciones: { orderBy: { vencimiento: "asc" }, take: 1 },
  mantenimientos: {
    orderBy: { fechaServicio: "desc" },
    take: 1,
    include: {
      tipo: true,
      repuestos: {
        include: { repuesto: true }
      }
    },
  },
  fallas: {
    where: { estado: { not: "RESUELTA" } },
    orderBy: { fecha: "desc" },
    take: 3,
  },
};

export const getEquipos = async (req, res) => {
  try {
    const { q = "", take = "100", skip = "0", withDetails = "0", estadoOperativo, conFallas } = req.query;

    const baseWhere = {
      ...(q ? {
        OR: [
          { codigo: { contains: q, mode: "insensitive" } },
          { serial: { contains: q, mode: "insensitive" } },
          { modelo: { contains: q, mode: "insensitive" } },
          { marca: { nombre: { contains: q, mode: "insensitive" } } },
          { tipo: { nombre: { contains: q, mode: "insensitive" } } },
          { ubicacion: { nombre: { contains: q, mode: "insensitive" } } },
          { propietario: { nombre: { contains: q, mode: "insensitive" } } },
        ],
      } : {}),
    };

    const filterWhere = {
      ...baseWhere,
      ...(estadoOperativo ? { estadoOperativo } : {}),
      ...(conFallas === "1" ? { fallas: { some: { estado: { not: "RESUELTA" } } } } : {}),
    };

    const equipos = await prisma.equipo.findMany({
      where: filterWhere,
      take: Math.min(parseInt(take) || 100, 500),
      skip: parseInt(skip) || 0,
      orderBy: [
        { modelo: "asc" },
        { codigo: "asc" }
      ],
      include: withDetails === "1" ? INCLUDE_FULL : INCLUDE_LIST,
    });

    const [totalFilter, totalGlobal, porTipo, totalOperativos, totalNoOperativos, totalConFallas] = await Promise.all([
      prisma.equipo.count({ where: filterWhere }),
      prisma.equipo.count({ where: baseWhere }),
      prisma.registroMantenimiento.groupBy({
        by: ["tipoId"],
        _count: { tipoId: true },
        where: {
          fechaServicio: {
            gte: new Date(new Date().setDate(1)), // mes actual
          },
        },
      }),
      prisma.equipo.count({ where: { ...baseWhere, estadoOperativo: "OPERATIVO" } }),
      prisma.equipo.count({ where: { ...baseWhere, estadoOperativo: "NO_OPERATIVO" } }),
      prisma.equipo.count({ where: { ...baseWhere, fallas: { some: { estado: { not: "RESUELTA" } } } } }),
    ]);

    const tiposMant = await prisma.tipoMantenimiento.findMany();
    const tipoMap = Object.fromEntries(tiposMant.map((t) => [t.id, t.nombre]));

    // Calcular equipos con alertas de horas
    const equiposConAlerta = equipos.filter(eq => {
      if (!eq.horasMantenimientoPreventivo || eq.horasMantenimientoPreventivo <= 0) return false;
      const horasRestantes = eq.horasMantenimientoPreventivo - (eq.horasAcumuladas || 0);
      return horasRestantes <= eq.horasMantenimientoPreventivo * 0.15; // 15% o menos restante
    });

    const kpis = {
      total: totalGlobal,
      totalFilter,
      totalOperativos,
      totalNoOperativos,
      totalConFallas,
      equiposConAlertaHoras: equiposConAlerta.length,
      porTipoMantenimiento: porTipo.map((g) => ({
        tipo: tipoMap[g.tipoId] ?? "DESCONOCIDO",
        count: g._count.tipoId,
      })),
    };

    return res.json({ ok: true, data: equipos, kpis });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: "Error obteniendo equipos" });
  }
};

export const getEquipoById = async (req, res) => {
  try {
    const equipo = await prisma.equipo.findUnique({
      where: { id: Number(req.params.id) },
      include: INCLUDE_FULL,
    });

    if (!equipo)
      return res.status(404).json({ ok: false, message: "Equipo no encontrado" });

    return res.json({ ok: true, data: equipo });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: "Error obteniendo equipo" });
  }
};

const toId = (v) => (v !== '' && v != null && !isNaN(Number(v)) ? Number(v) : undefined);

// Obtener o crear un registro "Por Verificar" para FKs opcionales
const getPorVerificarId = async (modelName, columnName = 'nombre') => {
  const label = 'Por Verificar';
  const existing = await prisma[modelName].findFirst({
    where: { [columnName]: { equals: label, mode: 'insensitive' } },
  });
  if (existing) return existing.id;
  const created = await prisma[modelName].create({ data: { [columnName]: label } });
  return created.id;
};

export const createEquipo = async (req, res) => {
  try {
    const { codigo, modelo, serial, factura, marcaId, tipoId, unidadNegocioId, propietarioId, parametroId, horasMantenimientoPreventivo, fichaTecnica } = req.body;

    if (!codigo) {
      return res.status(400).json({ ok: false, message: 'El campo código es obligatorio' });
    }

    // Helper: resolver ID existente, crear nuevo string, o usar "Por Verificar"
    const resolveId = async (modelName, value, columnName = 'nombre', fallback = false) => {
      if (!value && !fallback) return null;
      if (!value && fallback) return getPorVerificarId(modelName, columnName);
      if (!isNaN(Number(value))) return Number(value);
      const existing = await prisma[modelName].findFirst({ where: { [columnName]: { equals: value, mode: 'insensitive' } } });
      if (existing) return existing.id;
      const created = await prisma[modelName].create({ data: { [columnName]: value } });
      return created.id;
    };

    // Para ParametroControl sin string, usar el primer registro o el de horas
    const resolveParametroId = async (value) => {
      if (value && !isNaN(Number(value))) return Number(value);
      if (value) {
        const existing = await prisma.parametroControl.findFirst({ where: { nombre: { contains: value, mode: 'insensitive' } } });
        if (existing) return existing.id;
      }
      // Fallback: usar primer parámetro disponible
      const primero = await prisma.parametroControl.findFirst({ orderBy: { id: 'asc' } });
      return primero?.id ?? null;
    };

    const marca_id = await resolveId('marca', marcaId, 'nombre', true);
    const tipo_id = await resolveId('tipoEquipo', tipoId, 'nombre', true);
    const ubic_id = await resolveId('ubicacionActivo', unidadNegocioId, 'nombre', true);
    const prop_id = await resolveId('propietario', propietarioId, 'nombre', true);
    const param_id = await resolveParametroId(parametroId);

    // Validar ficha técnica si viene
    let fichaTecnicaData = [];
    if (fichaTecnica) {
      fichaTecnicaData = validarFichaTecnica(fichaTecnica);
      if (fichaTecnicaData === null) {
        return res.status(400).json({ ok: false, message: 'La ficha técnica debe ser un array de objetos con las propiedades "clave" y "valor"' });
      }
    }

    const data = {
      codigo,
      modelo: modelo || 'Sin modelo',
      serial: serial || 'Sin serial',
      factura: factura ?? false,
      marcaId: marca_id,
      tipoId: tipo_id,
      unidadNegocioId: ubic_id,
      propietarioId: prop_id,
      parametroId: param_id,
      horasMantenimientoPreventivo: horasMantenimientoPreventivo ? Number(horasMantenimientoPreventivo) : 0,
      fichaTecnica: fichaTecnicaData,
    };

    // Solo codigo es realmente obligatorio ahora; pero necesitamos al menos los IDs de FK (se resolvieron con fallback)
    if (!data.marcaId || !data.tipoId || !data.unidadNegocioId || !data.propietarioId || !data.parametroId) {
      return res.status(500).json({ ok: false, message: 'No se pudo resolver uno de los catálogos requeridos. Verifique que existan registros en la base de datos.' });
    }

    const equipo = await prisma.equipo.create({ data, include: INCLUDE_FULL });
    return res.status(201).json({ ok: true, data: equipo });
  } catch (err) {
    console.error(err);
    if (err.code === 'P2003') {
      return res.status(400).json({ ok: false, message: `Referencia inválida: verifique marca, tipo, propietario, parámetro o ubicación seleccionados.` });
    }
    return res.status(500).json({ ok: false, message: "Error creando equipo" });
  }
};

export const updateEquipo = async (req, res) => {
  try {
    const { codigo, modelo, serial, factura, marcaId, tipoId, unidadNegocioId, propietarioId, parametroId, horasMantenimientoPreventivo, estadoOperativo, fichaTecnica, horometroActual } = req.body;

    const resolveId = async (modelName, value, columnName = 'nombre') => {
      if (!value) return undefined;
      if (!isNaN(Number(value))) return Number(value); // Es un ID existente
      // Es un string nuevo, crearlo dinámicamente
      const existing = await prisma[modelName].findFirst({ where: { [columnName]: { equals: value, mode: 'insensitive' } } });
      if (existing) return existing.id;
      const created = await prisma[modelName].create({ data: { [columnName]: value } });
      return created.id;
    };

    const marca_id = await resolveId('marca', marcaId);
    const tipo_id = await resolveId('tipoEquipo', tipoId);
    const ubic_id = await resolveId('ubicacionActivo', unidadNegocioId);
    const prop_id = await resolveId('propietario', propietarioId);
    const param_id = toId(parametroId);

    // Validar ficha técnica si viene
    let fichaTecnicaData = undefined;
    if (fichaTecnica !== undefined) {
      fichaTecnicaData = validarFichaTecnica(fichaTecnica);
      if (fichaTecnicaData === null) {
        return res.status(400).json({ ok: false, message: 'La ficha técnica debe ser un array de objetos con las propiedades "clave" y "valor"' });
      }
    }

    const data = {
      codigo, modelo, serial,
      factura: factura ?? false,
      marcaId: marca_id,
      tipoId: tipo_id,
      unidadNegocioId: ubic_id,
      propietarioId: prop_id,
      parametroId: param_id,
      ...(horasMantenimientoPreventivo !== undefined ? { horasMantenimientoPreventivo: Number(horasMantenimientoPreventivo) } : {}),
      ...(estadoOperativo ? { estadoOperativo } : {}),
      ...(fichaTecnicaData !== undefined ? { fichaTecnica: fichaTecnicaData } : {}),
      ...(horometroActual !== undefined ? { horometroActual: Number(horometroActual) } : {}),
    };

    // Quitar campos undefined para no sobrescribir con null
    Object.keys(data).forEach(k => data[k] === undefined && delete data[k]);

    const equipo = await prisma.equipo.update({
      where: { id: Number(req.params.id) },
      data,
      include: INCLUDE_FULL,
    });

    return res.json({ ok: true, data: equipo });
  } catch (err) {
    console.error(err);
    if (err.code === 'P2003') {
      return res.status(400).json({ ok: false, message: `Referencia inválida: verifique marca, tipo, propietario, parámetro o ubicación seleccionados.` });
    }
    return res.status(500).json({ ok: false, message: "Error actualizando equipo" });
  }
};

export const createCertificacion = async (req, res) => {
  try {
    const { nombre, fechaEmision, duracionMeses, vencimiento } = req.body;
    const equipoId = Number(req.params.id);

    if (!nombre || !fechaEmision || !duracionMeses || !vencimiento) {
      return res.status(400).json({ ok: false, message: "Faltan campos: nombre, fechaEmision, duracionMeses, vencimiento" });
    }

    const fEmision = new Date(fechaEmision);
    const fVencimiento = new Date(vencimiento);
    if (fVencimiento <= fEmision) {
      return res.status(400).json({ ok: false, message: "La fecha de vencimiento debe ser posterior a la fecha de emisión" });
    }

    const cert = await prisma.certificacionHistorial.create({
      data: {
        equipoId,
        nombre,
        fechaEmision: fEmision,
        duracionMeses: parseInt(duracionMeses),
        vencimiento: fVencimiento,
      },
    });

    return res.status(201).json({ ok: true, data: cert });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: "Error creando certificación" });
  }
};

/* ── PUT /api/equipos/:id/certificaciones/:certId ── */
export const updateCertificacion = async (req, res) => {
  try {
    const certId = Number(req.params.certId);
    const { nombre, fechaEmision, duracionMeses, vencimiento } = req.body;

    const data = {};
    if (nombre) data.nombre = nombre;
    if (fechaEmision) data.fechaEmision = new Date(fechaEmision);
    if (duracionMeses != null) data.duracionMeses = parseInt(duracionMeses);
    if (vencimiento) data.vencimiento = new Date(vencimiento);

    // Validar fechas si ambas están presentes
    if (data.fechaEmision && data.vencimiento && data.vencimiento <= data.fechaEmision) {
      return res.status(400).json({ ok: false, message: "La fecha de vencimiento debe ser posterior a la fecha de emisión" });
    }

    const cert = await prisma.certificacionHistorial.update({
      where: { id: certId },
      data,
    });

    return res.json({ ok: true, data: cert });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: "Error actualizando certificación" });
  }
};

/* ── POST /api/equipos/:id/registrar-horas ── */
export const registrarHorasUso = async (req, res) => {
  try {
    const { horas } = req.body;
    const equipoId = Number(req.params.id);

    if (!horas || Number(horas) <= 0) {
      return res.status(400).json({ ok: false, message: "Las horas deben ser mayores a 0" });
    }

    // Obtener equipo actual
    const equipoActual = await prisma.equipo.findUnique({
      where: { id: equipoId },
      select: { horasAcumuladas: true, horasMantenimientoPreventivo: true }
    });

    if (!equipoActual) {
      return res.status(404).json({ ok: false, message: "Equipo no encontrado" });
    }

    const nuevasHoras = (equipoActual.horasAcumuladas || 0) + Number(horas);

    // Registrar historial diario de horas (upsert: si ya existe el día, sumar)
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    await prisma.historialHoras.upsert({
      where: { equipoId_fecha: { equipoId, fecha: hoy } },
      update: { horas: { increment: Number(horas) } },
      create: { equipoId, fecha: hoy, horas: Number(horas) },
    });

    // Actualizar horas acumuladas
    const equipo = await prisma.equipo.update({
      where: { id: equipoId },
      data: {
        horasAcumuladas: nuevasHoras,
        horometroActual: nuevasHoras,
        ultimaFechaHoras: new Date(),
      },
      include: INCLUDE_FULL,
    });

    // Calcular alertas basadas en planes preventivos (Meta/Umbral)
    const planes = await prisma.planPreventivo.findMany({
      where: { equipoId, frecuenciaValor: { gt: 0 } },
    });

    const alertasPlanes = planes.map(plan => {
      const base = plan.horasUltimaEjecucion ?? 0;
      const meta = base + plan.frecuenciaValor;
      const umbral = Math.max(2, Math.round(plan.frecuenciaValor * 0.1));
      const horasRestantes = meta - nuevasHoras;

      let nivelAlerta = 'normal';
      if (nuevasHoras >= meta) nivelAlerta = 'critico';
      else if (nuevasHoras >= meta - umbral) nivelAlerta = 'advertencia';

      return {
        planId: plan.id,
        tarea: plan.descripcionTarea,
        frecuencia: plan.frecuenciaValor,
        meta,
        umbral,
        horasRestantes: Math.max(0, horasRestantes),
        nivelAlerta,
      };
    }).filter(a => a.nivelAlerta !== 'normal');

    return res.json({ ok: true, data: equipo, alertasPlanes });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: "Error registrando horas de uso" });
  }
};

/* ── GET /api/equipos/:id/proximo-mantenimiento ── */
export const getProximoMantenimiento = async (req, res) => {
  try {
    const equipoId = Number(req.params.id);

    const equipo = await prisma.equipo.findUnique({
      where: { id: equipoId },
      select: {
        id: true, codigo: true, modelo: true,
        horasAcumuladas: true,
      },
    });

    if (!equipo) {
      return res.status(404).json({ ok: false, message: "Equipo no encontrado" });
    }

    const planes = await prisma.planPreventivo.findMany({
      where: { equipoId, frecuenciaValor: { gt: 0 } },
    });

    const horasActuales = equipo.horasAcumuladas ?? 0;
    const alertasPlanes = planes.map(plan => {
      const base = plan.horasUltimaEjecucion ?? 0;
      const meta = base + plan.frecuenciaValor;
      const umbral = Math.max(2, Math.round(plan.frecuenciaValor * 0.1));
      const horasRestantes = meta - horasActuales;

      let nivelAlerta = 'normal';
      if (horasActuales >= meta) nivelAlerta = 'critico';
      else if (horasActuales >= meta - umbral) nivelAlerta = 'advertencia';

      return {
        planId: plan.id,
        tarea: plan.descripcionTarea,
        frecuencia: plan.frecuenciaValor,
        meta,
        umbral,
        horasRestantes: Math.max(0, horasRestantes),
        nivelAlerta,
      };
    });

    return res.json({ ok: true, data: { equipo, alertasPlanes } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: "Error obteniendo próximo mantenimiento" });
  }
};

/* ── PUT /api/equipos/:id/estado-operativo ── */
export const cambiarEstadoOperativo = async (req, res) => {
  try {
    const { estadoOperativo } = req.body;
    const equipoId = Number(req.params.id);

    if (!['OPERATIVO', 'NO_OPERATIVO'].includes(estadoOperativo)) {
      return res.status(400).json({ ok: false, message: "Estado operativo inválido. Use OPERATIVO o NO_OPERATIVO" });
    }

    const equipo = await prisma.equipo.update({
      where: { id: equipoId },
      data: { estadoOperativo },
      include: INCLUDE_FULL,
    });

    return res.json({ ok: true, data: equipo });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: "Error actualizando estado operativo" });
  }
};

/* ── POST /api/equipos/:id/fallas ── */
export const createFalla = async (req, res) => {
  try {
    const equipoId = Number(req.params.id);
    const { descripcion, severidad, fecha, responsable, costoReparacion } = req.body;

    if (!descripcion) {
      return res.status(400).json({ ok: false, message: "La descripción de la falla es obligatoria" });
    }

    const falla = await prisma.registroFalla.create({
      data: {
        equipoId,
        descripcion,
        severidad: severidad || 'MEDIA',
        fecha: fecha ? new Date(fecha) : new Date(),
        responsable: responsable || null,
        costoReparacion: costoReparacion != null ? Number(costoReparacion) : null,
      },
    });

    // Si es una falla ALTA o CRITICA, marcar equipo como NO_OPERATIVO automáticamente
    if (severidad === 'ALTA' || severidad === 'CRITICA') {
      await prisma.equipo.update({
        where: { id: equipoId },
        data: { estadoOperativo: 'NO_OPERATIVO' },
      });
    }

    // Devolver equipo completo actualizado
    const equipo = await prisma.equipo.findUnique({
      where: { id: equipoId },
      include: INCLUDE_FULL,
    });

    return res.status(201).json({ ok: true, data: falla, equipo });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: "Error registrando falla" });
  }
};

/* ── GET /api/equipos/:id/fallas ── */
export const getFallas = async (req, res) => {
  try {
    const equipoId = Number(req.params.id);
    const fallas = await prisma.registroFalla.findMany({
      where: { equipoId },
      orderBy: { fecha: 'desc' },
    });
    return res.json({ ok: true, data: fallas });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: "Error obteniendo fallas" });
  }
};

/* ── PUT /api/equipos/:id/fallas/:fallaId ── */
export const updateFalla = async (req, res) => {
  try {
    const fallaId = Number(req.params.fallaId);
    const { estado, solucion, severidad, responsable, costoReparacion } = req.body;

    const data = {};
    if (estado) data.estado = estado;
    if (solucion !== undefined) data.solucion = solucion;
    if (severidad) data.severidad = severidad;
    if (estado === 'RESUELTA') data.fechaResolucion = new Date();
    if (responsable !== undefined) data.responsable = responsable || null;
    if (costoReparacion !== undefined) data.costoReparacion = costoReparacion != null ? Number(costoReparacion) : null;

    const falla = await prisma.registroFalla.update({
      where: { id: fallaId },
      data,
    });

    // Si se resuelve la falla, verificar si el equipo puede volver a OPERATIVO
    if (estado === 'RESUELTA') {
      const equipoId = Number(req.params.id);
      const fallasAbiertas = await prisma.registroFalla.count({
        where: {
          equipoId,
          estado: { not: 'RESUELTA' },
        },
      });
      if (fallasAbiertas === 0) {
        await prisma.equipo.update({
          where: { id: equipoId },
          data: { estadoOperativo: 'OPERATIVO' },
        });
      }
    }

    // Devolver equipo completo actualizado
    const equipo = await prisma.equipo.findUnique({
      where: { id: Number(req.params.id) },
      include: INCLUDE_FULL,
    });

    return res.json({ ok: true, data: falla, equipo });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: "Error actualizando falla" });
  }
};

/* ── Helpers Ficha Técnica ── */
const validarFichaTecnica = (ficha) => {
  try {
    const arr = Array.isArray(ficha) ? ficha : JSON.parse(ficha);
    if (!Array.isArray(arr)) return null;
    // Validar que cada item tenga clave y valor
    const validos = arr.filter(item =>
      item && typeof item === 'object' && 'clave' in item && 'valor' in item
    ).map(item => ({
      clave: String(item.clave).trim(),
      valor: String(item.valor).trim(),
    })).filter(item => item.clave.length > 0);
    return validos;
  } catch {
    return null;
  }
};

/* ── GET /api/equipos/:id/ficha-tecnica ── */
export const getFichaTecnica = async (req, res) => {
  try {
    const equipo = await prisma.equipo.findUnique({
      where: { id: Number(req.params.id) },
      select: { id: true, codigo: true, modelo: true, fichaTecnica: true },
    });
    if (!equipo) {
      return res.status(404).json({ ok: false, message: 'Equipo no encontrado' });
    }
    return res.json({ ok: true, data: equipo.fichaTecnica ?? [] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: 'Error obteniendo ficha técnica' });
  }
};

/* ── PUT /api/equipos/:id/ficha-tecnica ── */
export const updateFichaTecnica = async (req, res) => {
  try {
    const { fichaTecnica } = req.body;

    if (fichaTecnica === undefined) {
      return res.status(400).json({ ok: false, message: 'Se requiere el campo fichaTecnica' });
    }

    const validada = validarFichaTecnica(fichaTecnica);
    if (validada === null) {
      return res.status(400).json({
        ok: false,
        message: 'La ficha técnica debe ser un array de objetos con las propiedades "clave" y "valor". Ejemplo: [{"clave": "Capacidad Gasoil", "valor": "500L"}]',
      });
    }

    const equipo = await prisma.equipo.update({
      where: { id: Number(req.params.id) },
      data: { fichaTecnica: validada },
      include: INCLUDE_FULL,
    });

    return res.json({ ok: true, data: equipo });
  } catch (err) {
    console.error(err);
    if (err.code === 'P2025') {
      return res.status(404).json({ ok: false, message: 'Equipo no encontrado' });
    }
    return res.status(500).json({ ok: false, message: 'Error actualizando ficha técnica' });
  }
};

/* ── GET /api/equipos/:id/promedio-horas ── */
export const getPromedioHoras = async (req, res) => {
  try {
    const equipoId = Number(req.params.id);

    const equipo = await prisma.equipo.findUnique({
      where: { id: equipoId },
      select: { id: true, codigo: true, modelo: true, horasAcumuladas: true },
    });

    if (!equipo) {
      return res.status(404).json({ ok: false, message: 'Equipo no encontrado' });
    }

    const mantenimientos = await prisma.registroMantenimiento.findMany({
      where: { equipoId },
      orderBy: { fechaServicio: 'asc' },
      include: { tipo: true }
    });

    let lastReading = 0;
    const historial = mantenimientos.map(m => {
      const incremento = m.lecturaActual >= lastReading ? (m.lecturaActual - lastReading) : 0;
      lastReading = m.lecturaActual;
      return {
        id: m.id,
        fecha: m.fechaServicio,
        horas: incremento, // Incremental hours
        acumulado: m.lecturaActual,
        tipo: m.tipo?.nombre ?? 'MANTENIMIENTO'
      };
    });

    // Fórmula: Promedio = horas_totales / dias_totales
    const totalHoras = historial.reduce((sum, h) => sum + h.horas, 0);
    const msDiff = historial.length > 1
      ? new Date(historial[historial.length - 1].fecha).getTime() - new Date(historial[0].fecha).getTime()
      : Number(new Date().getTime());
    const totalDiasParsed = historial.length > 1 ? Math.max(1, Math.round(msDiff / (1000 * 60 * 60 * 24))) : historial.length;
    const promedioDiario = totalDiasParsed > 0 ? totalHoras / totalDiasParsed : 0;

    return res.json({
      ok: true,
      data: {
        equipo,
        historial,
        estadisticas: {
          totalHoras: Math.round(totalHoras * 100) / 100,
          totalDias: totalDiasParsed,
          promedioDiario: Math.round(promedioDiario * 100) / 100,
        },
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: 'Error calculando promedio de horas' });
  }
};
