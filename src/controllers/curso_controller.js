const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.listarCursos = async (req, res) => {
  try {
    const cursos = await prisma.curso.findMany({
      include: { colegio: true }
    });
    res.render('cursos', { cursos });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al listar los cursos');
  }
};

exports.renderCrearCurso = async (req, res) => {
    try {
        const colegios = await prisma.colegio.findMany();
        res.render('create_curso', { colegios });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al cargar la página de creación de curso');
    }
}

exports.crearCurso = async (req, res) => {
  console.log(req.body);
    try {
        const { nombre, nivel, colegioId } = req.body;
        await prisma.curso.create({
            data: {
                nombre,
                nivel,
                colegioId: parseInt(colegioId)
            }
        });
        res.redirect('renderCurso');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al crear el curso');
    }
}

exports.deleteCurso = async (req, res) => {
  console.log(req.body);
    try {
        const { id } = req.params;
        await prisma.curso.delete({
            where: { id: parseInt(id) }
        });
        res.redirect('renderCurso');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al eliminar el curso');
    }
}