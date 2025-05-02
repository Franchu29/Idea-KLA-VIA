const { Router } = require('express');
const asignaturaController = require('../controllers/asignatura_controller');
const authMiddleware = require('../services/auth_middlewares');

const router = Router();

// Rutas de Asignatura
router.get('/renderAsignatura', authMiddleware([1, 2, 3, 5]), asignaturaController.renderAsignatura);
router.get('/createAsignaturaRender', authMiddleware([1, 2, 5]) , asignaturaController.createAsignaturaRender);

router.post('/createAsignatura', authMiddleware([1, 2, 5]) , asignaturaController.createAsignatura);

router.get('/editAsignaturaRender/:id', authMiddleware([1, 2, 5]) , asignaturaController.editAsignaturaRender);
router.post('/editAsignatura/:id', authMiddleware([1, 2, 5]) , asignaturaController.editAsignatura);

router.post('/deleteAsignatura/:id', authMiddleware([1, 2, 5]) , asignaturaController.deleteAsignatura);

router.get('/verAsignaturasDocente', authMiddleware([1, 2, 3, 5]) , asignaturaController.verAsignaturasDocente);

router.get('/renderTomaAsignaturaDocente', authMiddleware([1, 2, 3, 5]) , asignaturaController.renderTomaAsignaturaDocente);
router.post('/TomaAsignaturaDocente', authMiddleware([1, 2, 3, 5]) , asignaturaController.TomaAsignaturaDocente);

router.post('/eliminarAsignaturaDocente/:id', authMiddleware([1, 2, 3, 5]) , asignaturaController.eliminarAsignaturaDocente);


module.exports = router;