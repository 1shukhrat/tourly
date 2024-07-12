const router = new require('express').Router();
const flightController = require('../controllers/flightController');
const auth = require('../middlewares/authMiddleware');

router.get('/', auth('CONTENT_MANAGER') ,flightController.getAllFlights);
router.get('/:id', auth('CONTENT_MANAGER'),flightController.getFlightById);
router.post('/', auth('CONTENT_MANAGER'),flightController.createFlight);
router.patch('/:id', auth('CONTENT_MANAGER'),flightController.updateFlight);
router.delete('/:id', auth('CONTENT_MANAGER'),flightController.deleteFlight);

module.exports = router;