import { Router } from 'express';
import {
    getUsuarios,
    getUsuario,
    createUsuario,
    updateUsuario,
    resetPassword,
    deleteUsuario,
    getRoles,
} from '../controllers/usuarios.controller.js';

const router = Router();

router.get('/', getUsuarios);
router.get('/roles', getRoles);
router.get('/:id', getUsuario);
router.post('/', createUsuario);
router.put('/:id', updateUsuario);
router.put('/:id/password', resetPassword);
router.delete('/:id', deleteUsuario);

export default router;
