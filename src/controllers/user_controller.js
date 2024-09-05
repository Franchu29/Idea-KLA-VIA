// Importa Prisma Client para interactuar con la base de datos
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.renderIndex = (req, res) => {
    res.render('index.ejs');
};

exports.inicio = (req, res) => {
    res.render('inicio.ejs');
};

exports.createUserRender = (req, res) => {
    console.log('Hola');
    res.render('create_user.ejs');
};

exports.createUser = async (req, res) => {
    try {
        console.log(req.body);

        const { nombre, apellido, email, fecha_naciemiento, edad, contrasena } = req.body;

        // Convierte edad a un número entero
        const edadInt = parseInt(edad, 10);
        if (isNaN(edadInt)) {
            return res.status(400).json({ error: 'Edad debe ser un número entero válido' });
        }

        const newUser = await prisma.user.create({
            data: {
                nombre,
                apellido,
                fecha_naciemiento: new Date(fecha_naciemiento),
                edad: edadInt, // Usa el número entero
                email,
                contrasena
            }
        });

        res.json(newUser);
    } catch (error) {
        console.error('Error al crear el usuario:', error);
        res.status(500).json({ error: 'Error al crear el usuario' });
    }
};

exports.views_user = async (req, res) => {
    try {
        const users = await prisma.user.findMany();
        console.log("----", users);
        res.render('views_user.ejs', { users });
    } catch (error) {
        console.error('Error al obtener los usuarios:', error);
        res.status(500).json({ error: 'Error al obtener los usuarios' });
    }
};