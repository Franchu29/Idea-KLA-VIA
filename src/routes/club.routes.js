const { Router } = require('express');
const clubController = require('../controllers/club_controller');
const authMiddleware = require('../services/auth_middlewares');

const router = Router();

router.get('/render_club', authMiddleware([1, 2, 3]), clubController.renderClub);
router.post('/create_club', authMiddleware([1, 2, 3]), clubController.createClub);

router.get('/show_club', authMiddleware([1, 2, 3]), clubController.getClubes);

router.post('/delete_club/:id', authMiddleware([1, 2]), clubController.borrarClub);

router.get('/edit_club/:id', authMiddleware([1, 2, 3]), clubController.editClubRender);
router.post('/update_club/:id', authMiddleware([1, 2, 3]), clubController.updateClub);

router.get('/inspeccionar_club/:id', authMiddleware([1, 2, 3]), clubController.inspeccionarClub);

router.post('/unirseClub/:id', authMiddleware([1, 2, 3]), clubController.unirseClub);
router.post('/desligarse/:id', authMiddleware([1, 2, 3]), clubController.desligarseDelClub);

module.exports = router;