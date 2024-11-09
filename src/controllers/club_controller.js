// club_controller.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Renderiza el formulario de clubes
exports.renderClub = (req, res) => {
    console.log('MOSTRANDO FORMULARIO DE CREACIÓN DE CLUBES');
    res.render('create_club.ejs');
};

// Configuración de Multer para almacenar la imagen en "uploads/images_club"
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads/images_club'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// Lógica para crear un club
exports.createClub = [
    upload.single('imagen'), // Middleware de multer para procesar la imagen
    async (req, res) => {
        console.log("Formulario recibido: ", req.body);
        const { nombre } = req.body;

        try {
            // Crear el club en la base de datos sin la imagen
            const nuevoClub = await prisma.clubes.create({
                data: {
                    nombre,
                },
            });

            const clubId = nuevoClub.id;

            // Si hay una imagen, renombrarla con el ID del club
            if (req.file) {
                const oldPath = path.join(__dirname, '../uploads/images_club', req.file.filename);
                const newFileName = `club_${clubId}${path.extname(req.file.filename)}`;
                const newPath = path.join(__dirname, '../uploads/images_club', newFileName);

                // Renombrar la imagen en el sistema de archivos
                fs.rename(oldPath, newPath, (err) => {
                    if (err) {
                        console.error('Error al renombrar la imagen:', err);
                    }
                });
            }

            res.redirect('/club/show_club');
        } catch (error) {
            console.error('Error al crear el club:', error);
            res.status(500).send('Error al crear el club');
        }
    }
];

exports.getClubes = async (req, res) => {
    console.log('OBTENIENDO CLUBES');
    try {
        const clubes = await prisma.clubes.findMany();
        res.render('ver_clubes.ejs', { clubes });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener los clubes');
    }
};

exports.borrarClub = async (req, res) => {
    try {
        console.log('ELIMINANDO CLUB:', req.params);
        const { id } = req.params;

        // Elimina el club
        const club = await prisma.clubes.delete({
            where: {
                id: parseInt(id, 10)  // Asegúrate de que id es un número
            }
        });

        // Redirige a la lista de clubes tras la eliminación
        res.redirect('/club/show_club'); // Asegúrate que la ruta sea correcta
    } catch (error) {
        console.error('Error al eliminar el club:', error);
        res.status(500).json({ error: 'Error al eliminar el club' });
    }
};

exports.editClubRender = async (req, res) => {
    try {
        console.log('MOSTRANDO FORMULARIO DE EDICIÓN DE CLUB:', req.params);
        const { id } = req.params;

        // Buscar el club por su id
        const club = await prisma.clubes.findUnique({
            where: {
                id: parseInt(id, 10)  // Asegúrate de que el id esté siendo parseado correctamente
            }
        });

        console.log('Datos del club:', club); // Verifica los datos del club

        // Renderiza la vista de edición, pasando los datos del club
        res.render('edit_club.ejs', { club });
    } catch (error) {
        console.error('Error al mostrar el formulario de edición de club:', error);
        res.status(500).json({ error: 'Error al mostrar el formulario de edición de club' });
    }
};

exports.updateClub = async (req, res) => {
    try {
        console.log('ACTUALIZANDO CLUB:', req.params);
        const { id } = req.params;
        const { nombre } = req.body; // Otras propiedades si las agregas

        // Actualizar el club en la base de datos
        const updatedClub = await prisma.clubes.update({
            where: {
                id: parseInt(id, 10)
            },
            data: {
                nombre: nombre,
                // Otros campos si es necesario
            }
        });

        console.log('Club actualizado:', updatedClub);

        // Redirigir a la vista de clubes después de la actualización
        res.redirect('/club/show_club');
    } catch (error) {
        console.error('Error al actualizar el club:', error);
        res.status(500).json({ error: 'Error al actualizar el club' });
    }
};

exports.inspeccionarClub = async (req, res) => {
    try {
        console.log('MOSTRANDO DETALLES DEL CLUB:', req.params);
        const { id } = req.params;

        // Buscar el club por su ID
        const club = await prisma.clubes.findUnique({
            where: {
                id: parseInt(id, 10)
            }
        });

        if (!club) {
            return res.status(404).send('Club no encontrado');
        }

        console.log('Datos del club:', club); // Verifica los datos del club

        // Renderiza la vista con los datos del club
        res.render('inspeccionar_club.ejs', { club });
    } catch (error) {
        console.error('Error al inspeccionar el club:', error);
        res.status(500).json({ error: 'Error al inspeccionar el club' });
    }
};
