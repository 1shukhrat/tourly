const serviceController = require('../controllers/serviceController');
const auth = require('../middlewares/authMiddleware');

const router = new require('express').Router();

router.get('/', serviceController.getAll);
router.post('/', serviceController.create);

module.exports = router;
