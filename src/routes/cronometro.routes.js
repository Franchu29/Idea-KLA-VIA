const { Router } = require('express');
const cronometroController = require('../controllers/cronometro_controller');

const router = Router();

router.get('/cronometro/:id', cronometroController.mostrarCronometro);
router.post('/registrar', cronometroController.registrarCorredor);
router.get('/calcular_resultados/:eventoId', cronometroController.calcularResultados);

router.get('/descargar_pdf_5k/:idEvento', cronometroController.descargarPDF5K);
router.get('/descargar_pdf_10k/:idEvento', cronometroController.descargarPDF10K);

module.exports = router;