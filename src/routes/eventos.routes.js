const { Router } = require('express');
const eventosController = require('../controllers/eventos_controller');

const router = Router();

// Ruta para renderizar el formulario de creación de eventos
router.get('/render_events', eventosController.renderEvents);

// Ruta para crear un evento
router.post('/create_event', eventosController.createEvent);

// Ruta para obtener todos los eventos
router.get('/show_event', eventosController.getEvents);

router.post('/delete_event/:id', eventosController.deleteEvento);

router.get('/edit_event/:id', eventosController.editEventoRender);
router.post('/edit_event/:id', eventosController.editEvento);

router.get('/inspeccionar_evento/:id', eventosController.inspeccionarEvento);
router.get('/participantes_cortesia/:id', eventosController.renderParticipantesCortesia);

router.post('/inscribir_participantes/:id', eventosController.inscribirParticipantes);

router.get('/render_distancias', eventosController.renderDistancias);
router.post('/create_distancias', eventosController.createDistancias)
router.get('/ver_distancias', eventosController.getDistancias)

router.post('/delete_distancia/:id', eventosController.deleteDistancia);
router.get('/edit_render_distancia/:id', eventosController.editDistanciaRender)
router.post('/edit_distancia/:id', eventosController.editDistancia);

module.exports = router;