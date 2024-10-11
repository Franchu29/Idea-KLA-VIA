const { Router } = require('express');
const cronometroController = require('../controllers/cronometro_controller');

const router = Router();

router.get('/cronometro/:id', cronometroController.mostrarCronometro);
router.post('/registrar', cronometroController.registrarCorredor);
router.get('/calcular_resultados/:eventoId', cronometroController.calcularResultados);

module.exports = router;