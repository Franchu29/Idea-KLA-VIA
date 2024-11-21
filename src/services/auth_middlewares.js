const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;
    
    if (!token) {
        return res.redirect('/'); // Redirige si no hay token
    }

    try {
        // Verificar y decodificar el token
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId; // Guardar el userId en req para su uso posterior
        next(); // Pasar al siguiente middleware o controlador
    } catch (error) {
        console.error('Error de autenticación:', error);
        res.redirect('/'); // Redirige si el token no es válido
    }
};

module.exports = authMiddleware;
