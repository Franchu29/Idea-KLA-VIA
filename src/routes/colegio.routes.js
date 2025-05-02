const { Router } = require('express');
const colegioController = require('../controllers/colegio_controller');
const authMiddleware = require('../services/auth_middlewares');

const router = Router();

// Rutas de Asignatura

router.get('/createColegioRender', authMiddleware([1, 2, 5]) , colegioController.createColegioRender);
router.post('/createColegio', colegioController.createColegio);

router.get('/renderColegio', authMiddleware([1, 2, 5]) , colegioController.renderColegio);

router.post('/deleteColegio/:id', authMiddleware([1, 2, 5]) , colegioController.deleteColegio);

router.get('/createComunicacionRender', authMiddleware([1, 2, 3, 5]) , colegioController.createComunicacionRender);
router.post('/createComunicacion', authMiddleware([1, 2, 3, 5]) , colegioController.createComunicacion);

router.get('/renderComunicacion', authMiddleware([1, 2, 3, 5]) , colegioController.renderComunicacion);

router.get('/calendario', authMiddleware([1, 2, 3, 5]) , colegioController.renderCalendario);

module.exports = router;