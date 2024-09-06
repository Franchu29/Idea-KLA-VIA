// Importa Prisma Client para interactuar con la base de datos
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.renderIndex = (req, res) => {
    console.log('MOSTRANDO LOGIN');
    res.render('index.ejs');
};

exports.inicio = (req, res) => {
    console.log('MOSTRANDO INICIO');
    res.render('inicio.ejs');
};

exports.createUserRender = (req, res) => {
    console.log('MOSTRANDO FORMULARIO DE CREACIÓN DE USUARIO');
    res.render('create_user.ejs');
};

exports.createUser = async (req, res) => {
    try {
        console.log("CREANDO EL USUARIO:",req.body);

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
        console.log("MOSTRANDO LOS USUARIOS:", users);
        res.render('views_user.ejs', { users });
    } catch (error) {
        console.error('Error al obtener los usuarios:', error);
        res.status(500).json({ error: 'Error al obtener los usuarios' });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        console.log('ELIMINANDO USUARIO:', req.params);
        const { id } = req.params;

        const user = await prisma.user.delete({
            where: {
                id: parseInt(id, 10)
            }
        });

        res.json(user);
    } catch (error) {
        console.error('Error al eliminar el usuario:', error);
        res.status(500).json({ error: 'Error al eliminar el usuario' });
    }
};

exports.editUserRender = async (req, res) => {
    try {
        console.log('MOSTRANDO FORMULARIO DE EDICIÓN DE USUARIO:', req.params);
        const { id } = req.params;

        const user = await prisma.user.findUnique({
            where: {
                id: parseInt(id, 10)
            }
        });

        res.render('edit_user.ejs', { user });
    } catch (error) {
        console.error('Error al mostrar el formulario de edición de usuario:', error);
        res.status(500).json({ error: 'Error al mostrar el formulario de edición de usuario' });
    }
}

exports.editUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, apellido, email, fecha_naciemiento, edad, contrasena } = req.body;

        // Convierte edad a un número entero
        const edadInt = parseInt(edad, 10);
        if (isNaN(edadInt)) {
            return res.status(400).json({ error: 'Edad debe ser un número entero válido' });
        }

        const user = await prisma.user.update({
            where: {
                id: parseInt(id, 10)
            },
            data: {
                nombre,
                apellido,
                fecha_naciemiento: new Date(fecha_naciemiento),
                edad: edadInt, // Usa el número entero
                email,
                contrasena
            }
        });

        console.log('USUARIO EDITADO:', user);

        // Redirige a la vista o ruta deseada
        res.redirect('/views_user'); // Cambia esta ruta a la que necesites
    } catch (error) {
        console.error('Error al editar el usuario:', error);
        res.status(500).json({ error: 'Error al editar el usuario' });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const { id } = req.params;

        // Obtener el usuario por su ID
        const user = await prisma.user.findUnique({
            where: { id: parseInt(id, 10) }
        });

        if (!user) {
            return res.status(404).send('Usuario no encontrado');
        }

        // Renderizar la vista del perfil con los datos del usuario
        res.render('mi_perfil', { user });
    } catch (error) {
        console.error('Error al obtener el perfil del usuario:', error);
        res.status(500).send('Error al obtener el perfil del usuario');
    }
};
