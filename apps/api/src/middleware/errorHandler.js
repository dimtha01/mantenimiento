/**
 * Middleware de manejo global de errores
 */
export const errorHandler = (err, req, res, next) => {
    console.error('Error capturado:', err);

    // Error de Prisma (PK única, FK inválida, etc.)
    if (err.code) {
        switch (err.code) {
            case 'P2002':
                return res.status(400).json({
                    ok: false,
                    message: 'Ya existe un registro con estos datos únicos',
                    details: err.meta?.target?.join(', ') || 'campo único'
                });

            case 'P2003':
                return res.status(400).json({
                    ok: false,
                    message: 'Referencia inválida: el registro relacionado no existe',
                    details: err.meta?.field_name || 'campo foráneo'
                });

            case 'P2025':
                return res.status(404).json({
                    ok: false,
                    message: 'Registro no encontrado'
                });

            default:
                return res.status(500).json({
                    ok: false,
                    message: 'Error en la base de datos',
                    details: process.env.NODE_ENV === 'development' ? err.message : undefined
                });
        }
    }

    // Error de validación de JWT
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            ok: false,
            message: 'Token inválido'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            ok: false,
            message: 'Token expirado'
        });
    }

    // Error de sintaxis JSON
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({
            ok: false,
            message: 'JSON inválido en el cuerpo de la solicitud'
        });
    }

    // Error personalizado con status
    if (err.status) {
        return res.status(err.status).json({
            ok: false,
            message: err.message || 'Error en la solicitud',
            details: err.details
        });
    }

    // Error genérico
    res.status(500).json({
        ok: false,
        message: 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
};

/**
 * Middleware para rutas no encontradas
 */
export const notFoundHandler = (req, res) => {
    res.status(404).json({
        ok: false,
        message: `Ruta no encontrada: ${req.method} ${req.path}`,
        path: req.path
    });
};

/**
 * Clase de error personalizado
 */
export class AppError extends Error {
    constructor(message, status = 500, details = undefined) {
        super(message);
        this.name = 'AppError';
        this.status = status;
        this.details = details;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Errores predefinidos
 */
export const Errors = {
    BAD_REQUEST: (message = 'Solicitud inválida', details) => new AppError(message, 400, details),
    UNAUTHORIZED: (message = 'No autorizado', details) => new AppError(message, 401, details),
    FORBIDDEN: (message = 'Acceso prohibido', details) => new AppError(message, 403, details),
    NOT_FOUND: (message = 'Recurso no encontrado', details) => new AppError(message, 404, details),
    CONFLICT: (message = 'Conflicto de datos', details) => new AppError(message, 409, details),
    UNPROCESSABLE_ENTITY: (message = 'Entidad no procesable', details) => new AppError(message, 422, details),
    INTERNAL_SERVER: (message = 'Error interno del servidor', details) => new AppError(message, 500, details),
};
