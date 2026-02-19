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
    include: { tipo: true },
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
    include: { tipo: true },
  },
};

export const getEquipos = async (req, res) => {
  try {
    const { q = "", take = "100", skip = "0", withDetails = "0" } = req.query;

    const where = q
      ? {
        OR: [
          { codigo: { contains: q, mode: "insensitive" } },
          { serial: { contains: q, mode: "insensitive" } },
          { modelo: { contains: q, mode: "insensitive" } },
          { marca: { nombre: { contains: q, mode: "insensitive" } } },
          { tipo: { nombre: { contains: q, mode: "insensitive" } } },
          { ubicacion: { nombre: { contains: q, mode: "insensitive" } } },
          { propietario: { nombre: { contains: q, mode: "insensitive" } } },
        ],
      }
      : {};

    const equipos = await prisma.equipo.findMany({
      where,
      take: Math.min(parseInt(take) || 100, 500),
      skip: parseInt(skip) || 0,
      orderBy: { id: "desc" },
      include: withDetails === "1" ? INCLUDE_FULL : INCLUDE_LIST,
    });

    const [total, porTipo] = await Promise.all([
      prisma.equipo.count({ where }),
      prisma.registroMantenimiento.groupBy({
        by: ["tipoId"],
        _count: { tipoId: true },
        where: {
          fechaServicio: {
            gte: new Date(new Date().setDate(1)), // mes actual
          },
        },
      }),
    ]);

    const tiposMant = await prisma.tipoMantenimiento.findMany();
    const tipoMap = Object.fromEntries(tiposMant.map((t) => [t.id, t.nombre]));

    const kpis = {
      total,
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

export const createEquipo = async (req, res) => {
  try {
    const { codigo, modelo, serial, factura, marcaId, tipoId, unidadNegocioId, propietarioId, parametroId } = req.body;

    const data = {
      codigo, modelo, serial,
      factura: factura ?? false,
      marcaId: toId(marcaId),
      tipoId: toId(tipoId),
      unidadNegocioId: toId(unidadNegocioId),
      propietarioId: toId(propietarioId),
      parametroId: toId(parametroId),
    };

    // Campos obligatorios
    const missing = ['codigo', 'modelo', 'serial', 'marcaId', 'tipoId', 'unidadNegocioId', 'propietarioId', 'parametroId']
      .filter(f => data[f] == null || data[f] === '');
    if (missing.length) {
      return res.status(400).json({ ok: false, message: `Faltan campos requeridos: ${missing.join(', ')}` });
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
    const { codigo, modelo, serial, factura, marcaId, tipoId, unidadNegocioId, propietarioId, parametroId } = req.body;

    const data = {
      codigo, modelo, serial,
      factura: factura ?? false,
      marcaId: toId(marcaId),
      tipoId: toId(tipoId),
      unidadNegocioId: toId(unidadNegocioId),
      propietarioId: toId(propietarioId),
      parametroId: toId(parametroId),
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
    const { fechaEmision, duracionMeses, vencimiento } = req.body;
    const equipoId = Number(req.params.id);

    const cert = await prisma.certificacionHistorial.create({
      data: {
        equipoId,
        fechaEmision: new Date(fechaEmision),
        duracionMeses: parseInt(duracionMeses),
        vencimiento: new Date(vencimiento),
      },
    });

    return res.status(201).json({ ok: true, data: cert });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: "Error creando certificación" });
  }
};

