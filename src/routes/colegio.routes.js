const { Router } = require('express');
const colegioController = require('../controllers/colegio_controller');
const authMiddleware = require('../services/auth_middlewares');

const router = Router();

// Rutas de Asignatura

router.get('/createColegioRender', colegioController.createColegioRender);
router.post('/createColegio', colegioController.createColegio);

router.get('/renderColegio', colegioController.renderColegio);

router.post('/deleteColegio/:id', colegioController.deleteColegio);

module.exports = router;