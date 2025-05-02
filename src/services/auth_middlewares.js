const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = (requiredRoles = []) => {
    return async (req, res, next) => {
        const token = req.cookies.token;

        if (!token) {
            console.error('Token no encontrado. Redirigiendo...');
            return res.redirect('/');
        }

        try {
            const decoded = jwt.verify(token, JWT_SECRET);

            req.userId = decoded.usuarioId;
            req.userEmail = decoded.email;
            req.userRole = decoded.role;

            // Validar roles si se especifican
            if (requiredRoles.length > 0 && !requiredRoles.includes(decoded.role)) {
                console.warn(`Acceso denegado para rol: ${decoded.role}`);
                return res.status(403).send('Acceso denegado');
            }

            // Obtener nombre del usuario y nombre del rol desde la DB
            const user = await prisma.usuario.findUnique({
                where: { id: decoded.usuarioId },
                include: { rol: true },
            });

            if (user) {
                // Esto estará disponible en todas las vistas EJS
                res.locals.userName = user.nombre;
                res.locals.userRoleName = user.rol.nombre;

                // También útil en controladores
                req.user = user;
            }

            next();
        } catch (error) {
            console.error('Error al verificar el token:', error);
            res.redirect('/');
        }
    };
};

module.exports = authMiddleware;
