const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.renderAsignatura = async (req, res) => {
    try {
        const asignaturas = await prisma.asignatura.findMany({
        });
        res.render('asignaturas', { asignaturas });
    } catch (error) {
        console.error('Error al obtener las asignaturas:', error);
        res.status(500).send('Error interno del servidor');
    }
}
exports.createAsignaturaRender = (req, res) => {
    res.render('create_asignatura');
}

exports.createAsignatura = async (req, res) => {
    const { nombre, descripcion } = req.body;
    try {
        const asignatura = await prisma.asignatura.create({
            data: {
                nombre,
                descripcion,
            },
        });
        console.log('Asignatura creada:', asignatura);
        res.redirect('renderAsignatura'); // Redirige a la lista de asignaturas después de crear una nueva
    } catch (error) {
        console.error('Error al crear la asignatura:', error);
        res.status(500).send('Error interno del servidor');
    }
}

exports.editAsignaturaRender = async (req, res) => {
    const { id } = req.params;
    try {
        const asignaturas = await prisma.asignatura.findUnique({
            where: { id: parseInt(id) },
        });
        if (!asignaturas) {
            return res.status(404).send('Asignatura no encontrada');
        }
        res.render('edit_asignatura', { asignaturas });
    } catch (error) {
        console.error('Error al obtener la asignatura:', error);
        res.status(500).send('Error interno del servidor');
    }
}

exports.editAsignatura = async (req, res) => {
    console.log('Editando asignatura...');
    const { id } = req.params;
    const { nombre, descripcion } = req.body;
    try {
        const asignaturas = await prisma.asignatura.update({
            where: { id: parseInt(id) },
            data: {
                nombre,
                descripcion,
            },
        });
        console.log('Asignatura actualizada:', asignaturas);
        res.redirect('/renderAsignatura'); // Redirige a la lista de asignaturas después de editar
    } catch (error) {
        console.error('Error al actualizar la asignatura:', error);
        res.status(500).send('Error interno del servidor');
    }
}

exports.deleteAsignatura = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.asignatura.delete({
            where: { id: parseInt(id) },
        });
        console.log('Asignatura eliminada:', id);
        res.redirect('/asignatura/renderAsignatura');
    } catch (error) {
        console.error('Error al eliminar la asignatura:', error);
        res.status(500).send('Error interno del servidor');
    }
}