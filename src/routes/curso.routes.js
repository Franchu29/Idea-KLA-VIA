const express = require('express');
const { Router } = require('express');
const cursoController = require('../controllers/curso_controller');

const router = Router();

router.get('/renderCurso', cursoController.listarCursos);

router.get('/renderCrearCurso', cursoController.renderCrearCurso);
router.post('/crearCurso', cursoController.crearCurso);

router.post('/deleteCurso/:id', cursoController.deleteCurso);

module.exports = router;