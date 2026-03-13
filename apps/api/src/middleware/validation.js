/**
 * Middleware de validación de tipos de datos
 */
export const validateBody = (schema) => {
    return (req, res, next) => {
        const errors = [];
        const body = req.body;

        for (const [field, rules] of Object.entries(schema)) {
            const value = body[field];

            // Validar campos requeridos
            if (rules.required && (value === undefined || value === null || value === '')) {
                errors.push(`${field} es obligatorio`);
                continue;
            }

            // Si no es requerido y está vacío, skip
            if (!rules.required && (value === undefined || value === null || value === '')) {
                continue;
            }

            // Validar tipo de dato
            switch (rules.type) {
                case 'number':
                    if (isNaN(Number(value))) {
                        errors.push(`${field} debe ser un número válido`);
                    } else if (rules.min !== undefined && Number(value) < rules.min) {
                        errors.push(`${field} debe ser mayor o igual a ${rules.min}`);
                    } else if (rules.max !== undefined && Number(value) > rules.max) {
                        errors.push(`${field} debe ser menor o igual a ${rules.max}`);
                    }
                    break;

                case 'string':
                    if (typeof value !== 'string') {
                        errors.push(`${field} debe ser un texto`);
                    } else if (rules.minLength && value.length < rules.minLength) {
                        errors.push(`${field} debe tener al menos ${rules.minLength} caracteres`);
                    } else if (rules.maxLength && value.length > rules.maxLength) {
                        errors.push(`${field} debe tener máximo ${rules.maxLength} caracteres`);
                    }
                    break;

                case 'date':
                    if (isNaN(Date.parse(value))) {
                        errors.push(`${field} debe ser una fecha válida`);
                    }
                    break;

                case 'enum':
                    if (!rules.enum.includes(value)) {
                        errors.push(`${field} debe ser uno de: ${rules.enum.join(', ')}`);
                    }
                    break;

                case 'array':
                    if (!Array.isArray(value)) {
                        errors.push(`${field} debe ser un arreglo`);
                    } else if (rules.minItems && value.length < rules.minItems) {
                        errors.push(`${field} debe tener al menos ${rules.minItems} elementos`);
                    }
                    break;

                case 'email':
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(value)) {
                        errors.push(`${field} debe ser un email válido`);
                    }
                    break;
            }
        }

        if (errors.length > 0) {
            return res.status(400).json({
                ok: false,
                message: 'Errores de validación',
                errors
            });
        }

        next();
    };
};

/**
 * Esquemas de validación predefinidos
 */
export const validationSchemas = {
    equipo: {
        codigo: { type: 'string', required: true, minLength: 1, maxLength: 50 },
        modelo: { type: 'string', required: false, maxLength: 100 },
        serial: { type: 'string', required: false, maxLength: 100 },
        factura: { type: 'boolean', required: false },
        marcaId: { type: 'number', required: true },
        tipoId: { type: 'number', required: true },
        unidadNegocioId: { type: 'number', required: true },
        propietarioId: { type: 'number', required: false },
        parametroId: { type: 'number', required: false },
        horasMantenimientoPreventivo: { type: 'number', required: false, min: 0 },
        estadoOperativo: { type: 'enum', required: false, enum: ['OPERATIVO', 'NO_OPERATIVO'] },
    },

    mantenimiento: {
        equipoId: { type: 'number', required: true },
        tipoId: { type: 'number', required: true },
        fechaServicio: { type: 'date', required: true },
        lecturaActual: { type: 'number', required: true, min: 0 },
        observaciones: { type: 'string', required: false },
        costoManoObra: { type: 'number', required: false, min: 0 },
        costoServicios: { type: 'number', required: false, min: 0 },
        costoRepuestos: { type: 'number', required: false, min: 0 },
        costoTotal: { type: 'number', required: false, min: 0 },
        planId: { type: 'number', required: false },
    },

    planPreventivo: {
        equipoId: { type: 'number', required: true },
        descripcionTarea: { type: 'string', required: true, minLength: 1, maxLength: 500 },
        frecuenciaValor: { type: 'number', required: true, min: 1 },
        costoEstimado: { type: 'number', required: false, min: 0 },
    },

    falla: {
        equipoId: { type: 'number', required: true },
        descripcion: { type: 'string', required: true, minLength: 1 },
        severidad: { type: 'enum', required: false, enum: ['BAJA', 'MEDIA', 'ALTA', 'CRITICA'] },
        estado: { type: 'enum', required: false, enum: ['ABIERTA', 'EN_PROCESO', 'RESUELTA'] },
        responsable: { type: 'string', required: false, maxLength: 255 },
        costoReparacion: { type: 'number', required: false, min: 0 },
    },

    repuesto: {
        equipoId: { type: 'number', required: true },
        nombre: { type: 'string', required: true, minLength: 1, maxLength: 200 },
        tipo: { type: 'enum', required: false, enum: ['FILTRO', 'CORREA', 'ACEITE', 'OTRO'] },
        codigo: { type: 'string', required: false, maxLength: 100 },
        costo: { type: 'number', required: false, min: 0 },
    },
};

/**
 * Sanitizador de entrada para prevenir inyección de código
 */
export const sanitizeInput = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj;

    const sanitized = Array.isArray(obj) ? [] : {};

    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            // Eliminar etiquetas HTML y scripts
            sanitized[key] = value
                .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/<[^>]*>/g, '')
                .trim();
        } else if (typeof value === 'object' && value !== null) {
            sanitized[key] = sanitizeInput(value);
        } else {
            sanitized[key] = value;
        }
    }

    return sanitized;
};
