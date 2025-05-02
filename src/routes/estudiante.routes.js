const { Router } = require('express');
const asignaturaController = require('../controllers/estudiante_controller');
const authMiddleware = require('../services/auth_middlewares');
const router = Router();

router.get('/horario', authMiddleware([1,2,3,4,5]), asignaturaController.renderEstudiante);

module.exports = router;