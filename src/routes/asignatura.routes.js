const { Router } = require('express');
const asignaturaController = require('../controllers/asignatura_controller');
const authMiddleware = require('../services/auth_middlewares');

const router = Router();

// Rutas de Asignatura
router.get('/renderAsignatura', asignaturaController.renderAsignatura);
router.get('/createAsignaturaRender', asignaturaController.createAsignaturaRender);

router.post('/createAsignatura', asignaturaController.createAsignatura);

router.get('/editAsignaturaRender/:id', asignaturaController.editAsignaturaRender);
router.post('/editAsignatura/:id', asignaturaController.editAsignatura);

router.post('/deleteAsignatura/:id', asignaturaController.deleteAsignatura);

module.exports = router;