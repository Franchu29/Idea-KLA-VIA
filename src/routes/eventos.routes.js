const { Router } = require('express');
const eventosController = require('../controllers/eventos_controller');
const authMiddleware = require('../services/auth_middlewares');

const router = Router();

// Ruta para renderizar el formulario de creación de eventos
router.get('/render_events', authMiddleware([1, 2, 3]), eventosController.renderEvents);

// Ruta para crear un evento
router.post('/create_event', eventosController.createEvent);

// Ruta para obtener todos los eventos
router.get('/show_event', eventosController.getEvents);

router.post('/delete_event/:id', eventosController.deleteEvento);

router.get('/edit_event/:id', authMiddleware([1, 2, 3]), eventosController.editEventoRender);
router.post('/edit_event/:id', eventosController.editEvento);

router.get('/inspeccionar_evento/:id', eventosController.inspeccionarEvento);
router.post('/actualizar_asistencia/:id', eventosController.actualizarAsistencia);

router.get('/participantes_cortesia/:id', authMiddleware([1, 2]), eventosController.renderParticipantesCortesia);
router.post('/inscribir_participantes/:id', eventosController.inscribirParticipantes);

router.get('/render_distancias', authMiddleware([1, 2]), eventosController.renderDistancias);
router.post('/create_distancias', eventosController.createDistancias)
router.get('/ver_distancias', authMiddleware([1, 2]), eventosController.getDistancias)

router.post('/delete_distancia/:id', eventosController.deleteDistancia);
router.get('/edit_render_distancia/:id', authMiddleware([1, 2]), eventosController.editDistanciaRender)
router.post('/edit_distancia/:id', eventosController.editDistancia);

router.get('/reportes', authMiddleware([1, 2]), eventosController.reportesEventosSinAño);
router.get('/reportes/:ano', authMiddleware([1, 2]), eventosController.reportesEventos);

module.exports = router;