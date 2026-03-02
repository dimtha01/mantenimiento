import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.route.js';
import equiposRoutes from './routes/equipos.routes.js';
import catalogosRoutes from './routes/catalogos.routes.js';
import mantenimientosRoutes from './routes/mantenimientos.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import usuariosRoutes from './routes/usuarios.routes.js';
import alertasRoutes from './routes/alertas.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/equipos', equiposRoutes);
app.use('/api/catalogos', catalogosRoutes);
app.use('/api/mantenimientos', mantenimientosRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/alertas', alertasRoutes);

export default app;

