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

//Muestra la vista de crear usuario
exports.createUserRender = (req, res) => {
    console.log('MOSTRANDO FORMULARIO DE CREACIÓN DE USUARIO');
    res.render('create_user.ejs');
};

//Crea un usuario
exports.createUser = async (req, res) => {
    try {
        console.log("CREANDO EL USUARIO:", req.body);

        const { nombre, apellido, email, fecha_nacimeinto, edad, contrasena, rolGeneralId } = req.body;

        // Convierte edad a un número entero
        const edadInt = parseInt(edad, 10);
        if (isNaN(edadInt)) {
            return res.status(400).json({ error: 'Edad debe ser un número entero válido' });
        }

        // Valida y convierte la fecha
        const fechaNacimiento = new Date(fecha_nacimeinto);
        if (isNaN(fechaNacimiento.getTime())) {
            return res.status(400).json({ error: 'Fecha de nacimiento inválida' });
        }

        const newUser = await prisma.user.create({
            data: {
                nombre,
                apellido,
                fecha_nacimeinto: fechaNacimiento, // Usa el objeto Date aquí
                edad: edadInt,
                email,
                contrasena,
                rolGeneral: {
                    connect: { id: parseInt(rolGeneralId, 10) }
                }
            }
        });

        res.redirect('/views_user');
    } catch (error) {
        console.error('Error al crear el usuario:', error);
        res.status(500).json({ error: 'Error al crear el usuario' });
    }
};

//Muestra la vista de ver usuarios
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

//Elimina un usuario
exports.deleteUser = async (req, res) => {
    try {
        console.log('ELIMINANDO USUARIO:', req.params);
        const { id } = req.params;

        const user = await prisma.user.delete({
            where: {
                id: parseInt(id, 10)
            }
        });

        res.redirect('/views_user');
    } catch (error) {
        console.error('Error al eliminar el usuario:', error);
        res.status(500).json({ error: 'Error al eliminar el usuario' });
    }
};

//Muestra la vista de editar usuario
exports.editUserRender = async (req, res) => {
    try {
        console.log('MOSTRANDO FORMULARIO DE EDICIÓN DE USUARIO:', req.params);
        const { id } = req.params;

        const user = await prisma.user.findUnique({
            where: {
                id: parseInt(id, 10)
            }
        });

        console.log('Datos del usuario:', user); // Verifica el valor aquí

        res.render('edit_user.ejs', { user }); 
    } catch (error) {
        console.error('Error al mostrar el formulario de edición de usuario:', error);
        res.status(500).json({ error: 'Error al mostrar el formulario de edición de usuario' });
    }
}

//Edita un usuario
exports.editUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, apellido, email, fecha_nacimeinto, edad, contrasena, rolGeneralId } = req.body;

        // Usa el valor directamente del req.body
        console.log('Valor de rolGeneralId:', rolGeneralId);

        // Convierte edad a un número entero
        const edadInt = parseInt(edad, 10);
        if (isNaN(edadInt)) {
            return res.status(400).json({ error: 'Edad debe ser un número entero válido' });
        }

        // Valida y convierte la fecha
        const fechaNacimiento = new Date(fecha_nacimeinto);
        if (isNaN(fechaNacimiento.getTime())) {
            return res.status(400).json({ error: 'Fecha de nacimiento inválida' });
        }

        const user = await prisma.user.update({
            where: {
                id: parseInt(id, 10)
            },
            data: {
                nombre,
                apellido,
                fecha_nacimeinto: fechaNacimiento, // Usa el objeto Date directamente
                edad: edadInt,
                email,
                contrasena,
                rolGeneral: {
                    connect: { id: parseInt(rolGeneralId, 10) }
                }
            }
        });

        console.log('USUARIO EDITADO:', user);

        res.redirect('/views_user');
    } catch (error) {
        console.error('Error al editar el usuario:', error);
        res.status(500).json({ error: 'Error al editar el usuario' });
    }
};

//Muestra el perfil del usuario
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

//Muestra la vista de roles
exports.showRolsRender = async (req, res) => {
    try {
        const roles = await prisma.roles.findMany();
        console.log("MOSTRANDO LOS ROLES:", roles);
        res.render('show_rols.ejs', { roles });
    } catch (error) {
        console.error('Error al obtener los roles:', error);
        res.status(500).json({ error: 'Error al obtener los roles' });
    }
};

//Muestra la vista de crear rol
exports.createRolRender = (req, res) => {
    console.log('MOSTRANDO FORMULARIO DE CREACIÓN DE ROL');
    res.render('create_rol.ejs');
};

//Crea un rol
exports.createRol = async (req, res) => {
    try {
        console.log("CREANDO EL ROL:",req.body);

        const { nombre, descripcion} = req.body;

        const newRol = await prisma.roles.create({
            data: {
                nombre,
                descripcion
            }
        });

        res.redirect('/show_rols_render');
    } catch (error) {
        console.error('Error al crear el usuario:', error);
        res.status(500).json({ error: 'Error al crear el usuario' });
    }
};