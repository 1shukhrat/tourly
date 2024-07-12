const router = new require('express').Router();
const countryController = require('../controllers/countryController');

router.get('/', countryController.getAll);

module.exports = router;