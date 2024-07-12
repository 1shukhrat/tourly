const auth = require('../middlewares/authMiddleware');
const hotelController = require('../controllers/hotelController');

const router = new require('express').Router();

router.get('/', hotelController.getHotels);
router.patch('/:id', auth('CONTENT_MANAGER'), hotelController.updateHotel);
router.post('/', auth('CONTENT_MANAGER'), hotelController.createHotel);
router.delete('/:id', auth('CONTENT_MANAGER'), hotelController.deleteHotel);

module.exports = router;