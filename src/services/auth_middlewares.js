const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = (requiredRoles = []) => {
    return (req, res, next) => {
        const token = req.cookies.token;

        if (!token) {
            console.error('Token no encontrado. Redirigiendo...');
            return res.redirect('/');
        }

        try {
            const decoded = jwt.verify(token, JWT_SECRET);

            // Coincide con los nombres del JWT
            req.userId = decoded.usuarioId;
            req.userEmail = decoded.email;
            req.userRole = decoded.role;

            // Validar roles si se especifican
            if (requiredRoles.length > 0 && !requiredRoles.includes(decoded.role)) {
                console.warn(`Acceso denegado para rol: ${decoded.role}`);
                return res.status(403).send('Acceso denegado');
            }

            next();
        } catch (error) {
            console.error('Error al verificar el token:', error);
            res.redirect('/');
        }
    };
};

module.exports = authMiddleware;
