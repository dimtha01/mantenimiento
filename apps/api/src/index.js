import 'dotenv/config';
import express from 'express';
import pino from 'pino';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import app from './app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '..', '..', 'client', 'dist')));

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

if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

// Rutas base
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

app.get('/api', (req, res) => {
  logger.debug('Version check solicitado');
  res.json({ version: '1.0.0', buildDate: '2024-06-01T00:00:00Z' });
});

// 404 SIEMPRE al final (después de authRoutes y demás)
app.use((req, res) => {
  logger.warn({ method: req.method, url: req.url }, 'Ruta no encontrada');
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Error handler al final
app.use((err, req, res, next) => {
  logger.error({ error: err.message, stack: err.stack }, 'Error en el servidor');
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Error interno del servidor' : err.message
  });
});

const server = app.listen(PORT, () => {
  logger.info({ port: PORT }, 'Servidor iniciado');
});
