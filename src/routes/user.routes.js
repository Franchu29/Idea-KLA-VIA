const { Router } = require('express');
const userController = require('../controllers/user_controller');

const router = Router();

router.get('/', userController.renderIndex);

router.get('/inicio', userController.inicio);

router.get('/create_user_render', userController.createUserRender);
router.post('/create_user', userController.createUser);

router.get('/views_user', userController.views_user);

module.exports = router;
