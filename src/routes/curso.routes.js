const express = require('express');
const { Router } = require('express');
const cursoController = require('../controllers/curso_controller');
const authMiddleware = require('../services/auth_middlewares');

const router = Router();

router.get('/renderCurso', authMiddleware([1, 2, 5]) , cursoController.listarCursos);

router.get('/renderCrearCurso', authMiddleware([1, 2, 5]) , cursoController.renderCrearCurso);
router.post('/crearCurso', authMiddleware([1, 2, 5]) , cursoController.crearCurso);

router.post('/deleteCurso/:id', authMiddleware([1, 2, 5]) , cursoController.deleteCurso);

module.exports = router;