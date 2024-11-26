const { Router } = require('express');
const cronometroController = require('../controllers/cronometro_controller');
const authMiddleware = require('../services/auth_middlewares');

const router = Router();

router.get('/cronometro/:id', authMiddleware([1, 2, 3]), cronometroController.mostrarCronometro);
router.post('/registrarCorredor', cronometroController.registrarCorredor);
router.get('/calcular_resultados/:eventoId', cronometroController.calcularResultados);

router.get('/descargar_pdf_5k/:idEvento', cronometroController.descargarPDF5K);
router.get('/descargar_pdf_10k/:idEvento', cronometroController.descargarPDF10K);

module.exports = router;