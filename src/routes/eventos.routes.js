const { Router } = require('express');
const eventosController = require('../controllers/eventos_controller'); // Asegúrate de usar el nombre correcto

const router = Router();

// Ruta para renderizar el formulario de creación de eventos
router.get('/render_events', eventosController.renderEvents);

// Ruta para crear un evento
router.post('/create_event', eventosController.createEvent);

// Ruta para obtener todos los eventos
router.get('/render_event', eventosController.getEvents);

module.exports = router;
