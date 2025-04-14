const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.createColegioRender = (req, res) => {
    res.render('create_colegio');
}

exports.createColegio = async (req, res) => {
    const { nombre, direccion, telefono, email } = req.body;

    try {
        const colegio = await prisma.colegio.create({
            data: {
                nombre,
                direccion,
                telefono,
                email,
            },
        });
        res.redirect('renderColegio');
    } catch (error) {
        console.error('Error al crear el colegio:', error);
        res.status(500).send('Error interno del servidor');
    }
}

exports.renderColegio = async (req, res) => {
    try {
        const colegio = await prisma.colegio.findMany({
        });
        res.render('colegio', { colegio });
    } catch (error) {
        console.error('Error al obtener los colegios:', error);
        res.status(500).send('Error interno del servidor');
    }
}

exports.deleteColegio = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.colegio.delete({
            where: {
                id: Number(id),
            },
        });
        res.redirect('/colegio/renderColegio');
    } catch (error) {
        console.error('Error al eliminar el colegio:', error);
        res.status(500).send('Error interno del servidor');
    }
}