const { Router } = require('express');
const userController = require('../controllers/user_controller');
const authMiddleware = require('../services/auth_middlewares');

const router = Router();

router.get('/', userController.renderLanding);

router.get('/login', userController.renderIndex);
router.post('/auth_login', userController.login);

router.get('/inicio', authMiddleware([1, 2, 3, 5]) , userController.inicio);

//Rutas de Crear Usuario
router.get('/create_user_render', authMiddleware([1, 2, 5]) , userController.createUserRender);
router.post('/create_user', userController.createUser);

//Rutas de Ver Usuarios
router.get('/views_user', authMiddleware([1, 2, 5]) , userController.views_user);

//Rutas de Eliminar Usuario
router.post('/delete_user/:id', authMiddleware([1, 2, 5]) , userController.deleteUser);

//Rutas de Editar Usuario
router.get('/edit_user_render/:id', authMiddleware([1, 2, 5]), userController.editUserRender);
router.post('/edit_user/:id', userController.editUser);

//Mi perfil
router.get('/perfil', authMiddleware([1, 2, 5]), userController.mostrarPerfil);


//Ruta para recuperar contraseña
router.post('/recuperar_contrasena', userController.recuperarContrasena);
router.get('/recuperar/:token', userController.mostrarFormularioRecuperacion);
router.post('/actualizar_contrasena', userController.actualizarContrasena);

// Ruta para enviar el correo de actualización de rol
router.post('/enviar_correo_cambio_rol', userController.enviarCorreoCambioRol);

module.exports = router;
