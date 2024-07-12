const router = new require('express').Router();
const cityController = require('../controllers/cityController');

router.get('/', cityController.getAll);

module.exports = router;