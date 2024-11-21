const { Router } = require('express');
const clubController = require('../controllers/club_controller');
const authMiddleware = require('../services/auth_middlewares');

const router = Router();

router.get('/render_club', clubController.renderClub);
router.post('/create_club', clubController.createClub);

router.get('/show_club', clubController.getClubes);

router.post('/delete_club/:id', clubController.borrarClub);

router.get('/edit_club/:id', clubController.editClubRender);
router.post('/update_club/:id', clubController.updateClub);

router.get('/inspeccionar_club/:id', clubController.inspeccionarClub);

router.post('/unirseClub/:id', authMiddleware, clubController.unirseClub);
router.post('/desligarse/:id', authMiddleware, clubController.desligarseDelClub);

module.exports = router;