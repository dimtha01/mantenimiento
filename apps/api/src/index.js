import express from 'express';
import pino from 'pino';

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar logger con formato legible para desarrollo
const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss Z',
      ignore: 'pid,hostname',
      singleLine: false,
    }
  },
  level: process.env.LOG_LEVEL || 'info'
});

// Middleware de logging para todas las peticiones HTTP
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.socket.remoteAddress
    }, `${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
  });

  next();
});

// Middleware para logging del body en peticiones POST/PUT
app.use(express.json());
app.use((req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
    logger.debug({ body: req.body }, `Request body: ${req.method} ${req.url}`);
  }
  next();
});

// Rutas
app.get('/', (req, res) => {
  logger.info('Accediendo a ruta principal');
  res.send('Hello, World!');
});

app.get('/api/health', (req, res) => {
  logger.debug('Health check solicitado');
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  logger.warn({ method: req.method, url: req.url }, 'Ruta no encontrada');
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejo centralizado de errores
app.use((err, req, res, next) => {
  logger.error({
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    ip: req.ip
  }, 'Error en el servidor');

  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Error interno del servidor'
      : err.message
  });
});

// Iniciar servidor
const server = app.listen(PORT, () => {
  logger.info({
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
    platform: process.platform,
    time: new Date().toISOString()
  }, `🚀 Servidor iniciado correctamente`);
  logger.info(`📍 Servidor disponible en: http://localhost:${PORT}`);
  logger.info(`🏥 Health check: http://localhost:${PORT}/api/health`);
});

// Manejo graceful de shutdown
const gracefulShutdown = (signal) => {
  logger.info({ signal }, `⚠️  Recibida señal ${signal}, cerrando servidor...`);

  server.close(() => {
    logger.info('✅ Servidor cerrado correctamente');
    process.exit(0);
  });

  // Forzar cierre después de 10 segundos
  setTimeout(() => {
    logger.error('❌ Timeout: forzando cierre del servidor');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Manejo de errores no capturados
process.on('uncaughtException', (err) => {
  logger.error({ error: err.message, stack: err.stack }, '💥 Excepción no capturada');
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error({ reason, promise }, '💥 Promesa rechazada no manejada');
});
