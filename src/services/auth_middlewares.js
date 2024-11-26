const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = (requiredRoles = []) => {
    return (req, res, next) => {
        const token = req.cookies.token;

        if (!token) {
            console.error('Token no encontrado. Redirigiendo...');
            return res.redirect('/'); // Redirige si no hay token
        }

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.userId = decoded.userId; // Almacena el ID del usuario
            req.userRole = decoded.role; // Almacena el rol del usuario

            // Verifica si el rol del usuario está permitido
            if (requiredRoles.length > 0 && !requiredRoles.includes(decoded.role)) {
                console.warn(`Acceso denegado para rol: ${decoded.role}`);
                return res.status(403).send('Acceso denegado');
            }

            next(); // Pasa al siguiente middleware o controlador
        } catch (error) {
            console.error('Error al verificar el token:', error);
            res.redirect('/'); // Redirige si el token no es válido
        }
    };
};

module.exports = authMiddleware;
