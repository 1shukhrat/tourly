const router = new require('express').Router();
const tourController = require('../controllers/tourController');
const requestController = require('../controllers/requestController');

const auth = require('../middlewares/authMiddleware');

router.get('/', tourController.getTours);
router.get('/:id', tourController.getTour);
router.post('/:id/book', auth('USER'), requestController.create);
router.post('/', auth('CONTENT_MANAGER'), tourController.createTour);
router.patch('/:id', auth('CONTENT_MANAGER'), tourController.updateTour);
router.delete('/:id', auth('CONTENT_MANAGER'), tourController.deleteTour);


module.exports = router;
