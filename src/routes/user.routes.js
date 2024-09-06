const { Router } = require('express');
const userController = require('../controllers/user_controller');

const router = Router();

router.get('/', userController.renderIndex);

router.get('/inicio', userController.inicio);

//Rutas de Crear Usuario
router.get('/create_user_render', userController.createUserRender);
router.post('/create_user', userController.createUser);

//Rutas de Ver Usuarios
router.get('/views_user', userController.views_user);

//Rutas de Eliminar Usuario
router.post('/delete_user/:id', userController.deleteUser);

//Rutas de Editar Usuario
router.get('/edit_user_render/:id', userController.editUserRender);
router.post('/edit_user/:id', userController.editUser);

//Mi perfil
router.get('/perfil/:id', userController.getProfile);

module.exports = router;
