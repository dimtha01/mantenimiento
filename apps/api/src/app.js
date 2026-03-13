import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.route.js';
import equiposRoutes from './routes/equipos.routes.js';
import catalogosRoutes from './routes/catalogos.routes.js';
import mantenimientosRoutes from './routes/mantenimientos.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import usuariosRoutes from './routes/usuarios.routes.js';
import alertasRoutes from './routes/alertas.routes.js';
import attachmentsRoutes from './routes/attachments.routes.js';
import repuestosRoutes from './routes/repuestos.routes.js';

import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

// Servir archivos subidos como recursos estáticos
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/equipos', equiposRoutes);
app.use('/api/catalogos', catalogosRoutes);
app.use('/api/mantenimientos', mantenimientosRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/alertas', alertasRoutes);
app.use('/api/attachments', attachmentsRoutes);
app.use('/api/repuestos', repuestosRoutes);

// Manejo de rutas no encontradas (debe ir después de todas las rutas)
app.use('/api', notFoundHandler);

// Middleware de manejo global de errores (debe ir al final)
app.use(errorHandler);

export default app;
