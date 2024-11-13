// Importa Prisma Client para interactuar con la base de datos
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.renderIndex = (req, res) => {
    res.clearCookie('token');
    console.log('MOSTRANDO LOGIN');
    res.render('index.ejs');
};

exports.login = async (req, res) => {
    const { email, contrasena } = req.body;
    console.log('Contraseña recibida:', contrasena);

    try {
        // Buscar el usuario por email
        const user = await prisma.user.findUnique({
            where: { email: email },
        });

        if (!user) {
            console.log('Usuario no encontrado');
            return res.render('index.ejs', { errorMessage: 'Usuario no encontrado' });
        }

        // Verificar la contraseña
        const validContrasena = await bcrypt.compare(contrasena, user.contrasena);
        console.log('Contraseña cifrada en la base de datos:', user.contrasena);
        console.log('Contraseña comparada:', validContrasena);

        if (!validContrasena) {
            console.log('Contraseña incorrecta');
            return res.render('index.ejs', { errorMessage: 'Contraseña incorrecta' });
        }

        // Generar el token JWT
        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );
        console.log('JWT generado:', token);

        // Almacena el token en cookies y redirige al inicio
        res.cookie('token', token, { httpOnly: true }); // Asegúrate de tener httpOnly para mayor seguridad
        res.redirect('/inicio'); // Asegúrate de que esta ruta esté configurada en tu servidor

    } catch (error) {
        console.error('Error en el proceso de login:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
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

// Función para calcular la edad a partir de la fecha de nacimiento
function calcularEdad(fechaNacimiento) {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();

    // Ajusta la edad si el cumpleaños aún no ha ocurrido este año
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
    }

    return edad;
}

//Crea un usuario
exports.createUser = async (req, res) => {
    try {
        console.log("CREANDO EL USUARIO:", req.body);

        const { nombre, apellido, email, fecha_nacimiento, contrasena, rolGeneralId } = req.body;

        // Valida y convierte la fecha de nacimiento
        const fechaNacimiento = new Date(fecha_nacimiento);
        if (isNaN(fechaNacimiento.getTime())) {
            return res.status(400).json({ error: 'Fecha de nacimiento inválida' });
        }

        // Calcula la edad en base a la fecha de nacimiento
        const edad = calcularEdad(fechaNacimiento);
        console.log('Edad calculada:', edad);

        // Cifra la contraseña antes de guardarla
        const hashedPassword = await bcrypt.hash(contrasena, 10);

        const newUser = await prisma.user.create({
            data: {
                nombre,
                apellido,
                fecha_nacimiento: fechaNacimiento, // Guarda la fecha de nacimiento como objeto Date
                edad, // Guarda la edad calculada
                email,
                contrasena: hashedPassword, // Guarda la contraseña cifrada
                rolGeneral: {
                    connect: { id: parseInt(rolGeneralId, 10) }
                }
            }
        });

        res.redirect('/');
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
        const { id } = req.params;

        // Obtiene los roles y clubes disponibles
        const roles = await prisma.roles.findMany();
        const clubs = await prisma.clubes.findMany();

        const user = await prisma.user.findUnique({
            where: {
                id: parseInt(id, 10)
            }
        });

        // Renderiza la vista pasando tanto los datos del usuario, roles y clubes
        res.render('edit_user.ejs', { user, roles, clubs });
    } catch (error) {
        console.error('Error al mostrar el formulario de edición de usuario:', error);
        res.status(500).json({ error: 'Error al mostrar el formulario de edición de usuario' });
    }
}

//Edita un usuario
exports.editUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, apellido, email, fecha_nacimiento, edad, contrasena, rolGeneralId, clubId } = req.body;

        // Muestra los valores recibidos del formulario
        console.log('Valor de rolGeneralId:', rolGeneralId);
        console.log('Valor de clubId:', clubId);  

        // Convierte edad a un número entero
        const edadInt = parseInt(edad, 10);
        if (isNaN(edadInt)) {
            return res.status(400).json({ error: 'Edad debe ser un número entero válido' });
        }

        // Valida y convierte la fecha
        const fechaNacimiento = new Date(fecha_nacimiento);
        if (isNaN(fechaNacimiento.getTime())) {
            return res.status(400).json({ error: 'Fecha de nacimiento inválida' });
        }

        // Si la contraseña está vacía, no la actualices
        let updatedData = {
            nombre,
            apellido,
            fecha_nacimiento: fechaNacimiento,
            edad: edadInt,
            email,
            rolGeneral: {
                connect: { id: parseInt(rolGeneralId, 10) }
            },
            club: clubId ? { connect: { id: parseInt(clubId, 10) } } : { disconnect: true }
        };

        // Si el campo de contraseña tiene un valor, encripta la nueva contraseña
        if (contrasena && contrasena.trim() !== '') {
            const hashedPassword = await bcrypt.hash(contrasena, 10);
            updatedData.contrasena = hashedPassword;  // Solo actualiza la contraseña si es proporcionada
        }

        // Realiza la actualización
        const user = await prisma.user.update({
            where: { id: parseInt(id, 10) },
            data: updatedData
        });

        console.log('USUARIO EDITADO:', user);

        // Redirige al usuario después de la actualización
        res.redirect('/views_user');
    } catch (error) {
        console.error('Error al editar el usuario:', error);
        res.status(500).json({ error: 'Error al editar el usuario' });
    }
};

//Muestra el perfil del usuario
exports.mostrarPerfil = async (req, res) => {
    try {
        const userId = req.userId; // Obtener el userId del req (establecido por el middleware)

        // Obtener los datos del usuario desde la base de datos, incluyendo el rol y el club
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                rolGeneral: true, // Incluir el rol del usuario
                club: true,       // Incluir el club al que pertenece el usuario (si tiene)
            },
        });

        if (!user) {
            return res.render('index.ejs', { errorMessage: 'Usuario no encontrado' });
        }

        // Obtener las inscripciones del usuario
        const inscripciones = await prisma.inscripcion.findMany({
            where: { usuarioId: userId },
            include: {
                evento: true, // Obtener los detalles del evento
                categoria: true, // Obtener los detalles de la categoría
                distancia: true, // Obtener los detalles de la distancia
            },
        });

        // Obtener los resultados de las inscripciones del usuario
        const resultados = await prisma.resultados.findMany({
            where: { usuarioId: userId },
            include: {
                evento: true, // Obtener los detalles del evento, incluyendo la fecha
            },
        });

        // Calcular la suma de los puntajes agrupados por año
        const puntajesPorAno = resultados.reduce((acumulado, resultado) => {
            const anoEvento = new Date(resultado.evento.fecha).getFullYear();
            if (resultado.puntaje !== null) {
                if (!acumulado[anoEvento]) {
                    acumulado[anoEvento] = 0;
                }
                acumulado[anoEvento] += resultado.puntaje;
            }
            return acumulado;
        }, {});

        // Renderizar la vista de perfil con los datos del usuario, inscripciones, resultados y puntajes agrupados por año
        res.render('perfil.ejs', { user, inscripciones, resultados, puntajesPorAno });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en el servidor' });
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
