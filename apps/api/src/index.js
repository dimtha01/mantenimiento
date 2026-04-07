import 'dotenv/config';
import express from 'express';
import pino from 'pino';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import app from './app.js';
import { iniciarCronAlertas } from './services/cronAlertas.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

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

// Logging
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

// Health check (antes de archivos estáticos)
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

// Archivos estáticos del cliente (assets)
app.use(express.static(path.join(__dirname, '..', '..', 'client', 'dist')));

// SPA Fallback: para rutas que no son API y no son archivos estáticos
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'client', 'dist', 'index.html'));
});

// Manejo de rutas de la API no encontradas
app.use('/api', notFoundHandler);

// 404 general para cualquier otra cosa que falle
app.use((req, res) => {
  logger.warn({ method: req.method, url: req.url }, 'Ruta no encontrada general');
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Middleware de manejo global de errores
app.use(errorHandler);

const server = app.listen(PORT, '0.0.0.0', () => {
  logger.info({ port: PORT, host: '0.0.0.0' }, 'Servidor iniciado');

  // Iniciar cron de alertas preventivas (cada hora, ejecutar una vez al inicio)
  iniciarCronAlertas("0 * * * *", true);
});
